import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { User } from 'app/models/user';
import { UsersService } from 'app/services/users-service';

@Component({
  selector: 'app-add-interview-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatInputModule,
    MatSelectModule, 
    MatButtonModule
  ],
  templateUrl: './add-interview.html',
  styleUrls: ['./add-interview.scss']
})
export class AddInterviewComponent {

  users : User[] = [];
  interview = {
    date: '',
    time: '',
    type: '',
    evaluator: ''
  };

  constructor(
    public dialogRef: MatDialogRef<AddInterviewComponent>,
    private usersService : UsersService,
  ) {}

  save() {
    if (this.interview.date) {
      this.dialogRef.close(this.interview);
    }
  }

  getUsersByRole(role : string): void {
    this.usersService.getAllUsersByRole(role).subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error("An internal server error has occurred !");
      }
    });
  }

  onTypeChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.getUsersByRole(selectedValue)
  }

}
