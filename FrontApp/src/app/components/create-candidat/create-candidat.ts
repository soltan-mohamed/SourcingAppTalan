import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar,MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';

import { CandidatesService } from 'app/services/candidates-service';
import { UsersService } from 'app/services/users-service';
import { User } from 'app/models/user';

@Component({
  selector: 'app-create-candidat',
  imports: [ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatSelectModule,
    MatButtonModule,
    MatStepperModule
  ],
  templateUrl: './create-candidat.html',
  styleUrl: './create-candidat.scss',
  
})
export class CreateCandidat implements OnInit {

  // List of all managers :  
  managers : User[] = [];


  CandidateForm!: FormGroup;
  recrutementForm!: FormGroup;
  
  keywords : string[] = [];
  
  // File upload properties
  selectedFile: File | null = null;
  isDragging: boolean = false;
  fileError: boolean = false;
  fileErrorMessage: string = '';
  
  // Form submission state
  isSubmitting: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<CreateCandidat>,
    private candidatesService : CandidatesService,
    private usersService : UsersService,
    private snackBar: MatSnackBar
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getAllManagers();
  }

  initializeForm(): void {

    this.CandidateForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ'-\s]+$/), Validators.minLength(2) ]],
      prenom: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ'-\s]+$/), Validators.minLength(2) ]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9-\s]{8}$/)]],
      email: ['', [Validators.required, Validators.email]],
      hiringDate: [''],
      competences: [[]],
    });

    this.recrutementForm = this.formBuilder.group({
      poste: ['', [Validators.pattern(/^[a-zA-ZÀ-ÿ'-\s]+$/), Validators.minLength(2) ]],
      manager: ['', []],
    });
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

  verifyRecruitementForm = (): boolean =>
    (this.recrutementForm.get('poste')?.value === '' && this.recrutementForm.get('manager')?.value === '') ||
    (this.recrutementForm.get('poste')?.value !== '' && this.recrutementForm.get('manager')?.value !== '');

  onSubmit(): void {
    if (this.CandidateForm.valid && this.verifyRecruitementForm() === true) {
      this.isSubmitting = true;
      
      const formData = {
        nom: this.CandidateForm.get('nom')?.value,
        prenom: this.CandidateForm.get('prenom')?.value,
        email: this.CandidateForm.get('email')?.value,
        telephone: this.CandidateForm.get('telephone')?.value,
        hiringDate: this.CandidateForm.get('hiringDate')?.value || null, // Ensure null if empty
        statut : "CONTACTED",
        skills: this.keywords,
        cv: "testingcv"
        //this.selectedFile
      };

      // console.log("Recruitement :  ", this.recrutementForm);
      
      console.log('Submitting candidate: ...', formData);

      let sendRecrutementForm = null;
      if (this.recrutementForm.get('poste')?.value !== '' && this.recrutementForm.get('manager')?.value !== '') {
        sendRecrutementForm = {
          position: this.recrutementForm.get('poste')?.value,
          demandeur_id: this.recrutementForm.get('manager')?.value.id,
        }
        console.log("SEND RECRUTEMENT FORM ", sendRecrutementForm)
      }

      const newCandidateForm = {
        candidate : formData,
        recruitment : sendRecrutementForm
      }

      console.log("newCandidateForm ", newCandidateForm);

      this.candidatesService.CreateNewCandidate(newCandidateForm)
        .subscribe({
          next: (response: any) => {
            this.isSubmitting = false;
            this.snackBar.open(
              'Success creating new candidate',
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
            console.error('Error creating canddiate:', error);

            this.snackBar.open(
              'Failed to create new candidate: ' + (error.error?.message || 'Unknown error'),
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
      this.recrutementForm.markAllAsTouched();
      
      if (!this.selectedFile) {
        this.fileError = true;
      }
    }
  }

  closeForm(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.CandidateForm.reset();
    this.keywords = [];
    this.selectedFile = null;
    this.fileError = false;
    this.fileErrorMessage = '';
    this.isSubmitting = false;
  }

  // List of all managers
  getAllManagers(): void {
    this.usersService.getAllUsersByRole("MANAGER").subscribe({
      next: (data) => {
        this.managers = data;
      },
      error: (err) => {
        // this.errorMessage = "An internal server error has occurred !";
        console.error(err);
      }
    });
  }

  getInitials(): string {
    const userString = localStorage.getItem('currentUser');
    
    if (!userString ) {
      return "";
    }
    
    const userJson = JSON.parse(userString) as User;
    const name = userJson.fullName;

    if (!name) return '';

    return name
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }

  getUserName(): string {
    const userString = localStorage.getItem('currentUser');
    
    if (!userString ) {
      return "";
    }
    
    const userJson = JSON.parse(userString) as User;
    const name = userJson.fullName;

    if (!name) return '';

    return name;
  }

  // Method to calculate experience preview based on current form value
  getExperiencePreview(): string {
    const hiringDateValue = this.CandidateForm.get('hiringDate')?.value;
    
    if (!hiringDateValue || hiringDateValue.trim() === '') {
      return '0-1 year';
    }
    
    const hiringDate = new Date(hiringDateValue);
    const currentDate = new Date();
    
    // Calculate the difference
    const diffTime = Math.abs(currentDate.getTime() - hiringDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor((diffDays % 365) / 30);
    
    if (diffYears === 0) {
      if (diffMonths === 0) {
        return '0-1 year';
      } else if (diffMonths < 12) {
        return diffMonths + ' month' + (diffMonths > 1 ? 's' : '');
      }
    }
    
    if (diffYears > 0 && diffMonths > 0) {
      return diffYears + ' year' + (diffYears > 1 ? 's' : '') + ' ' + diffMonths + ' month' + (diffMonths > 1 ? 's' : '');
    } else {
      return diffYears + ' year' + (diffYears > 1 ? 's' : '');
    }
  }

  // Method to check if hiring date has a value
  hasHiringDate(): boolean {
    const hiringDateValue = this.CandidateForm.get('hiringDate')?.value;
    return hiringDateValue && hiringDateValue.trim() !== '';
  }

}