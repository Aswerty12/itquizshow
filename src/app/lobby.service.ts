import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { GameData } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  constructor(private firestore: AngularFirestore) { }

  // Method to get the game data 
  async getGameData(gameId: string): Promise<GameData | null> {
    const gameDoc = await this.firestore.collection('games').doc(gameId).get().toPromise();

    if (gameDoc && gameDoc.exists) {
      return gameDoc.data() as GameData;
    } else {
      return null; // Return null if the game document doesn't exist
    }
  }
}
