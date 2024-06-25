import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../game.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {  Player } from '../game.service';
import { Question } from '../customquestion.service';
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

  errorMessage: string = ''; // To display error messages
  isSubmitting: boolean = false; // To track if an answer is being submitted

  // Subscriptions for game state, question, and player data updates
  gameStateSubscription: Subscription | null = null;
  questionSubscription: Subscription | null = null;
  playerSubscription: Subscription | null = null;

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
      if (state === 'started') {
        this.startTimer();
      } else if (state === 'stopped' || state === 'paused') {
        clearInterval(this.timerInterval);
      }
    });
  
    // Subscribe to question changes
    this.questionSubscription = this.gameService.gameState$.subscribe(() => {
      this.currentQuestion = this.gameService.getCurrentQuestion();
    });
  
    // Get player's name and score
    this.playerSubscription = this.gameService.gameState$.subscribe(() => {
      const player = this.gameService.getPlayers().find(p => p.id === this.playerId);
      if (player) {
        this.playerName = player.name;
        this.playerScore = player.score;
      }
    });
  }

  ngOnDestroy(): void {
    this.gameStateSubscription?.unsubscribe();
    this.questionSubscription?.unsubscribe();
    this.playerSubscription?.unsubscribe();
  }
  


  // Handle player answer submission
  async submitAnswer() {
    if (this.gameService.getGameState() !== 'started') {
      console.error("Cannot submit answer: game is not in progress");
      return;
    }
  
    this.isSubmitting = true;
    try {
      await this.gameService.submitAnswer(this.playerId, this.answer);
      this.answer = '';
      // Maybe show a success message
    } catch (error) {
      console.error("Error submitting answer:", error);
      this.errorMessage = "An error occurred while submitting your answer.";
    } finally {
      this.isSubmitting = false;
    }
  }

  // Start the timer 
  private timerInterval: any; // Add a variable to store the interval

  private startTimer() {
    this.timer = 30;
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.timerInterval); 
        this.gameService.nextQuestion();
      }
    }, 1000);
  }
}
