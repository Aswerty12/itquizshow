import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomQuestionService } from '../customquestion.service';

@Component({
  selector: 'app-customquestionupload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customquestionupload.component.html',
  styleUrl: './customquestionupload.component.scss'
})
export class CustomQuestionUploadComponent {
  selectedFile: File | null = null;
  uploadedQuestionSets: string[] = [];

  constructor(private customQuestionService: CustomQuestionService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadQuestions() {
    if (this.selectedFile) {
      try {
        await this.customQuestionService.uploadQuestions(this.selectedFile);
        // Optionally update the list of uploaded question sets
        this.uploadedQuestionSets = await this.customQuestionService.getQuestionSetIds();
        // Display success message
      } catch (error) {
        // Display error message
        console.error('Error uploading questions:', error);
      }
    } else {
      // Display error message (no file selected)
    }
  }
}
