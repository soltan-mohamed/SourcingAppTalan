import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { CandidateService } from '../../../../core/service/candidate.service';
import { finalize } from 'rxjs/operators';
import { UserService } from '../../../../core/service/user.service';
import { InitialsPipe } from '@core/pipes/initials.pipe';
import { Statut } from '@core/models/candidate.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '@core';
import { Candidate } from '@core/models/candidate.model';

@Component({
  selector: 'app-add-candidate',
  standalone: true,
  imports: [
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
    InitialsPipe,
    MatSnackBarModule,
  ],
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddCandidateComponent implements OnInit {
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
    private dialogRef: MatDialogRef<AddCandidateComponent>,
    private candidateService: CandidateService,
    private userService: UserService,
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
    this.candidateService.createCandidate(formData, this.currentUser!.id)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (createdCandidate) => {
          if (createdCandidate?.id) {
            if (this.selectedFile) {
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
    this.candidateService.uploadCv(candidateId, file)
      .subscribe({
        next: (event) => {
          if (event.type === 4) {
            this.showSuccess(this.isEditMode ? 'Candidate and CV updated successfully' : 'Candidate and CV uploaded successfully');
            this.dialogRef.close(true);
          }
        },
        error: (err) => {
          console.error('CV upload error:', err);
          this.showError('CV upload failed. Please try again.');
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
}