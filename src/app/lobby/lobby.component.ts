import { Component } from '@angular/core';
import { AccountService } from '../account.service';
import { Router } from '@angular/router'; // Import Router for navigation





@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {

  isLoading = false; // Flag for loading state
  isLoggedIn = false; // Flag for login status

  constructor(
    private accountService: AccountService,
    private router: Router // Inject the Router service
  ) {
    // Check login status on component initialization
    this.accountService.isLoggedIn().then(loggedIn => {
      this.isLoggedIn = loggedIn;
    });
  }

  async loginWithGoogle() {
    this.isLoading = true;
    try {
      const user = await this.accountService.loginWithGoogle();
      this.isLoggedIn = true;
      this.isLoading = false;
      // Redirect to the game lobby or the desired route after successful login
      this.router.navigate(['/game-lobby']); 
    } catch (error) {
      this.isLoading = false;
      console.error('Error during Google login:', error);
      // Display an error message to the user
    }
  }

  async loginAnonymously() {
    this.isLoading = true;
    try {
      const user = await this.accountService.loginAnonymously();
      this.isLoggedIn = true;
      this.isLoading = false;
      // Redirect to the game lobby or the desired route after successful login
      this.router.navigate(['/game-lobby']);
    } catch (error) {
      this.isLoading = false;
      console.error('Error during anonymous login:', error);
      // Display an error message to the user
    }
  }

  logout() {
    this.accountService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/'])
  }
}

