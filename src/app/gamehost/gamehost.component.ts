import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../game.service';
import { Subscription } from 'rxjs';
import { Player } from '../game.service';
import { CustomQuestionService } from '../customquestion.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Question } from '../question';

interface QuestionSet {
  id: string;
  name: string;
}



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
  specialLeaderboard: Player[] = [];
  gameState: string = 'stopped';
  roundNumber: number = 1;
  players: Player[] = [];
  gameCode: string = '';
  hostWord: string = '';

  selectedQuestionSetId: string = '';
  questionSets: QuestionSet[] = [];

  private gameStateSubscription: Subscription | null = null;
  private questionSubscription: Subscription | null = null;
  private playersSubscription: Subscription | null = null;
  private timerSubscription: Subscription | null = null;
  private questionSetsSubscription: Subscription | null = null;
  private gameChangesSubscription: Subscription | null = null;

  private startSound : HTMLAudioElement;
  private endSound : HTMLAudioElement;
  constructor(
    private gameService: GameService,
    private customQuestionService : CustomQuestionService
  ) {
    this.startSound = new Audio('audio/game-start.mp3');
    this.endSound = new Audio('audio/negative_beeps.mp3');
  }

  ngOnInit(): void {
    this.gameStateSubscription = this.gameService.gameState$.subscribe(state => {
      this.handleGameStateChange(state);
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
    this.gameCode = this.gameService.currentGameId;
    this.hostWord = this.gameService.getHostWord();
    this.subscribeToGameChanges();
  }

  ngOnDestroy(): void {
    this.gameStateSubscription?.unsubscribe();
    this.questionSubscription?.unsubscribe();
    this.playersSubscription?.unsubscribe();
    this.timerSubscription?.unsubscribe();
    this.questionSetsSubscription?.unsubscribe();
    this.unsubscribeFromGameChanges();
    this.gameService.stopGame();
    this.gameService.deleteGame();
    //This is commented out for now as not having them be deleted immediately is good for debug
  }

  

  startGame() {
    this.gameService.startGame();
  }

  startNextQuestion() {
    this.gameService.startNextQuestion();
  }// temp until I find out how this is used

  nextQuestion() {
    this.gameService.nextQuestion();
  }

  resumeGame() {
    this.gameService.resumeGame();
  }

  endGame() {
    this.gameService.endGame();
  }

  private handleGameStateChange(state: string): void {
    if (state === 'started') {
      this.startSound.play();
    } else if (state === 'in-between' || state === 'ended') {
      this.endSound.play();
    }
  }

  private updateLeaderboard() {
    this.leaderboard = [...this.players].sort((a, b) => b.score - a.score);
    if (this.gameState === 'ended') {
      this.specialLeaderboard = this.gameService.getSpecialLeaderboard();
    }
  }
  private loadQuestionSets() {
    this.questionSetsSubscription = this.customQuestionService.getQuestionSets()
      .subscribe({
        next: (questionSets) => {
          this.questionSets = questionSets;
        },
        error: (error) => {
          console.error('Error loading question sets:', error);
          // Optionally, you can set an error message to display in the template
          // this.errorMessage = 'Failed to load question sets. Please try again.';
        }
      });
  }

  subscribeToGameChanges() {
    const gameChangesObservable = this.gameService.listenToGameChanges();
    if (gameChangesObservable) {
      this.gameChangesSubscription = gameChangesObservable.subscribe();
    } else {
      this.gameChangesSubscription = null;
    }
  }
  
  unsubscribeFromGameChanges() {
    if (this.gameChangesSubscription) {
      this.gameChangesSubscription.unsubscribe();
      this.gameChangesSubscription = null;
    }
  }
}