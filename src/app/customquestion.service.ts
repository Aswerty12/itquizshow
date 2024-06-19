import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Papa from 'papaparse'; // Import Papa Parse for CSV handling

interface Question {
  question: string;
  answer: string;
  level: string; // "EASY", "AVERAGE", "DIFFICULT", "CLINCHER"
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomquestionService {

  constructor() { }
}
