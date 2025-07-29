import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeatherModule } from 'angular-feather';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AddInterviewComponent } from './add-interview/add-interview';
import { EditInterviewComponent } from './edit-interview/edit-interview';
import { Evaluation } from 'app/models/evaluation';
import { InterviewService } from 'app/services/interview-service';
import { AuthService } from '@core/service/auth.service';
import { InterviewStateService } from 'app/services/interview-state';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule,
          MatTableModule, 
          MatIconModule, 
          MatInputModule, 
          FormsModule,
          MatTooltipModule,
          FeatherModule,
        MatDialogModule],
  templateUrl: './interviews.html',
  styleUrls: ['./interviews.scss']
})
export class InterviewsComponent implements OnInit {
  
   searchDate: string = '';
  
  displayedColumns: string[] = ['candidate', 'date', 'time', 'type','position','evaluator','days left','actions'];

  interviews: Evaluation[] = [];


   get dataSource() {
    return this.searchDate
      ? this.interviews.filter(i => i.date.includes(this.searchDate))
      : this.interviews;
  }

  // Removed duplicate editInterview function

  constructor(private dialog: MatDialog,private interviewService: InterviewService,private authService: AuthService, private interviewStateService: InterviewStateService) {}
  addInterview() {
  const dialogRef = this.dialog.open(AddInterviewComponent,{
    panelClass: 'add-interview-dialog-panel'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.interviews.push(result);
    }
  });
}
  calculateDaysLeft(date: Date): number {
  const today = new Date();
  const interviewDate = new Date(date);
  const timeDiff = interviewDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  editInterview(interview: any): void {
  const dialogRef = this.dialog.open(EditInterviewComponent, {
    width: '500px',
    data: { interview } // pass the current interview
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Update your interviews list with the edited data if needed
       console.log("Payload received from dialog, sending to service:", result);

      // 2. Préparer l'objet DTO pour la mise à jour
  //     const updatePayload = {
  //       id: interview.id,
  //      date: new Date(`${result.date}T${result.time}:00`).toISOString(),
  //       evaluateur_id: result.evaluatorId ,
  //       type: result.type,
  // description: result.description ?? '',
  // statut: interview.statut ?? 'SCHEDULED',
  // position: result.position
  //     };
      // 3. Appeler le service pour sauvegarder
      const updatePayload = {
  evaluateurId: result.evaluatorId,
  date: new Date(result.date).toISOString(),
  description: result.description,
  type: result.type,
  statut: result.statut
};
      this.interviewService.updateEvaluation(interview.id, updatePayload).subscribe({
        next: (updatedInterview) => {
          // 4. Mettre à jour la liste locale pour un affichage immédiat
          const index = this.interviews.findIndex(i => i.id === interview.id);
          if (index > -1) {
            // Remplacer l'ancien objet par celui retourné par le backend
            this.interviews[index] = updatedInterview;
            // Forcer la détection de changement si le dataSource ne se met pas à jour
            this.interviews = [...this.interviews]; 
          }
          console.log('Interview updated successfully!', updatedInterview);
          this.interviewStateService.notifyInterviewUpdated(updatedInterview);
          console.log("🔁 Backend response:", updatedInterview);

          // 5. (IMPORTANT) Notifier les autres composants du changement (voir Étape 3)
        },
        
        error: (err) => {
          console.error('Failed to update interview', err);
        }
      });
    }
    
  });
}

 

  ngOnInit(): void {
     this.loadInterviews();
}
 loadInterviews(): void {
 console.log("Loading interviews for the authenticated user...");

    this.interviewService.getMyInterviews().subscribe({ // ✅ APPEL DE LA BONNE MÉTHODE
      next: (interviews) => {
        console.log("Interviews received:", interviews);
        this.interviews = interviews.filter(interview => 
          interview.statut === 'SCHEDULED' // Vous pouvez conserver ce filtre côté client si besoin
        );
      },
      error: (err) => {
        // L'erreur 500 ne devrait plus se produire.
        // Vous pourriez avoir une erreur 401/403 si le token n'est pas valide ou manquant.
        console.error('Error fetching my interviews:', err);
      }
    });
  }
}



