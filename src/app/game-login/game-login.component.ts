import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
//THIS IS CONFUSING BUT THIS IS MEANT AS THE Game's host LOBBY
@Component({
  selector: 'app-game-login',
  templateUrl: './game-login.component.html',
  styleUrls: ['./game-login.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class GameLoginComponent implements OnInit, OnDestroy {

  isLoading = false;
  isLoggedIn: boolean = false;
  private authSubscription!: Subscription;

  constructor(
    private accountService: AccountService,
    private router: Router
  ) 
  {}

  ngOnInit() {
    this.authSubscription = this.accountService.isLoggedIn().subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        // Optionally, redirect to host (game) if user is already logged in
        this.router.navigate(['/game-setup']); // or wherever you want to redirect
      }
    });
  }

  async loginWithGoogle() {
    this.isLoading = true;
    try {
      const user = await this.accountService.loginWithGoogle();
      this.isLoggedIn = true;
      this.isLoading = false;
      // Redirect to the player lobby after successful login
      this.router.navigate(['/game-setup']); 
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
      this.router.navigate(['/game-setup']);
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
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}