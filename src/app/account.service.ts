import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInAnonymously, User, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private auth: Auth) {}

  // Login
  loginWithEmailAndPassword(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password).then(userCredential => userCredential.user));
  }

  // Signup
  signupWithEmailAndPassword(email: string, password: string): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password).then(userCredential => userCredential.user));
  }

  loginWithGoogle(): Observable<User> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider).then(userCredential => userCredential.user));
  }

  // Anonymous Login
  loginAnonymously(): Observable<User> {
    return from(signInAnonymously(this.auth).then(userCredential => userCredential.user));
  }

  // Check if user is logged in
  isLoggedIn(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      onAuthStateChanged(this.auth, user => {
        observer.next(!!user);
      });
    });
  }

  // Get current user information
  getCurrentUser(): Observable<User | null> {
    return new Observable<User | null>(observer => {
      onAuthStateChanged(this.auth, user => {
        observer.next(user);
      });
    });
  }

  // Logout
  logout(): Observable<void> {
    return from(signOut(this.auth));
  }
}