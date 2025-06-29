import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface CandidateData {
  nom?: string;
  prenom?: string;
  phone?: string;
  email?: string;
  competences?: string[];
  [key: string]: any;
}

@Component({
  selector: 'app-edit-candidat',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatChipsModule
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
    @Inject(MAT_DIALOG_DATA) public data: CandidateData,
    public dialogRef: MatDialogRef<EditCandidat>,
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
      competences: [[]],
    });
  }

  populateFormWithData(): void {
    if (this.data) {
      console.log('Received data:', this.data);
      
      let fullName = this.extractFirstWord(this.data['name'] || '');

      this.CandidateForm.patchValue({
        prenom: fullName.firstWord,
        nom: fullName.rest,
        telephone: this.data.phone || '',
        email: this.data.email || ''
      });
      
      // Populate keywords/competences
      if (this.data.competences && Array.isArray(this.data.competences)) {
        this.keywords = [...this.data.competences];
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
    if (this.CandidateForm.valid && this.selectedFile) {
      this.isSubmitting = true;
      
      const formData = {
        nom: this.CandidateForm.get('nom')?.value,
        prenom: this.CandidateForm.get('prenom')?.value,
        email: this.CandidateForm.get('email')?.value,
        telephone: this.CandidateForm.get('telephone')?.value,
        competences: this.keywords,
        file: this.selectedFile
      };
      
      console.log('Submitting candidate: ...', formData);
      
      // Simulate API call delay
      setTimeout(() => {
        this.isSubmitting = false;
        console.log('Candidate submitted successfully!');
        
        // Close dialog and return the updated data
        this.dialogRef.close(formData);
      }, 2000);
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