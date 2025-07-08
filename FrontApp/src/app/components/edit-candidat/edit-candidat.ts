import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CandidateService } from 'app/services/candidates';

interface CandidateData {
  id?: number;
  nom?: string;
  prenom?: string;
  phone?: string;
  email?: string;
  competences?: string[];
  cv?: string;
  statut?: string;
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
  cvPath: string = '';
  
  constructor(
    private formBuilder: FormBuilder,
    private candidateService: CandidateService,
    public dialogRef: MatDialogRef<EditCandidat>,
    @Inject(MAT_DIALOG_DATA) public data: CandidateData,
  ) {}

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
      this.CandidateForm.patchValue({
        nom: this.data.nom || '',
        prenom: this.data.prenom || '',
        telephone: this.data.phone || '',
        email: this.data.email || ''
      });
      if (this.data.competences) {
        this.keywords = [...this.data.competences];
      }
      if (this.data.cv) {
        this.cvPath = this.data.cv;
      }
    }
  }

  onSubmit(): void {
    if (this.CandidateForm.valid) {
      this.isSubmitting = true;

      const updatedCandidate = {
        nom: this.CandidateForm.get('nom')?.value,
        prenom: this.CandidateForm.get('prenom')?.value,
        email: this.CandidateForm.get('email')?.value,
        telephone: this.CandidateForm.get('telephone')?.value,
        statut: 'CONTACTED', // Or keep the existing value if you have one
        skills: this.keywords,
        cv: this.cvPath // Just the string path like in create
      };

      this.candidateService.updateCandidate(this.data.id!, updatedCandidate).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.dialogRef.close('refresh');
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Update failed', err);
        }
      });
    } else {
      this.CandidateForm.markAllAsTouched();
    }
  }

  // ==================== KEYWORDS ====================
  addKeyword(keyword: string) {
    keyword = keyword.trim();
    if (keyword && !this.keywords.includes(keyword) && this.keywords.length < 5) {
      this.keywords.push(keyword);
    }
  }

  removeKeyword(keyword: string) {
    this.keywords = this.keywords.filter(k => k !== keyword);
  }

  // ==================== FILE (used for validation or visual, no upload) ====================
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

    if (file.type !== 'application/pdf') {
      this.fileError = true;
      this.fileErrorMessage = 'Please select a PDF file';
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.fileError = true;
      this.fileErrorMessage = 'File size must be less than 10MB';
      return;
    }

    this.selectedFile = file;
    this.cvPath = file.name; // You can change this logic if needed
  }

  removeFile(): void {
    this.selectedFile = null;
    this.cvPath = '';
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

  closeForm(): void {
    this.dialogRef.close();
  }

  getFormProgress(): number {
    const totalFields = 5;
    let completedFields = 0;
    if (this.CandidateForm.get('nom')?.valid) completedFields++;
    if (this.CandidateForm.get('prenom')?.valid) completedFields++;
    if (this.CandidateForm.get('telephone')?.valid) completedFields++;
    if (this.CandidateForm.get('email')?.valid) completedFields++;
    if (this.cvPath) completedFields++;
    return (completedFields / totalFields) * 100;
  }
  onClose(): void {
  this.dialogRef.close();
}

}