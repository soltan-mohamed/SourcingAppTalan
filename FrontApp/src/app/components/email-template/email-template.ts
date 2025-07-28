import { Component,  OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Evaluation } from 'app/models/evaluation';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { Recrutement } from 'app/models/recrutement';
import { User } from 'app/models/user';
import {MatButtonModule} from '@angular/material/button';

import { MatSnackBar,MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-email-template',
  imports: [
    CommonModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './email-template.html',
  styleUrl: './email-template.scss'
})
export class EmailTemplate {

  lang : string = "EN";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar : MatSnackBar
  ) {}

  changeLanguage(newLang : string) {
    this.lang = newLang;
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

  formatContactTime(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Time';
      }

      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // use true for 12-hour format (AM/PM)
      });
    } catch (error) {
      return 'Invalid Time';
    }
  }


  formatContactDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } 
    catch (error) {
        return 'Invalid Date';
    }
  }

  copyEmailTemplate() : void {
    const emailContent = document.getElementById('emailContent') as HTMLElement | null;
    let textContent = emailContent?.innerText || emailContent?.textContent || '';

    
    // // Add subject line to the copied content
    // const subjectLine = document.querySelector('.subject-line')!.innerText;
    // textContent = subjectLine + '\n\n' + textContent;
    
    // Copy to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textContent).then(() => {
            this.snackBar.open(
              '✅ Email template copied to clipboard!',
              'Close',
              {
                duration: 2000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['success-snackbar']
              }
            );
        }).catch( () => {
            this.fallbackCopyTextToClipboard(textContent);
        });
    } 
    else {
      this.fallbackCopyTextToClipboard(textContent);
    }
  }

  fallbackCopyTextToClipboard(text : any) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        //showSuccessMessage();
    } catch (err) {
        alert('Unable to copy to clipboard. Please select and copy manually.');
    }
    
    document.body.removeChild(textArea);
  }

}
