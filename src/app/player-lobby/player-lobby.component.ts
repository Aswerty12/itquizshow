import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../game.service';
import { Subscription , lastValueFrom} from 'rxjs';

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
  playeruID: string = '';
  isLoading = false;
  hostWord: string = '';
  playerNickName: string = '';
  playerSchool: string = '';

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
        this.playeruID = user.uid;
      }

    });
  }

  async joinGame() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('Attempting to join game with host word:', this.hostWord);
      const gameId = await this.gameService.joinGame(this.hostWord, this.playerName, this.playeruID, this.playerSchool,this.playerNickName);
      
      console.log('Joined game successfully. Game ID:', gameId);
      
      if (gameId) {
        console.log('Navigating to:', `/game-player/${gameId}`);
        await this.router.navigate(['/game-player', gameId], { queryParams: { playerId: this.playeruID } });
        console.log('Navigation completed');
      } else {
        throw new Error('Failed to join the game. No game ID returned.');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      this.errorMessage = "Failed to join the game. Please check the host word and try again.";
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