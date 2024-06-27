import { Injectable } from '@angular/core';
import { GameData } from './game.service';
import { Observable, from, map } from 'rxjs';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  constructor(private firestore: Firestore) { }

  // Method to get the game data 
  getGameData(gameId: string): Observable<GameData | null> {
    const gameDocRef = doc(this.firestore, 'games', gameId);
    return from(getDoc(gameDocRef)).pipe(
      map(docSnap => docSnap.exists() ? docSnap.data() as GameData : null)
    );
  }
}

