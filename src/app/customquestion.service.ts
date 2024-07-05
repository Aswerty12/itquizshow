import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, getDoc, doc, query } from '@angular/fire/firestore';
import { from, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import * as Papa from 'papaparse';
import { Question } from './question';

interface QuestionSet {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomQuestionService {
  private firestore = inject(Firestore);

  uploadQuestions(file: File, questionSetName = 'Untitled Question Set'): Observable<void> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        try {
          if (event.target && typeof event.target.result === 'string') {
            const questions = await this.parseCSV(event.target.result);
            await this.storeQuestions(questions, questionSetName);
            observer.next();
            observer.complete();
          } else {
            observer.error(new Error('Invalid file content'));
          }
        } catch (error) {
          observer.error(error);
        }
      };
      reader.onerror = error => observer.error(error);
      reader.readAsText(file);
    });
  }

  private parseCSV(csvData: string): Promise<Question[]> {
    return new Promise((resolve, reject) => {
      Papa.parse<Partial<Question>>(csvData, {
        header: true,
        transformHeader: (header: string) => header.toLowerCase(),
        complete: (results: Papa.ParseResult<Partial<Question>>) => {
          if (results.errors.length > 0) {
            console.error('Parsing errors:', results.errors);
            results.errors.forEach(error => {
              console.error(`Error on row ${error.row}: ${error.message}`);
            });
            reject(new Error('Error parsing CSV data: ' + results.errors[0].message));
          } else if (results.data.length === 0) {
            reject(new Error('No data found in CSV file'));
          } else {
            console.log('CSV parsing successful. Sample data:', results.data[0]);
            const validatedQuestions = this.validateQuestions(results.data);
            resolve(validatedQuestions);
          }
        },
        error: (error: Error, file?: Papa.LocalFile) => {
          console.error('Papa Parse error:', error);
          reject(new Error('Error parsing CSV: ' + error.message));
        },
      });
    });
  }

  private validateQuestions(data: any[]): Question[] {
    const validQuestions: Question[] = [];
    const validLevels = ['EASY', 'AVERAGE', 'DIFFICULT', 'CLINCHER'];

    data.forEach((item, index) => {
      if (!item.question || !item.answer || !item.level || !item.category) {
        console.warn(`Row ${index + 1}: Missing required fields`);
        return;
      }

      if (!validLevels.includes(item.level.toUpperCase())) {
        console.warn(`Row ${index + 1}: Invalid level "${item.level}"`);
        return;
      }

      validQuestions.push({
        question: item.question,
        answer: item.answer,
        level: item.level.toUpperCase() as 'EASY' | 'AVERAGE' | 'DIFFICULT' | 'CLINCHER',
        category: item.category
      });
    });

    console.log(`Validated ${validQuestions.length} out of ${data.length} questions`);
    return validQuestions;
  }

  private async storeQuestions(questions: Question[], questionSetName: string): Promise<string> {
    const data = { questions, name: questionSetName };
    const questionSetsCollection = collection(this.firestore, 'questionSets');
    const questionSetRef = await addDoc(questionSetsCollection, data);
    console.log(`Question set "${questionSetName}" saved with ID: ${questionSetRef.id}`);
    return questionSetRef.id;
  }

  loadQuestions(questionSetId: string): Observable<any[]> {
    console.log('loadQuestions called with id:', questionSetId);
    const docRef = doc(this.firestore, 'questionSets', questionSetId);

    return from(getDoc(docRef)).pipe(
      tap(docSnap => console.log('Document exists:', docSnap.exists())),
      map(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Document data:', data);
          return data['questions'] || [];
        } else {
          console.log('No such document!');
          return [];
        }
      }),
      tap(questions => console.log('Mapped questions:', questions)),
      catchError(error => {
        console.error('Error in loadQuestions:', error);
        throw error;
      })
    );
  }

  getQuestionSets(): Observable<QuestionSet[]> {
    const questionSetsCollection = collection(this.firestore, 'questionSets');
    return from(getDocs(questionSetsCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data()['name'] || 'Unnamed Set'
      }))),
      catchError(error => throwError(() => error))
    );
  }
}