export interface Question {
    question: string;
    answer: string;
    level: 'EASY' | 'AVERAGE' | 'DIFFICULT' | 'CLINCHER';
    category: string;
  }
