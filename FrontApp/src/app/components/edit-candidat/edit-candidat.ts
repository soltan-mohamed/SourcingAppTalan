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
import { Recrutement } from 'app/models/recrutement';

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
  latestRecruitment: Recrutement | null = null;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Candidate,
    public dialogRef: MatDialogRef<EditCandidat>,
    public candidateService : CandidatesService,
    private snackBar : MatSnackBar
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
      position: ['', Validators.required],
      hiringDate: [''],
      skills: [[]],
    });
  }

  populateFormWithData(): void {
    if (this.data) {
      console.log('Received data:', this.data);
      
      //let fullName = this.extractFirstWord(this.data['name'] || '');
      this.latestRecruitment = this.getLatestRecruitment();
      this.CandidateForm.patchValue({
        prenom: this.data.prenom,
        nom: this.data.nom,
        telephone: this.data.telephone || '',
        email: this.data.email || '',
        position: this.latestRecruitment ? this.latestRecruitment.position : '',
        hiringDate: this.data.hiringDate || '',
        //statut : this.data.statut,
      });
      
      if (this.data.skills && Array.isArray(this.data.skills)) {
        this.keywords = [...this.data.skills];
      }

      if(this.data.cvFilename){
        this.getCVFile(this.data.id);
      }
    }
  }
   getLatestRecruitment(): Recrutement | null {
      if (!this.data.recrutements || this.data.recrutements.length === 0) {
          return null;
      }
      // Assuming recruitments are sorted by date descending from the backend.
      // If not, you'd need to sort them here based on a date property.
      return this.data.recrutements[0];
  }

  getCVFile(candidateId: number) {
    this.candidateService.getCandidateCv(candidateId).subscribe({
      next: (blob: Blob) => {
        if(this.data.cvFilename) {
        
          const filename = this.data?.cvFilename; 
          const file = new File([blob], filename, { type: blob.type });

          this.selectedFile = file;
        }
      },
      error: (err) => {
        console.error('Error loading CV file', err);
      }
    });
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
    const totalFields = 6;
    let completedFields = 0;

    if (this.CandidateForm.get('nom')?.valid) completedFields++;
    if (this.CandidateForm.get('prenom')?.valid) completedFields++;
    if (this.CandidateForm.get('telephone')?.valid) completedFields++;
    if (this.CandidateForm.get('email')?.valid) completedFields++;
     if (this.CandidateForm.get('position')?.valid) completedFields++;
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
    console.log("Removing file ! ");
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

      if(this.selectedFile) {
        this.candidateService.uploadCv(this.data.id, this.selectedFile).subscribe({
          next: (event) => {
            this.data.cvFilename = this.selectedFile?.name;
          },
          error: (err) => {
            console.error('Error uploading CV:', err);
          }
        });
      }
      
      // Get hiring date value and ensure it's null if empty
      const hiringDateValue = this.CandidateForm.get('hiringDate')?.value;
      const hiringDate = hiringDateValue && hiringDateValue.trim() !== '' ? hiringDateValue : null;
      
      const formData = {
        nom: this.CandidateForm.get('nom')?.value,
        prenom: this.CandidateForm.get('prenom')?.value,
        email: this.CandidateForm.get('email')?.value,
        telephone: this.CandidateForm.get('telephone')?.value,
        hiringDate: hiringDate,
        skills: this.keywords,
        //file: this.selectedFile
         recrutements: this.latestRecruitment ? [{
          id: this.latestRecruitment.id,
          position: this.CandidateForm.get('position')?.value
        }] : []
      };
      
      console.log('Submitting candidate with hiring date:', hiringDate);

      this.candidateService.updateCandidate(this.data.id,formData)
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


      
      // setTimeout(() => {
      //   this.isSubmitting = false;
      //   console.log('Candidate submitted successfully!');
        
      //   // Close dialog and return the updated data
      //   this.dialogRef.close(formData);
      // }, 2000);
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

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }

  openCvFile() {
    this.candidateService.getCandidateCv(this.data.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        window.open(url);

        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      },
      error: (err) => {
        console.error('Error loading CV file', err);
      }
    });
  }

}