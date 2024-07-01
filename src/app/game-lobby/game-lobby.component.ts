import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../game.service';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';
import { Subscription } from 'rxjs';
import { GameData, Player } from '../game.service';
import { LobbyService } from '../lobby.service'; // Import LobbyService
import { Question } from '../question';
import {FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-game-lobby',
  templateUrl: './game-lobby.component.html',
  styleUrls: ['./game-lobby.component.scss'],
  imports: [FormsModule, CommonModule], standalone: true
})
export class GameLobbyComponent implements OnInit, OnDestroy {

  gameId: string = ''; 
  gameName: string = ''; 
  questionSetId: string = ''; 
  playerName: string = 'Anonymous User';
  isLoading = false;

  // To display the list of players in the lobby
  players: Player[] = []; 

  // Subscription to listen to game state changes
  gameStateSubscription: Subscription | null = null; 
  gameData: GameData | null = null; 
  private userSubscription!: Subscription;
  private gameDataSubscription!: Subscription;

  constructor(
    private gameService: GameService,
    private router: Router,
    private accountService: AccountService,
    private lobbyService: LobbyService // Inject LobbyService
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.accountService.getCurrentUser().subscribe(user => {
      if (user) {
        this.playerName = user.displayName || user.email || 'Anonymous User';
      }

    });
  }

  async createGame(questionSetId: string) {
    this.isLoading = true;
    try {
      await this.gameService.createNewGame(questionSetId);
      this.gameId = this.gameService.currentGameId;
      this.isLoading = false;
      // Redirect to the game host component
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
      // Redirect to the player component
      this.router.navigate(['/game-player', this.gameId]);
    } catch (error) {
      this.isLoading = false;
      console.error('Error joining game:', error);
    }
  }

  // To update the list of players in the lobby
  updateLobbyPlayers(): void {
    if (this.gameData) {
      this.players = this.gameData.players; // Access players from gameData
    }
  }

  getGameData(gameId: string) {
    this.isLoading = true;
    this.gameDataSubscription =this.lobbyService.getGameData(gameId).subscribe({
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

  ngOnDestroy(): void {
    this.gameStateSubscription?.unsubscribe();
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.gameDataSubscription) {
      this.gameDataSubscription.unsubscribe();
    }
  }
  logout() {
    this.accountService.logout(); // Call the logout method in the AccountService
    this.router.navigate(['/']); // Navigate to the home page or another desired route
  }
}