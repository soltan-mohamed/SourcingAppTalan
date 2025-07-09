import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CandidateService } from 'app/services/candidates';

interface User {
  id?: number;
  fullName: string;
  // ajoute d'autres champs si nécessaire (ex: email, id...)
}
interface CandidateData {
  id?: number;
  nom?: string;
  prenom?: string;
  phone?: string;
  email?: string;
  skills?: string[];
  cv?: string;
  statut?: string;
  position?: string;
   responsable: User;
  
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

  dropdownOpen = false;
  responsableNomComplet: string = '';
  responsableInitials: string = '';
 

  statusOptions: string[]=['CONTACTED',
    'SCHEDULED',
    'CANCELLED',
    'ACCEPTED',
    'REJECTED',
    'IN_PROGRESS',
    'VIVIER'];
  
    toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}
updateStatusOnServer(): void {
  const updatedCandidate = this.CandidateForm.value;
   console.log("Sending update for candidate ID:", updatedCandidate.id);
   console.log('Sending candidate data:', this.CandidateForm.value);

  this.candidateService.updateCandidate(updatedCandidate.id, updatedCandidate)
    .subscribe({
      next: (response) => {
        console.log('Status updated successfully', response);
      },
      error: (err) => {
        console.error('Error updating status:', err);
      }
    });
}
selectStatus(status: string):void {
  this.CandidateForm.get('statut')?.setValue(status.toUpperCase());
  this.dropdownOpen = false;
  this.updateStatusOnServer();
}

getStatusClass(status: string | null): string {
  switch (status) {
    case 'CONTACTED':
      return 'bg-blue-100 text-blue-800';
    case 'SCHEDULED':
      return 'bg-orange-100 text-orange-800';
    case 'CANCELLED':
      return 'bg-gray-200 text-gray-700';
    case 'ACCEPTED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800';
    case 'VIVIER':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
getStatusIcon(status: string | null): string {
  switch (status) {
    case 'CONTACTED':
      return `<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3c0 .828-.336 1.578-.879 2.121L4 17h5" />
              </svg>`;
    case 'SCHEDULED':
      return `<svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>`;
    case 'CANCELLED':
      return `<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M6 18L18 6M6 6l12 12" />
              </svg>`;
    case 'ACCEPTED':
      return `<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M5 13l4 4L19 7" />
              </svg>`;
    case 'REJECTED':
      return `<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M6 18L18 6M6 6l12 12" />
              </svg>`;
    case 'IN_PROGRESS':
      return `<svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="2" />
                <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>`;
    case 'VIVIER':
      return `<svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8c-1.657 0-3 1.343-3 3v4h6v-4c0-1.657-1.343-3-3-3z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>`;
    default:
      return '';
  }
}
getInitialsFromFullName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : fullName.substring(0, 2).toUpperCase();
}



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

    const userString = localStorage.getItem('currentUser');
  const userObject = userString ? JSON.parse(userString) : null;
  console.log(userObject); // shows responsable fullname here

  // You can assign this to a component variable if needed, e.g.
  this.responsableNomComplet = userObject?.fullName || '';
  this.responsableInitials = this.getInitialsFromFullName(this.responsableNomComplet);
    this.initializeForm();
    this.populateFormWithData();
     //this.loadStatuts();
     
  }

  initializeForm(): void {
    this.CandidateForm = this.formBuilder.group({
      id: [null],
      nom: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ'-\s]+$/), Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ'-\s]+$/), Validators.minLength(2)]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9-\s]{8}$/)]],
      email: ['', [Validators.required, Validators.email]],
      skills: [[]],
      statut: [''], 
      responsable: [null] ,
    });
  }

  // loadStatuts(): void {
  // this.candidateService.getStatuts().subscribe((statuts) => {
  //   this.statusOptions = statuts;
  // });
  // }
  populateFormWithData(): void {
    console.log('Data reçu:', this.data);
    console.log('Responsable data:', this.data.responsable);
    
    responsable: this.CandidateForm.get('responsable')?.value
    if (this.data) {
      this.CandidateForm.patchValue({
        id: this.data.id, 
        prenom: this.data.prenom,
        nom: this.data.nom,
        telephone: this.data.phone || '',
        email: this.data.email || '',
        statut: this.data.statut || '',
         responsable: this.data.responsable ? { id: this.data.responsable.id } : null

      });
      
      if (this.data.skills && Array.isArray(this.data.skills)) {
        this.keywords = [...this.data.skills];
      }
       if (this.data?.responsable) {
    const fullName = this.data.responsable.fullName;
    this.responsableNomComplet = fullName;
    this.responsableInitials = this.getInitialsFromFullName(fullName);
  }

    }
  }

  onSubmit(): void {
    console.log('Sending candidate data:', this.CandidateForm.value);

    if (this.CandidateForm.valid) {
      this.isSubmitting = true;

      const updatedCandidate = {
        nom: this.CandidateForm.get('nom')?.value,
        prenom: this.CandidateForm.get('prenom')?.value,
        email: this.CandidateForm.get('email')?.value,
        telephone: this.CandidateForm.get('telephone')?.value,
        statut: this.CandidateForm.get('statut')?.value,
        skills: this.keywords,
        cv: this.cvPath,
        responsable: this.CandidateForm.get('responsable')?.value

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