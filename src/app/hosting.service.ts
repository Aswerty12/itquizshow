/*import { Injectable } from '@angular/core';
import { AngularFireObject, AngularFireDatabase } from '@angular/fire/compat/database'; // Assuming Firebase usage

interface Question {
  // Define the structure of your question objects here
}

@Injectable({
  providedIn: 'root' // Adjust provider scope as needed
})
export class HostService {
  private syncObject: AngularFireObject<any>; // Type any for flexibility

  constructor(private db: AngularFireDatabase) {}

  async init(PIN: string): Promise<void> {
    this.syncObject = this.db.object(`games/${PIN}`);
    const snapshot = await this.syncObject.valueChanges().pipe(take(1)).toPromise();

    if (!snapshot?.questions) {
      await this.setupGame();
    }
  }

  private async setupGame(): Promise<void> {
    const questions = TriviaService.getQuestions(); // Assuming TriviaService exists
    await this.syncObject.update({ questions, currentQuestion: 0 });
  }

  getCurrentQuestion(): Question | null {
    return this.syncObject.snapshotChanges().pipe(
      map((changes) => changes.payload.val()?.questions?.[this.syncObject.snapshot.val()?.currentQuestion ?? 0] || null)
    );
  }

  async setGameState(state: string): Promise<void> {
    await this.syncObject.update({ state });
  }

  async nextQuestion(): Promise<void> {
    await this.syncObject.update({ state: 'preQuestion', currentQuestion: this.syncObject.snapshot.val()?.currentQuestion + 1 ?? 0 });
  }
}
*/