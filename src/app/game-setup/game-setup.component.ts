import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CustomQuestionService } from '../customquestion.service';
import { GameService } from '../game.service';
import { AccountService } from '../account.service';
import { LobbyService } from '../lobby.service';

import { GameData, Player } from '../game.service';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.scss']
})
export class GameSetupComponent implements OnInit, OnDestroy {
  // File upload properties
  selectedFile: File | null = null;
  uploadedQuestionSets: string[] = [];

  // Game lobby properties
  gameId: string = '';
  gameName: string = '';
  questionSetId: string = '';
  playerName: string = 'Anonymous User';
  isLoading = false;
  players: Player[] = [];
  gameData: GameData | null = null;

  private userSubscription!: Subscription;
  private gameDataSubscription!: Subscription;

  constructor(
    private customQuestionService: CustomQuestionService,
    private gameService: GameService,
    private router: Router,
    private accountService: AccountService,
    private lobbyService: LobbyService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.accountService.getCurrentUser().subscribe(user => {
      if (user) {
        this.playerName = user.displayName || user.email || 'Anonymous User';
      }
    });
    this.loadQuestionSets();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.gameDataSubscription) {
      this.gameDataSubscription.unsubscribe();
    }
  }

  // File upload methods
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadQuestions() {
    if (this.selectedFile) {
      try {
        await this.customQuestionService.uploadQuestions(this.selectedFile);
        await this.loadQuestionSets();
        // Display success message
      } catch (error) {
        console.error('Error uploading questions:', error);
        // Display error message
      }
    } else {
      // Display error message (no file selected)
    }
  }

  async loadQuestionSets() {
    try {
      this.uploadedQuestionSets = await this.customQuestionService.getQuestionSetIds();
    } catch (error) {
      console.error('Error loading question sets:', error);
    }
  }

  // Game lobby methods
  async createGame() {
    if (!this.questionSetId) {
      // Display error message: Please select a question set
      return;
    }
    
    this.isLoading = true;
    try {
      await this.gameService.createNewGame(this.questionSetId);
      this.gameId = this.gameService.currentGameId;
      this.isLoading = false;
      this.router.navigate(['/game-host', this.gameId]);
    } catch (error) {
      this.isLoading = false;
      console.error('Error creating game:', error);
    }
  }

  async joinGame() {
    this.isLoading = true;
    try {
      await this.gameService.joinGame(this.gameId, this.playerName);
      this.isLoading = false;
      this.router.navigate(['/game-player', this.gameId]);
    } catch (error) {
      this.isLoading = false;
      console.error('Error joining game:', error);
    }
  }

  getGameData(gameId: string) {
    this.isLoading = true;
    this.gameDataSubscription = this.lobbyService.getGameData(gameId).subscribe({
      next: (data) => {
        this.gameData = data;
        if (this.gameData) {
          this.players = this.gameData.players;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error getting game data:', error);
        this.isLoading = false;
      }
    });
  }

  logout() {
    this.accountService.logout();
    this.router.navigate(['/']);
  }
}