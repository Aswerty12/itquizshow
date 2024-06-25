import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../game.service';
import { CustomQuestionService } from '../customquestion.service';
import { Subscription } from 'rxjs';
import { Player } from '../game.service';
import { Question } from '../customquestion.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-host',
  templateUrl: './gamehost.component.html',
  styleUrls: ['./gamehost.component.scss'],
  standalone: true,
  imports: [CommonModule,FormsModule]
})
export class GameHostComponent implements OnInit, OnDestroy {
  currentQuestion: Question | null = null;
  timer: number = 0;
  leaderboard: Player[] = [];
  gameState: string = 'stopped';
  roundNumber: number = 1;
  players: Player[] = [];
  gameCode: string = '';

  selectedFile: File | null = null;
  uploadedQuestionSets: string[] = [];
  selectedQuestionSetId: string = '';

  private gameStateSubscription: Subscription | null = null;
  private questionSubscription: Subscription | null = null;
  private playersSubscription: Subscription | null = null;
  private timerInterval: any;

  constructor(
    private gameService: GameService,
    private customQuestionService: CustomQuestionService
  ) {}

  ngOnInit(): void {
    this.gameStateSubscription = this.gameService.gameState$.subscribe(state => {
      this.gameState = state;
      if (state === 'started') {
        this.startTimer();
      } else if (state === 'stopped' || state === 'paused') {
        this.stopTimer();
      }
    });

    this.questionSubscription = this.gameService.currentQuestion$.subscribe(question => {
      this.currentQuestion = question;
      if (question) {
        this.roundNumber = this.gameService.getCurrentRound();
      }
    });

    this.playersSubscription = this.gameService.players$.subscribe(players => {
      this.players = players;
      this.updateLeaderboard();
    });

    this.loadQuestionSets();
  }

  ngOnDestroy(): void {
    this.gameStateSubscription?.unsubscribe();
    this.questionSubscription?.unsubscribe();
    this.playersSubscription?.unsubscribe();
    this.stopTimer();
  }

  async loadQuestionSets() {
    try {
      this.uploadedQuestionSets = await this.customQuestionService.getQuestionSetIds();
    } catch (error) {
      console.error('Error loading question sets:', error);
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadQuestions() {
    if (this.selectedFile) {
      try {
        await this.customQuestionService.uploadQuestions(this.selectedFile);
        await this.loadQuestionSets();
        console.log('Questions uploaded successfully');
      } catch (error) {
        console.error('Error uploading questions:', error);
      }
    } else {
      console.error('No file selected');
    }
  }

  async createGame() {
    if (this.selectedQuestionSetId) {
      try {
        await this.gameService.createNewGame(this.selectedQuestionSetId);
        this.gameCode = this.gameService.currentGameId;
        console.log('Game created successfully');
      } catch (error) {
        console.error('Error creating game:', error);
      }
    } else {
      console.error('No question set selected');
    }
  }

  startGame() {
    this.gameService.startGame();
  }

  nextQuestion() {
    this.gameService.nextQuestion();
  }

  pauseGame() {
    this.gameService.pauseGame();
  }

  resumeGame() {
    this.gameService.resumeGame();
  }

  endGame() {
    this.gameService.endGame();
  }

  private startTimer() {
    this.stopTimer();
    this.timer = 30;
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        this.stopTimer();
        this.gameService.nextQuestion();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private updateLeaderboard() {
    this.leaderboard = [...this.players].sort((a, b) => b.score - a.score);
  }
}