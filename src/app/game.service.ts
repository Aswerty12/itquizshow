import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Question } from './question';
import { Router } from '@angular/router';

interface GameMapping {
  hostWord: string;
  gameId: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  timestamp: Date;
  lastanswertimestamp: Date;
  isCorrect: boolean;
}

export interface GameData {
  questions: Question[];
  players: Player[];
  gameState: string;
  currentQuestionIndex: number;
  roundNumber: number;
  hostWord: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameId: string = '';
  private questions: Question[] = [];
  private players: Player[] = [];
  private currentQuestionIndex: number = 0;
  private roundNumber: number = 1;
  private gameState: string = 'stopped';
  private timerValue: number = 30;
  private timerInterval: any;
  private hostWord: string = '';

  private gameStateSubject = new BehaviorSubject<string>('stopped');
  gameState$ = this.gameStateSubject.asObservable();

  private playersSubject = new BehaviorSubject<Player[]>([]);
  players$ = this.playersSubject.asObservable();

  private currentQuestionSubject = new BehaviorSubject<Question | null>(null);
  currentQuestion$ = this.currentQuestionSubject.asObservable();

  private timerSubject = new BehaviorSubject<number>(this.timerValue);
  timer$ = this.timerSubject.asObservable();

  private questionConfig = {
    EASY: { time: 15, points: 10 },
    AVERAGE: { time: 30, points: 20 },
    DIFFICULT: { time: 50, points: 30 },
    CLINCHER: { time: 60, points: 50 }
  };

  constructor(
    private firestore: Firestore,
    private router : Router
  ) {}

  private async createGameMapping(hostWord: string, gameId: string): Promise<void> {
    console.log('Creating game mapping:', hostWord, '->', gameId);
    await setDoc(doc(this.firestore, 'gameMappings', hostWord), { gameId });
    console.log('Game mapping created successfully');
  }

  private async getGameIdFromHostWord(hostWord: string): Promise<string | null> {
    const mappingDoc = await getDoc(doc(this.firestore, 'gameMappings', hostWord));
    if (mappingDoc.exists()) {
      return (mappingDoc.data() as GameMapping).gameId;
    }
    return null;
  }
  get currentGameId(): string {
    return this.gameId;
  }
  getHostWord(): string {
    return this.hostWord;
  }

  async createNewGame(questionSetId: string, hostWord: string): Promise<void> {
    this.gameId = doc(collection(this.firestore, 'games')).id;
    this.hostWord = hostWord;
    this.questions = await this.loadQuestions(questionSetId);
    this.players = [];
    this.currentQuestionIndex = 0;
    this.roundNumber = 1;

    const gameData: GameData = {
      questions: this.questions,
      players: this.players,
      gameState: 'waiting',
      currentQuestionIndex: this.currentQuestionIndex,
      roundNumber: this.roundNumber,
      hostWord: this.hostWord // Ensure hostWord is included in gameData
    };

    console.log('Creating new game with ID:', this.gameId, 'and host word:', this.hostWord);

    await setDoc(doc(this.firestore, 'games', this.gameId), gameData);
    await this.createGameMapping(this.hostWord, this.gameId);

    console.log('Game and mapping created successfully');
    this.gameStateSubject.next('waiting');
  }

  async joinGame(hostWord: string, playerName: string, userId: string): Promise<string> {
    const gameId = await this.getGameIdFromHostWord(hostWord);
    if (!gameId) {
      throw new Error(`No game found with the host word: ${hostWord}`);
    }

    this.gameId = gameId;
    console.log('Found game with ID:', this.gameId);

    try {
      const gameDoc = await getDoc(doc(this.firestore, 'games', this.gameId));

      if (gameDoc.exists()) {
        const gameData = gameDoc.data() as GameData;

        this.questions = gameData.questions || [];
        this.players = gameData.players || [];
        this.gameState = gameData.gameState || 'waiting';
        this.currentQuestionIndex = gameData.currentQuestionIndex || 0;
        this.roundNumber = gameData.roundNumber || 1;

        let existingPlayer = this.players.find(p => p.id === userId);

        if (existingPlayer) {
          existingPlayer.name = playerName;
          existingPlayer.timestamp = new Date();
        } else {
          const newPlayer: Player = {
            id: userId,
            name: playerName,
            score: 0,
            timestamp: new Date(),
            lastanswertimestamp: new Date(),
            isCorrect: false
          };
          this.players.push(newPlayer);
        }

        this.gameStateSubject.next(this.gameState);
        this.playersSubject.next(this.players);
        this.currentQuestionSubject.next(this.questions[this.currentQuestionIndex]);

        await this.updateGameState();
        return userId;
      } else {
        throw new Error(`Game with ID ${this.gameId} does not exist.`);
      }
    } catch (error) {
      console.error("Error joining the game: ", error);
      throw error;
    }

  }

  async startRound() {
    if (this.gameState !== 'stopped') return;

    this.gameState = 'started';
    this.currentQuestionIndex = 0;
    this.roundNumber++;

    this.gameStateSubject.next(this.gameState);
    await this.updateGameState();
  }

  async nextQuestion() {
    if (this.currentQuestionIndex >= this.questions.length - 1) {
      this.gameState = 'ended';
      this.currentQuestionIndex = 0;
      this.gameStateSubject.next(this.gameState);
      await this.updateGameState();
      return;
    }

    this.gameState = 'in-between';
    this.gameStateSubject.next(this.gameState);
    await this.updateGameState();
  }

