import { Component, OnInit, OnDestroy, ViewChild,ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { CustomQuestionService } from '../customquestion.service';
import { GameService } from '../game.service';
import { AccountService } from '../account.service';


import { GameData} from '../game.service';  
import { Question } from '../question';


interface QuestionSet {
  id: string;
  name: string;
}

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
  createGameForm: FormGroup;
  selectedFile: File | null = null;
  uploadedQuestionSets: string[] = [];
  gameData: GameData | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  previewQuestions: Question[] | null = null;
  questionSets: QuestionSet[]=[]; //Remove if reduntant with uploaded

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
      questionSetName: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.createGameForm = this.formBuilder.group({
      hostWord: ['', [Validators.required, Validators.minLength(3)]]
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  async uploadQuestions() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.uploadForm.valid && this.selectedFile) {
      this.isLoading = true;
      try {
        const questionSetName = this.uploadForm.get('questionSetName')?.value;
        if (!questionSetName) {
          throw new Error('Question set name is required');
        }
        const questionSetId = await this.customQuestionService.uploadQuestions(this.selectedFile, questionSetName).toPromise();
        this.successMessage = `Question set "${questionSetName}" uploaded successfully!`;
        this.resetForm();
        await this.loadQuestionSets();
      } catch (error) {
        this.errorMessage = 'Error uploading questions. Please try again.';
        console.error('Error uploading questions:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'Please fill in all required fields and select a file.';
    }
  }

  private loadQuestionSets() {
    this.questionSubscription = this.customQuestionService.getQuestionSets()
      .subscribe({
        next: (questionSets) => {
          this.questionSets = questionSets;
        },
        error: (error) => {
          console.error('Error loading question sets:', error);
          this.errorMessage = 'Failed to load question sets. Please try again.';
        }
      });
  }


  async createGame(questionSetId: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const hostWord = this.createGameForm.get('hostWord')?.value;

    if (!hostWord) {
      this.errorMessage = 'Please enter a host word.';
      this.isLoading = false;
      return;
    }

    try {
      await this.gameService.createNewGame(questionSetId, hostWord);
      const gameId = this.gameService.currentGameId;
      this.successMessage = `Game created successfully! Game ID: ${gameId}`;
      this.router.navigate(['/game-host', gameId]);
    } catch (error) {
      this.errorMessage = 'Error creating game. Please try again.';
      console.error('Error creating game:', error);
    }
    this.isLoading = false;
  }



  previewQuestionSet(questionSetId: string) {
    console.log('Starting to load question set:', questionSetId);
    this.isLoading = true;
    this.errorMessage = '';
    this.previewQuestions = null;

    // Subscribe to the observable and handle responses within the component
    this.questionSubscription = this.customQuestionService.loadQuestions(questionSetId)
      .subscribe({
        next: (questions) => {
          console.log('Received questions:', questions);
          this.previewQuestions = questions;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading questions:', error);
          this.errorMessage = 'Error loading question set preview. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          console.log('Question loading completed');
        }
      });
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