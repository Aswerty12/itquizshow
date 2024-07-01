import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CustomQuestionService, Question } from '../customquestion.service';
import { GameService } from '../game.service';
import { AccountService } from '../account.service';
import { LobbyService } from '../lobby.service';

import { GameData, Player } from '../game.service';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.scss']
})
export class GameSetupComponent implements OnInit, OnDestroy {
  uploadForm: FormGroup;
  joinForm: FormGroup;
  selectedFile: File | null = null;
  uploadedQuestionSets: string[] = [];
  gameData: GameData | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  previewQuestions: Question[] | null = null;

  private userSubscription!: Subscription;
  private gameDataSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private customQuestionService: CustomQuestionService,
    private gameService: GameService,
    private router: Router,
    private accountService: AccountService,
    private lobbyService: LobbyService
  ) {
    this.uploadForm = this.formBuilder.group({
      file: ['', Validators.required],
      questionSetName: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.joinForm = this.formBuilder.group({
      gameId: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.userSubscription = this.accountService.getCurrentUser().subscribe(user => {
      if (user) {
        // User information handling
      }
    });
    this.loadQuestionSets();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.gameDataSubscription) {
      this.gameDataSubscription.unsubscribe();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.uploadForm.patchValue({ file: file });
    this.uploadForm.get('file')?.updateValueAndValidity();
    this.selectedFile = file;
  }

  async uploadQuestions() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.uploadForm.valid && this.selectedFile) {
      try {
        const questionSetName = this.uploadForm.get('questionSetName')?.value;
        await this.customQuestionService.uploadQuestions(this.selectedFile, questionSetName);
        await this.loadQuestionSets();
        this.successMessage = `Question set "${questionSetName}" uploaded successfully!`;
        this.uploadForm.reset();
        this.selectedFile = null;
      } catch (error) {
        this.errorMessage = 'Error uploading questions. Please try again.';
        console.error('Error uploading questions:', error);
      }
    } else {
      this.errorMessage = 'Please fill in all required fields and select a file.';
    }
    this.isLoading = false;
  }

  async loadQuestionSets() {
    try {
      this.uploadedQuestionSets = await this.customQuestionService.getQuestionSetIds();
    } catch (error) {
      this.errorMessage = 'Error loading question sets. Please try again.';
      console.error('Error loading question sets:', error);
    }
  }

  async createGame(questionSetId: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.gameService.createNewGame(questionSetId);
      const gameId = this.gameService.currentGameId;
      this.successMessage = `Game created successfully! Game ID: ${gameId}`;
      this.router.navigate(['/game-host', gameId]);
    } catch (error) {
      this.errorMessage = 'Error creating game. Please try again.';
      console.error('Error creating game:', error);
    }
    this.isLoading = false;
  }

  async joinGame() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.joinForm.valid) {
      try {
        const gameId = this.joinForm.get('gameId')?.value;
        await this.gameService.joinGame(gameId, 'Player'); // Replace 'Player' with actual player name
        this.successMessage = 'Joined game successfully!';
        this.router.navigate(['/game-player', gameId]);
      } catch (error) {
        this.errorMessage = 'Error joining game. Please check the Game ID and try again.';
        console.error('Error joining game:', error);
      }
    } else {
      this.errorMessage = 'Please enter a valid Game ID.';
    }
    this.isLoading = false;
  }

  async previewQuestionSet(questionSetId: string) {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.previewQuestions = await this.customQuestionService.loadQuestions(questionSetId);
    } catch (error) {
      this.errorMessage = 'Error loading question set preview. Please try again.';
      console.error('Error loading question set preview:', error);
    }
    this.isLoading = false;
  }

  closePreview() {
    this.previewQuestions = null;
  }

  logout() {
    this.accountService.logout();
    this.router.navigate(['/']);
  }
}