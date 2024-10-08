import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../game.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Player } from '../game.service';
import { Question } from '../question';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-player',
  templateUrl: './game-player.component.html',
  styleUrls: ['./game-player.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class GamePlayerComponent implements OnInit, OnDestroy {

  gameId: string = '';
  currentQuestion: Question | null = null;
  timer: number = 0; 
  playerName: string = ''; 
  playerScore: number = 0;
  answer: string = ''; // Player's current answer
  playerId: string = '';
  playerNickName: string = '';
  playerSchool: string = '';
  hasSubmittedAnswer: boolean = false; //To prevent double dipping answer

  errorMessage: string = ''; // To display error messages
  isSubmitting: boolean = false; // To track if an answer is being submitted

  // Subscriptions for game state, question, and player data updates
  gameStateSubscription: Subscription | null = null;
  questionSubscription: Subscription | null = null;
  playerSubscription: Subscription | null = null;
  timerSubscription: Subscription | null = null;
  gameChangesSubscription : Subscription | null = null; 

  constructor(
    public gameService: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the game ID from the route parameters
    this.gameId = this.route.snapshot.paramMap.get('gameId') || '';
    // Get the player ID from the query parameters
    this.playerId = this.route.snapshot.queryParamMap.get('playerId') || '';
  
    // Subscribe to game state changes
    this.gameStateSubscription = this.gameService.gameState$.subscribe(state => {
      this.handleGameStateChange(state);
    });
  
    // Subscribe to question changes
    this.questionSubscription = this.gameService.currentQuestion$.subscribe(question => {
      this.currentQuestion = question;
    });
  
    // Get player's name and score
    this.playerSubscription = this.gameService.players$.subscribe(players => {
      const player = players.find(p => p.id === this.playerId);
      if (player) {
        this.playerName = player.name;
        this.playerScore = player.score;
        this.playerNickName = player.nickname;
        this.playerSchool = player.schoolname;
      }
    });

    // Subscribe to timer changes
    this.timerSubscription = this.gameService.timer$.subscribe(timerValue => {
      this.timer = timerValue;
    });
    //Subscribe to game changes may replace all of these later
    this.subscribeToGameChanges();
  }

  ngOnDestroy(): void {
    this.gameStateSubscription?.unsubscribe();
    this.questionSubscription?.unsubscribe();
    this.playerSubscription?.unsubscribe();
    this.timerSubscription?.unsubscribe();
    this.unsubscribeFromGameChanges();
  }

  // Handle game state changes
  private handleGameStateChange(state: string): void {
    if (state === 'started') {
      this.startTimer();
      this.resetAnswerSubmission();
    } else if (state === 'stopped' || state === 'paused') {
      this.stopTimer(); //placeholder for stopTimer event
    }
  }

  // Handle player answer submission
  async submitAnswer() {
    if (this.gameService.getGameState() !== 'started' || this.hasSubmittedAnswer) {
      return;
    }

    this.isSubmitting = true;
    try {
      await this.gameService.submitAnswer(this.playerId, this.answer);
      this.answer = '';
      this.hasSubmittedAnswer = true;
    } catch (error) {
      console.error("Error submitting answer:", error);
      this.errorMessage = "An error occurred while submitting your answer.";
    } finally {
      this.isSubmitting = false;
    }
  }

  private resetAnswerSubmission() {
    this.hasSubmittedAnswer = false;
  }

  // Start the timer 
  private startTimer() {
    //I'm keeping this as a placeholder for now
  }

  // Stop the timer
  private stopTimer() {
    // No need to manually stop the timer, the service handles this
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
