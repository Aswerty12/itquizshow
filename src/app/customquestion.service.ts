import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, getDoc, doc } from '@angular/fire/firestore';
import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as Papa from 'papaparse';
import { Question } from './question';

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
      Papa.parse(csvData, {
        header: true,
        complete: (results: Papa.ParseResult<Question>) => {
          if (results.errors.length > 0) {
            console.error('Parsing errors:', results.errors);
            reject(new Error('Error parsing CSV data'));
          } else {
            resolve(results.data);
          }
        },
      });
    });
  }

  private async storeQuestions(questions: Question[], questionSetName: string): Promise<void> {
    const data = { questions, name: questionSetName };
    const questionSetsCollection = collection(this.firestore, 'questionSets');
    const questionSetRef = await addDoc(questionSetsCollection, data);
    console.log(`Question set "${questionSetName}" saved with ID: ${questionSetRef.id}`);
  }

  loadQuestions(questionSetId: string): Observable<Question[]> {
    const docRef = doc(this.firestore, 'questionSets', questionSetId);
    return from(getDoc(docRef)).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          return docSnapshot.data()?.['questions'] as Question[];
        } else {
          throw new Error(`Question set with ID ${questionSetId} not found`);
        }
      }),
      catchError(error => throwError(() => error))
    );
  }

  getQuestionSetIds(): Observable<string[]> {
    const questionSetsCollection = collection(this.firestore, 'questionSets');
    return from(getDocs(questionSetsCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => doc.id)),
      catchError(error => throwError(() => error))
    );
  }
}