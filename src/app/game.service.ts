import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Question } from './question';


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

  private gameStateSubject = new BehaviorSubject<string>('stopped');
  gameState$ = this.gameStateSubject.asObservable();

  private playersSubject = new BehaviorSubject<Player[]>([]);
  players$ = this.playersSubject.asObservable();

  private currentQuestionSubject = new BehaviorSubject<Question | null>(null);
  currentQuestion$ = this.currentQuestionSubject.asObservable();

  private timerSubject = new BehaviorSubject<number>(this.timerValue);
  timer$ = this.timerSubject.asObservable();

  private questionConfig = {
    EASY: { time: 15, points: 100 },
    AVERAGE: { time: 30, points: 200 },
    DIFFICULT: { time: 45, points: 300 },
    CLINCHER: { time: 60, points: 500 }
  };

  constructor(
    private firestore: Firestore,

  ) {}

  get currentGameId(): string {
    return this.gameId;
  }

  async createNewGame(questionSetId: string): Promise<void> {
    this.gameId = doc(collection(this.firestore, 'games')).id;
    this.questions = await this.loadQuestions(questionSetId);
    this.players = [];
    this.currentQuestionIndex = 0;
    this.roundNumber = 1;

    const gameData: GameData = {
      questions: this.questions,
      players: this.players,
      gameState: 'waiting',
      currentQuestionIndex: this.currentQuestionIndex,
      roundNumber: this.roundNumber
    };

    await setDoc(doc(this.firestore, 'games', this.gameId), gameData);
    this.gameStateSubject.next('waiting');
  }

  async joinGame(gameId: string, playerName: string): Promise<string> {
    this.gameId = gameId;

    try {
      const gameDoc = await getDoc(doc(this.firestore, 'games', this.gameId));

      if (gameDoc.exists()) {
        const gameData = gameDoc.data() as GameData;

        this.questions = gameData.questions || [];
        this.players = gameData.players || [];
        this.gameState = gameData.gameState || 'stopped';
        this.currentQuestionIndex = gameData.currentQuestionIndex || 0;
        this.roundNumber = gameData.roundNumber || 1;

        const newPlayerId = doc(collection(this.firestore, 'games')).id;
        const newPlayer: Player = {
          id: newPlayerId,
          name: playerName,
          score: 0,
          timestamp: new Date(),
          lastanswertimestamp: new Date(),
          isCorrect: false
        };
        this.players.push(newPlayer);

        await this.updateGameState();
        return newPlayerId;
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
      this.gameState = 'stopped';
      this.currentQuestionIndex = 0;
      this.gameStateSubject.next(this.gameState);
      this.stopGame();
      await this.updateGameState();
      return;
    }

    this.currentQuestionIndex++;
    this.currentQuestionSubject.next(this.questions[this.currentQuestionIndex]);
    this.startTimer();
    await this.updateGameState();
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

  private calculatePoints(level: Question['level']): number {
    const basePoints = this.questionConfig[level].points;
    const timeBonus = Math.floor((this.timerValue / this.questionConfig[level].time) * basePoints);
    return basePoints + timeBonus;
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
      roundNumber: this.roundNumber
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
}