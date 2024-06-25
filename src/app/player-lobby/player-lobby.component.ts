import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  playerName: string = '';
  isLoading = false;

  constructor(
    private router: Router,
    private accountService: AccountService
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      const user = await this.accountService.getCurrentUser();
      if (user) {
        this.playerName = user.displayName || user.email || 'Anonymous User';
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      this.playerName = 'Anonymous User';
    }
  }

  async joinGame() {
    this.isLoading = true;
    try {
      // You might want to add some game joining logic here
      await this.router.navigate(['/game-player', this.gameId]);
    } catch (error) {
      console.error('Error joining game:', error);
      // Handle error (e.g., show a message to the user)
    } finally {
      this.isLoading = false;
    }
  }
}