import { Component, OnInit, OnDestroy, ViewChild,ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { CustomQuestionService } from '../customquestion.service';
import { GameService } from '../game.service';
import { AccountService } from '../account.service';


import { GameData} from '../game.service';  
import { Question } from '../question';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.scss']
})
export class GameSetupComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;

  uploadForm: FormGroup;
  joinForm: FormGroup;
  selectedFile: File | null = null;
  uploadedQuestionSets: string[] = [];
  gameData: GameData | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  previewQuestions: Question[] | null = null;
  questionSets: string[] = []; //Remove if reduntant with uploaded

  private userSubscription: Subscription | undefined;
  private gameDataSubscription: Subscription | undefined;
  private questionSubscription: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private customQuestionService: CustomQuestionService,
    private gameService: GameService,
    private router: Router,
    private accountService: AccountService,
    
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
    if (this.questionSubscription){
      this.questionSubscription.unsubscribe();
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
        if (!questionSetName) {
          throw new Error('Question set name is required');
        }
        await this.customQuestionService.uploadQuestions(this.selectedFile, questionSetName);
        await this.loadQuestionSets();
        this.successMessage = `Question set "${questionSetName}" uploaded successfully!`;
        this.resetForm();
      } catch (error) {
        this.errorMessage = 'Error uploading questions. Please try again.';
        console.error('Error uploading questions:', error);
      }
    } else {
      this.errorMessage = 'Please fill in all required fields and select a file.';
    }
    this.isLoading = false;
  }

  loadQuestionSets() {
    this.isLoading = true;
    this.errorMessage = '';
    const subscription = this.customQuestionService.getQuestionSetIds()
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (questionSetIds) => {
          this.uploadedQuestionSets = questionSetIds;
        },
        error: (error) => {
          this.errorMessage = 'Error loading question sets. Please try again.';
          console.error('Error loading question sets:', error);
        }
      });
    this.questionSubscription.add(subscription);
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

  previewQuestionSet(questionSetId: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.previewQuestions = null;

    const subscription = this.customQuestionService.loadQuestions(questionSetId)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (questions) => {
          this.previewQuestions = questions;
        },
        error: (error) => {
          this.errorMessage = 'Error loading question set preview. Please try again.';
          console.error('Error loading question set preview:', error);
        }
      });

    this.questionSubscription.add(subscription);
  }


  closePreview() {
    this.previewQuestions = null;
  }

  logout() {
    this.accountService.logout();
    this.router.navigate(['/']);
  }
  resetForm() {
    this.uploadForm.reset();
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}