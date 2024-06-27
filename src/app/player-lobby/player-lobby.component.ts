import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../game.service';
import { Subscription } from 'rxjs';

interface User {
  displayName?: string | null;
  email?: string | null;
  // Add other properties your user object might have
}

@Component({
  selector: 'app-player-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],  
  templateUrl: './player-lobby.component.html',
  styleUrls: ['./player-lobby.component.scss']
})
export class PlayerLobbyComponent implements OnInit {

  gameId: string = '';
  playerName: string = 'Anonymous User';
  isLoading = false;

  errorMessage: string = ''; // To display error messages

  private userSubscription!: Subscription;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private gameService : GameService
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.accountService.getCurrentUser().subscribe(user => {
      if (user) {
        this.playerName = user.displayName || user.email || 'Anonymous User';
      }

    });
  }

  async joinGame() {
    this.isLoading = true;
    try {
      const playerId = await this.gameService.joinGame(this.gameId, this.playerName);
      await this.router.navigate(['/game-player', this.gameId], { queryParams: { playerId } });
    } catch (error) {
      console.error('Error joining game:', error);
      // Handle error (e.g., show a message to the user)
      this.errorMessage = "Failed to join the game. Please try again.";
    } finally {
      this.isLoading = false;
    }
    
  }
  logout() {
    this.accountService.logout();
    this.router.navigate(['/']); // Navigate to the home page or another desired route
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

  }
}