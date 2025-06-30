import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
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
  selector: 'app-create-recrutement',
  imports: [ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule
  ],
  templateUrl: './create-recrutement.html',
  styleUrl: './create-recrutement.scss'
})
export class CreateRecrutement implements OnInit {

  managerList = ['Alice Johnson', 'Bob Smith', 'Charlie Davis', 'Diana Lee'];

  recrutementForm!: FormGroup;
  
  isSubmitting: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: CandidateData,
    private dialogRef: MatDialogRef<CreateRecrutement>
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.recrutementForm = this.formBuilder.group({
      poste: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ'-\s]+$/), Validators.minLength(2) ]],
      date: ['', [Validators.required ]],
    });
  }


  onSubmit(): void {
    // if (this.recrutementForm.valid) {
    //   this.isSubmitting = true;
      
    //   const formData = {
    //     nom: this.recrutementForm.get('nom')?.value,
    //     prenom: this.recrutementForm.get('prenom')?.value,
    //     email: this.recrutementForm.get('email')?.value,
    //     telephone: this.recrutementForm.get('telephone')?.value,
    //     competences: this.keywords,
    //     file: this.selectedFile
    //   };
      
    //   console.log('Submitting candidate: ...', formData);
      
    //   // Simulate API call delay
    //   setTimeout(() => {
    //     this.isSubmitting = false;
    //     console.log('Candidate submitted successfully!');
    //     this.resetForm();
    //   }, 2000);
    // } else {
    //   this.recrutementForm.markAllAsTouched();
      
    //   // if (this.selectedDomainNames.length === 0) {
    //   //   this.recrutementForm.get('domains')?.setErrors({ required: true });
    //   // }
      
    //   if (!this.selectedFile) {
    //     this.fileError = true;
    //     this.fileErrorMessage = 'Please select a PDF file';
    //   }
    // }
  }

  closeForm(): void {
    // Reset form and close modal/dialog
    this.resetForm();
    console.log('Form closed');
  }

  private resetForm(): void {
    this.recrutementForm.reset();
    this.isSubmitting = false;
  }
}