import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-login',
  templateUrl: './game-login.component.html',
  styleUrls: ['./game-login.component.scss']
})
export class GameLoginComponent implements OnInit, OnDestroy {

  isLoading = false;
  isLoggedIn = false;

  constructor(
    private accountService: AccountService,
    private router: Router
  ) {
    this.accountService.isLoggedIn().then(loggedIn => {
      this.isLoggedIn = loggedIn;
    });
  }

  ngOnInit(): void {
    // No specific actions required for ngOnInit in this component
  }

  async loginWithGoogle() {
    this.isLoading = true;
    try {
      const user = await this.accountService.loginWithGoogle();
      this.isLoggedIn = true;
      this.isLoading = false;
      // Redirect to the player lobby after successful login
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
      // Redirect to the player lobby after successful login
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
  }

  ngOnDestroy(): void {
    // No specific actions required for ngOnDestroy in this component
  }
}