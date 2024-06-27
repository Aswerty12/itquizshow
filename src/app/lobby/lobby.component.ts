//LOBBY FOR Players
import { Component } from '@angular/core';
import { AccountService } from '../account.service';
import { Router } from '@angular/router'; // Import Router for navigation
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {

  isLoading = false; // Flag for loading state
  isLoggedIn = false; // Flag for login status
  private authSubscription!: Subscription;

  constructor(
    private accountService: AccountService,
    private router: Router // Inject the Router service
  ) {  }

  ngOnInit() {
    this.authSubscription = this.accountService.isLoggedIn().subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        // Optionally, redirect if user is already logged in
        this.router.navigate(['/player-lobby']); // or wherever you want to redirect
      }
    });
  }
  async loginWithGoogle() {
    this.isLoading = true;
    try {
      const user = await this.accountService.loginWithGoogle();
      this.isLoggedIn = true;
      this.isLoading = false;
      // Redirect to the game lobby or the desired route after successful login
      this.router.navigate(['/player-lobby']); 
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
      this.router.navigate(['/player-lobby']);
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
  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}

