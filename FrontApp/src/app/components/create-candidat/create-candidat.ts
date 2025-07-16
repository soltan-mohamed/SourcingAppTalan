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
}

/*import { Component, OnInit, Inject, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpEventType } from '@angular/common/http';

import { UsersService } from 'app/services/users-service';
import { User } from 'app/models/user';
import { Candidate, Statut } from 'app/models/candidate';
import { RecrutementService } from 'app/services/recrutement-service';
import { CandidateService } from 'app/services/candidates-service';
import { AuthService } from '@core/service/auth.service';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';





@Component({
  selector: 'app-add-candidate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSelectModule,
    MatSnackBarModule,
    MatIconModule,

    MatChipsModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './create-candidat.html',
  styleUrls: ['./create-candidat.scss']
})
export class CreateCandidat implements OnInit {
  @Output() closeForm = new EventEmitter<void>();
  CandidateForm: FormGroup;
  keywords: string[] = [];
  selectedFile: File | null = null;
  isDragging = false;
  fileError = false;
  fileErrorMessage = '';
  isSubmitting = false;
  statuses: string[] = Object.values(Statut).filter(value => typeof value === 'string');
  currentUser: { id: number; name: string } | null = null;
  isEditMode = false;
  existingCvUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateCandidat>,
    private candidateService: CandidateService,
    private userService: UsersService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: { candidate?: Candidate }
  ) {
    this.CandidateForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{8}$/),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]],
      statut: [Statut.CONTACTED]
    });

    if (data?.candidate) {
      this.isEditMode = true;
      this.existingCvUrl = data.candidate.cv || null;
    }
  }

  ngOnInit(): void {
    this.getCurrentUser();
    //console.log('Statuses:', this.statuses);
    //console.log('Initial form value:', this.CandidateForm.value);
  
    this.CandidateForm.valueChanges.subscribe(values => {
      //console.log('Form values changed:', values);
    });

    if (this.isEditMode && this.data.candidate) {
      this.patchFormValues(this.data.candidate);
    }
  }

  patchFormValues(candidate: Candidate): void {
    this.CandidateForm.patchValue({
      nom: candidate.nom,
      prenom: candidate.prenom,
      email: candidate.email,
      telephone: candidate.telephone,
      statut: candidate.statut || Statut.CONTACTED
    });

    if (candidate.skills) {
      this.keywords = [...candidate.skills];
    }
  }

  getCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        //console.log('User data received:', user);
        this.currentUser = {
          id: user.id,
          name: user.fullName
        };
      },
      error: (err) => {
        console.error('Full error details:', err);
        this.showError('Failed to load user information');
      }
    });
  }

  onSubmit(): void {
    this.CandidateForm.markAllAsTouched();
    
    if (this.CandidateForm.invalid) {
      this.showError('Please fill all required fields correctly');
      return;
    }

    if (!this.isEditMode && !this.selectedFile) {
      this.fileError = true;
      this.fileErrorMessage = 'Please upload a CV file';
      return;
    }

    if (!this.currentUser) {
      this.showError('No responsible user found');
      return;
    }

    this.isSubmitting = true;

    const formData = {
      ...this.CandidateForm.value,
      skills: this.keywords,
      statut: this.CandidateForm.value.statut || Statut.CONTACTED
    };

    if (this.isEditMode && this.data.candidate?.id) {
      this.updateCandidate(this.data.candidate.id, formData);
    } else {
      this.createCandidate(formData);
    }
  }

  createCandidate(formData: any): void {
    console.log('Creating candidate with data:', formData);
    console.log('Current user:', this.currentUser);
    
    this.candidateService.createCandidate(formData, this.currentUser!.id)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (createdCandidate) => {
          console.log('Candidate created successfully:', createdCandidate);
          if (createdCandidate?.id) {
            if (this.selectedFile) {
              console.log('Uploading CV for candidate ID:', createdCandidate.id);
              this.uploadCv(createdCandidate.id, this.selectedFile!);
            } else {
              this.showSuccess('Candidate created successfully');
              this.dialogRef.close(true);
            }
          } else {
            this.showError('Failed to create candidate: No ID returned');
          }
        },
        error: (err) => {
          console.error('Full error:', err);
          this.handleError(err);
        }
      });
  }

  updateCandidate(candidateId: number, formData: any): void {
    this.candidateService.updateCandidate(candidateId, formData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (updatedCandidate) => {
          if (this.selectedFile) {
            this.uploadCv(candidateId, this.selectedFile);
          } else {
            this.showSuccess('Candidate updated successfully');
            this.dialogRef.close(true);
          }
        },
        error: (err) => {
          console.error('Full error:', err);
          this.handleError(err);
        }
      });
  }

  handleError(err: any): void {
    if (err.status === 403) {
      this.showError('Permission denied. Please check your user role or login status.');
    } else if (err.status === 401) {
      this.showError('Session expired. Please login again.');
      this.authService.logout();
    } else {
      this.showError(`Operation failed: ${err.message}`);
    }
  }

  uploadCv(candidateId: number, file: File): void {
    console.log('Starting CV upload for candidate:', candidateId);
    console.log('File to upload:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    this.candidateService.uploadCv(candidateId, file)
      .subscribe({
        next: (event) => {
          console.log('Upload event:', event);
          if (event.type === HttpEventType.Response) {
            console.log('Upload completed successfully');
            this.showSuccess(this.isEditMode ? 'Candidate and CV updated successfully' : 'Candidate and CV uploaded successfully');
            this.dialogRef.close(true);
          }
          // You can also handle progress events here if needed
          // if (event.type === HttpEventType.UploadProgress) {
          //   const progress = Math.round(100 * event.loaded / event.total);
          //   console.log(`Upload progress: ${progress}%`);
          // }
        },
        error: (err) => {
          console.error('CV upload error:', err);
          console.error('Error status:', err.status);
          console.error('Error body:', err.error);
          if (err.status === 400) {
            this.showError('Invalid file format or size. Please check your file.');
          } else if (err.status === 413) {
            this.showError('File too large. Maximum size is 10MB.');
          } else if (err.status === 403) {
            this.showError('You do not have permission to upload CV for this candidate.');
          } else if (err.status === 404) {
            this.showError('Candidate not found.');
          } else if (err.status === 500) {
            this.showError('Server error occurred. Please try again later.');
          } else {
            this.showError(`CV upload failed: ${err.error?.message || err.message || 'Please try again.'}`);
          }
        }
      });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.validateFile(target.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files.length) {
      this.validateFile(event.dataTransfer.files[0]);
    }
  }

  validateFile(file: File): void {
    this.fileError = false;
    this.fileErrorMessage = '';
    
    if (file.type !== 'application/pdf') {
      this.fileError = true;
      this.fileErrorMessage = 'Only PDF files are allowed';
      this.selectedFile = null;
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.fileError = true;
      this.fileErrorMessage = 'File size must be less than 10MB';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.fileInput.nativeElement.value = '';
  }

  @ViewChild('fileInput') fileInput!: ElementRef;

  removeFile(): void {
    this.selectedFile = null;
    if (this.isEditMode) {
      this.existingCvUrl = null;
    }
  }

  addKeyword(keyword: string, input: HTMLInputElement): void {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword && !this.keywords.includes(trimmedKeyword)) {
      if (this.keywords.length < 5) {
        this.keywords.push(trimmedKeyword);
        input.value = '';
      } else {
        this.showError('Maximum 5 skills allowed');
      }
    }
  }

  handleKeyDown(event: KeyboardEvent, input: HTMLInputElement): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addKeyword(input.value, input);
    }
  }

  trackByKeyword(index: number, keyword: string): string {
    return keyword;
  }

  removeKeyword(keyword: string): void {
    this.keywords = this.keywords.filter(k => k !== keyword);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  getFormProgress(): number {
    let progress = 0;
    const totalFields = 5;
    
    if (this.CandidateForm.get('nom')?.valid) progress += 20;
    if (this.CandidateForm.get('prenom')?.valid) progress += 20;
    if (this.CandidateForm.get('email')?.valid) progress += 20;
    if (this.CandidateForm.get('telephone')?.valid) progress += 20;
    if (this.isEditMode || this.selectedFile) progress += 20;
    
    return progress;
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
  
  openCvInNewWindow(url: string): void {
  window.open(url, '_blank');
}
}*/