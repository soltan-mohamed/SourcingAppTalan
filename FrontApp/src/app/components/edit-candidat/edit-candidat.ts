import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Candidate } from 'app/models/candidate';
import { CandidatesService } from 'app/services/candidates-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { backendUrl } from '@shared/backendUrl';


@Component({
  selector: 'app-edit-candidat',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './edit-candidat.html',
  styleUrl: './edit-candidat.scss'
})
export class EditCandidat implements OnInit {

  CandidateForm!: FormGroup;
  
  keywords: string[] = [];
  
  // File upload properties
  selectedFile: File | null = null;
  isDragging: boolean = false;
  fileError: boolean = false;
  fileErrorMessage: string = '';
  
  // Form submission state
  isSubmitting: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Candidate,
    public dialogRef: MatDialogRef<EditCandidat>,
    public candidateService : CandidatesService,
    private snackBar : MatSnackBar,
        private http: HttpClient

  ) {}



  onClose(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.populateFormWithData();
  }

  initializeForm(): void {
    this.CandidateForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ'-\s]+$/), Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ'-\s]+$/), Validators.minLength(2)]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9-\s]{8}$/)]],
      email: ['', [Validators.required, Validators.email]],
      skills: [[]],
    });
  }

  populateFormWithData(): void {
    if (this.data) {
      console.log('Received data:', this.data);
      
      //let fullName = this.extractFirstWord(this.data['name'] || '');

      this.CandidateForm.patchValue({
        prenom: this.data.prenom,
        nom: this.data.nom,
        telephone: this.data.telephone || '',
        email: this.data.email || '',
        //statut : this.data.statut,
      });
      
      // Populate keywords/competences
      if (this.data.skills && Array.isArray(this.data.skills)) {
        this.keywords = [...this.data.skills];
      }
    }
  }

  extractFirstWord(input: string): { firstWord: string, rest: string } {
    const trimmed = input.trim();
    const firstSpaceIndex = trimmed.indexOf(' ');

    if (firstSpaceIndex === -1) {
      return { firstWord: trimmed, rest: '' };
    }

    const firstWord = trimmed.substring(0, firstSpaceIndex);
    const rest = trimmed.substring(firstSpaceIndex + 1).trim();

    return { firstWord, rest };
  }


  getFormProgress(): number {
    const totalFields = 5;
    let completedFields = 0;

    if (this.CandidateForm.get('nom')?.valid) completedFields++;
    if (this.CandidateForm.get('prenom')?.valid) completedFields++;
    if (this.CandidateForm.get('telephone')?.valid) completedFields++;
    if (this.CandidateForm.get('email')?.valid) completedFields++;
    if (this.selectedFile) completedFields++;

    return (completedFields / totalFields) * 100;
  }

  addKeyword(keyword: string) {
    console.log(this.keywords);
    keyword = keyword.trim();
    if (keyword && !this.keywords.includes(keyword) && this.keywords.length < 5) {
      this.keywords.push(keyword);
    }
  }

  removeKeyword(keyword: string) {
    this.keywords = this.keywords.filter(k => k !== keyword);
  }

  // File upload methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  private handleFileSelection(file: File): void {
    this.fileError = false;
    this.fileErrorMessage = '';

    // Validate file type
    if (file.type !== 'application/pdf') {
      this.fileError = true;
      this.fileErrorMessage = 'Please select a PDF file';
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      this.fileError = true;
      this.fileErrorMessage = 'File size must be less than 10MB';
      return;
    }

    this.selectedFile = file;
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileError = false;
    this.fileErrorMessage = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onSubmit(): void {
    if (this.CandidateForm.valid) {
      this.isSubmitting = true;

      const formData = new FormData();
      
      // Add candidate data
      formData.append('candidate', JSON.stringify({
        nom: this.CandidateForm.get('nom')?.value,
        prenom: this.CandidateForm.get('prenom')?.value,
        email: this.CandidateForm.get('email')?.value,
        telephone: this.CandidateForm.get('telephone')?.value,
        skills: this.keywords
      }));

      // Add CV file if selected
      if (this.selectedFile) {
        formData.append('cv', this.selectedFile);
      }

      const headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      headers.append('Accept', 'application/json');

      this.http.put<any>(`${backendUrl}/candidats/${this.data.id}`, formData, { headers })
        .subscribe({
          next: (response: any) => {
            this.isSubmitting = false;
            this.snackBar.open(
              'Success updating candidate',
              'Close',
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['success-snackbar']
              }
            );
            this.dialogRef.close(response);
          },
          error: (error: any) => {
            this.isSubmitting = false;
            console.error('Error updating candidate:', error);
            this.snackBar.open(
              'Failed to update candidate: ' + (error.error?.message || 'Unknown error'),
              'Close',
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
              }
            );
          }
        });
    } else {
      this.CandidateForm.markAllAsTouched();
      
      if (!this.selectedFile) {
        this.fileError = true;
        this.fileErrorMessage = 'Please select a PDF file';
      }
    }
  }

  closeForm(): void {
    // Close dialog without saving
    this.dialogRef.close();
  }

  private resetForm(): void {
    this.CandidateForm.reset();
    this.keywords = [];
    this.selectedFile = null;
    this.fileError = false;
    this.fileErrorMessage = '';
    this.isSubmitting = false;
  }
}