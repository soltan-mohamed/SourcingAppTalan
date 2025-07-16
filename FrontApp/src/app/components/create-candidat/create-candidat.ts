import { Component, OnInit } from '@angular/core';
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
import { AuthService } from '@core/service/auth.service';
import { finalize } from 'rxjs';

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
    private candidatesService: CandidatesService,
    private usersService: UsersService,
    private snackBar: MatSnackBar,
    private authService: AuthService
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
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{8,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
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

  private sanitizePhoneNumber(phone: string): string {
    if (!phone) return '';
    // Remove all non-digit characters except + at the beginning
    return phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  }

  verifyRecruitementForm = (): boolean =>
    (this.recrutementForm.get('poste')?.value === '' && this.recrutementForm.get('manager')?.value === '') ||
    (this.recrutementForm.get('poste')?.value !== '' && this.recrutementForm.get('manager')?.value !== '');

  onSubmit(): void {
    this.CandidateForm.markAllAsTouched();

    if (this.CandidateForm.invalid) {
      this.showError('Please fill all required fields correctly');
      return;
    }

    if (!this.selectedFile) {
      this.fileError = true;
      this.fileErrorMessage = 'Please upload a CV file';
      return;
    }

    this.proceedWithSubmission();
  }

private proceedWithSubmission(): void {
  this.isSubmitting = true;

  // Use only the filename instead of base64 data
  const formData = {
    nom: this.CandidateForm.get('nom')?.value?.trim(),
    prenom: this.CandidateForm.get('prenom')?.value?.trim(),
    email: this.CandidateForm.get('email')?.value?.trim(),
    telephone: this.sanitizePhoneNumber(this.CandidateForm.get('telephone')?.value),
    skills: this.keywords.length > 0 ? this.keywords : [],
    cv: this.selectedFile?.name || null // Store only the filename
  };

  // Create recruitment form data if provided
  let sendRecrutementForm = null;
  if (this.recrutementForm.get('poste')?.value !== '' && this.recrutementForm.get('manager')?.value !== '') {
    const managerValue = this.recrutementForm.get('manager')?.value;
    sendRecrutementForm = {
      position: this.recrutementForm.get('poste')?.value,
      demandeur_id: typeof managerValue === 'object' ? managerValue.id : managerValue,
    };
  }

  const newCandidateForm = {
    candidate: formData,
    recruitment: sendRecrutementForm
  };

  // Add debug logging
  console.log('Sending candidate data:', JSON.stringify(newCandidateForm, null, 2));

  this.candidatesService.CreateNewCandidate(newCandidateForm)
    .subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response?.candidate) {
          this.showSuccess('Candidate created successfully');
          this.dialogRef.close(true);
        } else {
          this.showError('Failed to create candidate: No candidate returned');
        }
      },
      error: (err: { status: number; message: any; }) => {
        this.isSubmitting = false;
        console.error('Full error:', err);
        if (err.status === 403) {
          this.showError('Permission denied. Please check your user role or login status.');
        } else if (err.status === 401) {
          this.showError('Session expired. Please login again.');
          this.authService.logout();
        } else {
          this.showError(`Failed to create candidate: ${err.message || 'Unknown error'}`);
        }
      }
    });
}

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
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
}