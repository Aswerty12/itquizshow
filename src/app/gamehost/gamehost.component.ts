import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../game.service';
import { Subscription } from 'rxjs';
import { Player } from '../game.service';
import { Question, CustomQuestionService } from '../customquestion.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-host',
  templateUrl: './gamehost.component.html',
  styleUrls: ['./gamehost.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class GameHostComponent implements OnInit, OnDestroy {
  currentQuestion: Question | null = null;
  timer: number = 0;
  leaderboard: Player[] = [];
  gameState: string = 'stopped';
  roundNumber: number = 1;
  players: Player[] = [];
  gameCode: string = '';

  selectedQuestionSetId: string = '';
  questionSets: string[] = [];

  private gameStateSubscription: Subscription | null = null;
  private questionSubscription: Subscription | null = null;
  private playersSubscription: Subscription | null = null;
  private timerSubscription: Subscription | null = null;

  constructor(
    private gameService: GameService,
    private customQuestionService : CustomQuestionService
  ) {}

  ngOnInit(): void {
    this.gameStateSubscription = this.gameService.gameState$.subscribe(state => {
      this.gameState = state;     
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

    this.timerSubscription = this.gameService.timer$.subscribe(timerValue => {
      this.timer = timerValue;
    });
    this.loadQuestionSets();
  }

  ngOnDestroy(): void {
    this.gameStateSubscription?.unsubscribe();
    this.questionSubscription?.unsubscribe();
    this.playersSubscription?.unsubscribe();
    this.timerSubscription?.unsubscribe();
    this.gameService.stopGame();
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

  private updateLeaderboard() {
    this.leaderboard = [...this.players].sort((a, b) => b.score - a.score);
  }
  private async loadQuestionSets() {
    try {
      this.questionSets = await this.customQuestionService.getQuestionSetIds();
    } catch (error) {
      console.error('Error loading question sets:', error);
    }
  }
}