  async startNextQuestion() {
    this.currentQuestionIndex++;
    this.roundNumber++;
    this.currentQuestionSubject.next(this.questions[this.currentQuestionIndex]);
    this.gameState = 'started';
    this.gameStateSubject.next(this.gameState);
    await this.updateGameState();
    this.startTimer();
  }

  async submitAnswer(playerId: string, answer: string) {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const isCorrect = currentQuestion.answer === answer;
    const pointsEarned = isCorrect ? this.calculatePoints(currentQuestion.level) : 0;

    this.players = this.players.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          score: p.score + pointsEarned,
          lastanswertimestamp: new Date(),
          isCorrect: isCorrect
        };
      }
      return p;
    });

    this.playersSubject.next(this.players);
    await this.updateGameState();
  }

  async deleteGame() {
    if (this.gameId) {
      await deleteDoc(doc(this.firestore, 'games', this.gameId));
      await this.deleteGameMapping(this.hostWord);
      this.gameId = '';
      this.hostWord = '';
      this.gameState = 'stopped';
      this.gameStateSubject.next(this.gameState);
      this.router.navigate(['/']);
    }
  }

  private async deleteGameMapping(hostWord: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'gameMappings', hostWord));
  }
  private calculatePoints(level: Question['level']): number {
    //Future expansion if points by speed becoems required
    const basePoints = this.questionConfig[level].points;
    //const timeBonus = Math.floor((this.timerValue / this.questionConfig[level].time) * basePoints);
    return basePoints;
  }

  async pauseGame() {
    this.gameState = 'paused';
    this.gameStateSubject.next(this.gameState);
    await this.updateGameState();
    this.stopTimer();
  }

  getPlayerIdByGameId(gameId: string): Promise<string | null> {
    return new Promise(resolve => {
      const player = this.players.find(p => p.id === gameId);
      if (player) {
        resolve(player.id);
      } else {
        resolve(null);
      }
    });
  }

  getPlayerById(playerId: string): Player | undefined {
    return this.players.find(p => p.id === playerId);
  }

  async isValidGame(gameId: string): Promise<boolean> {
    try {
      const gameDoc = await getDoc(doc(this.firestore, 'games', gameId));
      return gameDoc.exists();
    } catch (error) {
      console.error('Error checking game validity:', error);
      return false;
    }
  }

  async resumeGame() {
    this.gameState = 'started';
    this.gameStateSubject.next(this.gameState);
    await this.updateGameState();
  }

  getCurrentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  getCurrentRound(): number {
    return this.roundNumber;
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getGameState(): string {
    return this.gameState;
  }

  private async loadQuestions(questionSetId: string): Promise<Question[]> {
    const docRef = doc(this.firestore, 'questionSets', questionSetId);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data() as { questions: Question[] };
      return data.questions || [];
    } else {
      throw new Error(`Question set with ID ${questionSetId} not found`);
    }
  }

  async startGame(): Promise<void> {
    this.gameState = "started";
    this.gameStateSubject.next(this.gameState);
    this.currentQuestionSubject.next(this.questions[0]);
    await this.updateGameState();
    this.startTimer();
  }

  stopGame(): void {
    this.gameState = 'stopped';
    this.gameStateSubject.next(this.gameState);
    this.stopTimer();
  }

  async endGame(): Promise<void> {
    this.gameStateSubject.next('ended');
    await this.updateGameState();
  }

  async addPlayer(player: Player): Promise<void> {
    const currentPlayers = this.playersSubject.value;
    currentPlayers.push(player);
    this.playersSubject.next(currentPlayers);
    await this.updateGameState();
  }

  private async updateGameState(): Promise<void> {
    const gameData: GameData = {
      questions: this.questions,
      players: this.players,
      gameState: this.gameStateSubject.value,
      currentQuestionIndex: this.currentQuestionIndex,
      roundNumber: this.roundNumber,
      hostWord: this.hostWord
    };
  
    await updateDoc(doc(this.firestore, 'games', this.gameId), { ...gameData });
  }

  private startTimer() {
    this.stopTimer();
    const currentQuestion = this.questions[this.currentQuestionIndex];
    this.timerValue = this.questionConfig[currentQuestion.level].time;
    this.timerSubject.next(this.timerValue);

    this.timerInterval = setInterval(() => {
      this.timerValue--;
      this.timerSubject.next(this.timerValue);
      if (this.timerValue <= 0) {
        this.stopTimer();
        this.nextQuestion();
      }
    }, 1000);
  }
  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
  listenToGameChanges(): Observable<void> | undefined {
    if (this.gameId) {
      return new Observable<void>((observer) => {
        const gameDoc = doc(this.firestore, 'games', this.gameId);
        const unsubscribe = onSnapshot(gameDoc, (snapshot) => {
          if (snapshot.exists()) {
            const gameData = snapshot.data() as GameData;
            this.questions = gameData.questions || [];
            this.players = gameData.players || [];
            this.gameState = gameData.gameState || 'waiting';
            this.currentQuestionIndex = gameData.currentQuestionIndex || 0;
            this.roundNumber = gameData.roundNumber || 1;
  
            this.gameStateSubject.next(this.gameState);
            this.playersSubject.next(this.players);
            this.currentQuestionSubject.next(this.questions[this.currentQuestionIndex]);
          } else {
            console.log('Game no longer exists');
            this.router.navigate(['/']);
          }
        });
  
        // Unsubscribe when the Observable is unsubscribed
        return () => unsubscribe();
      });
    }
    return undefined; // Ensure the function always returns a value
  }
}