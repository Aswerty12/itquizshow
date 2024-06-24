import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../game.service';
import { Subscription } from 'rxjs';
import { Player } from '../game.service';
import { Question } from '../customquestion.service';

@Component({
  selector: 'app-game-host',
  templateUrl: './gamehost.component.html',
  styleUrls: ['./gamehost.component.scss']
})
export class GameHostComponent implements OnInit, OnDestroy {

  currentQuestion: Question | null = null;
  timer: number = 0;
  leaderboard: Player[] = []; 
  gameState: string = 'stopped'; 
  roundNumber: number = 1;

  gameStateSubscription: Subscription | null = null;
  questionSubscription: Subscription | null = null;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameStateSubscription = this.gameService.gameState$.subscribe(state => {
      this.gameState = state;
      if (state === 'started') {
        this.startTimer();
      }
    });

    // Now correctly subscribe to the question observable
    this.questionSubscription = this.gameService.gameState$.subscribe(() => {
      // Get the current question from the GameService
      this.currentQuestion = this.gameService.getCurrentQuestion(); 
    });

    // Get players from GameService
    this.leaderboard = this.gameService.getPlayers();
  }

  ngOnDestroy(): void {
    this.gameStateSubscription?.unsubscribe();
    this.questionSubscription?.unsubscribe();
  }

  startRound() {
    this.gameService.startRound();
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

  private startTimer() {
    this.timer = 30;
    const timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(timerInterval);
        this.gameService.nextQuestion();
      }
    }, 1000); 
  }
}