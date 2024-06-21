import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth'

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private afAuth: AngularFireAuth) {}

  // Login
  async loginWithEmailAndPassword(email: string, password: string) {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      // Handle login errors
      console.error('Login Error:', error);
      throw error;
    }
  }

  // Signup
  async signupWithEmailAndPassword(email: string, password: string) {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      // Handle signup errors
      console.error('Signup Error:', error);
      throw error;
    }
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await this.afAuth.signInWithPopup(provider);
      return userCredential.user;
    } catch (error) {
      // Handle Google login errors
      console.error('Google Login Error:', error);
      throw error;
    }
  }

  // Anonymous Login
  async loginAnonymously() {
    try {
      const userCredential = await this.afAuth.signInAnonymously();
      return userCredential.user;
    } catch (error) {
      // Handle anonymous login errors
      console.error('Anonymous Login Error:', error);
      throw error;
    }
  }
  // Check if user is logged in
  isLoggedIn(): Promise<boolean> {
    return new Promise(resolve => {
      this.afAuth.onAuthStateChanged(user => {
        resolve(!!user); 
      });
    });
  }

  // Get current user information
  getCurrentUser(): Promise<any> {
    return new Promise(resolve => {
      this.afAuth.onAuthStateChanged(user => {
        resolve(user);
      });
    });
  }

  // Logout
  logout() {
    this.afAuth.signOut();
  }
}