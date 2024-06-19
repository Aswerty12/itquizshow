import { Injectable } from '@angular/core';
import * as firebase from "firebase/app"
import { initializeApp } from '@angular/fire/app';
import { getFirestore, Firestore, collection, addDoc, getDocs, getDoc, doc, DocumentData } from 'firebase/firestore';
import * as Papa from 'papaparse'; // Import Papa Parse for CSV handling
import { environment } from '../environment';

interface Question {
  question: string;
  answer: string;
  level: string; // "EASY", "AVERAGE", "DIFFICULT", "CLINCHER"
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomQuestionService {

  constructor(private firestore: Firestore) {}
  
  /**
   * Uploads a CSV file containing custom questions.
   * @param file - The CSV file to upload.
   * @returns A promise that resolves when the upload is complete.
   */
  uploadQuestions(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => { // Typed event
        if (event.target && typeof event.target.result === 'string') {
          this.parseCSV(event.target.result)
            .then(questions => {
              this.storeQuestions(questions)
                .then(() => resolve())
                .catch(error => reject(error));
            })
            .catch(error => reject(error));
        } else {
          reject(new Error('Invalid file content'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  /**
   * Parses the CSV data into an array of Question objects.
   * @param csvData - The CSV data as a string.
   * @returns A promise that resolves with an array of Question objects.
   */
  private parseCSV(csvData: string): Promise<Question[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true, // Assuming your CSV has headers
        complete: (results: Papa.ParseResult<Question>) => {
          if (results.errors.length > 0) {
            // Handle errors from parsing (optional logging or custom error handling)
            console.error('Parsing errors:', results.errors);
            reject(new Error('Error parsing CSV data')); // Or a more specific error message
          } else {
            const questions: Question[] = results.data;
            resolve(questions);
          }
        },
      });
    });
  }

  /**
   * Stores the parsed question data in Firebase Firestore.
   * @param questions - The array of Question objects to store.
   * @returns A promise that resolves when the storage is complete.
   */
  private async storeQuestions(questions: Question[]): Promise<void> {
    const data: { questions: Question[]; [key: string]: any } = {
      questions,
      // ... other metadata (optional)
    };
  
    const questionSetsCollection = collection(this.firestore, 'questionSets');
    const questionSetRef = await addDoc(questionSetsCollection, data);
    const questionSetId = questionSetRef.id;
    
    console.log(`Question set saved with ID: ${questionSetId}`); // Optional logging
  }

  /**
   * Loads questions for a given question set ID.
   * @param questionSetId - The ID of the question set to load.
   * @returns A promise that resolves with an array of Question objects.
   */
  async loadQuestions(questionSetId: string): Promise<Question[]> {
    const docRef = doc(this.firestore, 'questionSets', questionSetId);
    const docSnapshot = await getDoc(docRef);
    
    if (docSnapshot.exists()) {
      return docSnapshot.data()?.['questions'] as Question[];
    } else {
      throw new Error(`Question set with ID ${questionSetId} not found`);
    }
  }

  /**
   * Retrieves a list of all question set IDs.
   * @returns A promise that resolves with an array of question set IDs.
   */
  async getQuestionSetIds(): Promise<string[]> {
    const questionSetsCollection = collection(this.firestore, 'questionSets');
    const snapshot = await getDocs(questionSetsCollection);
    return snapshot.docs.map(doc => doc.id);
  }
}
