import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgScrollbar } from 'ngx-scrollbar';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import { MatIcon } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateCandidat } from '../create-candidat/create-candidat';
import { CandidateService } from 'app/services/candidates';

@Component({
  selector: 'app-candidates',
  imports: [
    MatCardModule,
    NgScrollbar,
    TableCardComponent,
    MatIcon,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './candidates.html',
  styleUrl: './candidates.scss'
})
export class Candidates implements OnInit {

  constructor(
    private dialog: MatDialog,
     private candidateService: CandidateService
  ) {}
  

  studentColumnDefinitions = [
    { def: 'name', label: 'Name', type: 'text' },
    { def: 'phone', label: 'Phone', type: 'phone' },
    { def: 'email', label: 'Email', type: 'email' },
    { def: 'position', label: 'Position', type: 'text' },
    { def: 'statut', label: 'Statut', type: 'text' },
    { def: 'cv', label: 'CV', type: 'file' },
    { def: 'actions', label: 'Actions', type: 'actionBtn' },
  ];

  studentData : any[]= [];
  ngOnInit(): void {
    this.loadCandidates();
  }
  loadCandidates(): void {
    this.candidateService.getAllCandidates().subscribe({
      next: (data) => {
        this.studentData = data.map(c => ({
          id: c.id,
          name: `${c.nom} ${c.prenom}`,
          phone: c.telephone,
          email: c.email,
          position: '-', // Remplace par la vraie info si tu l'as
          statut: c.statut,
          cv: c.cv || 'N/A'
        }));
      },
      error: (err) => {
  console.error('Erreur lors du chargement des candidats :', err);
  console.error('Status HTTP:', err.status);
  console.error('Message:', err.message);
  console.error('Erreur backend:', err.error);
}

    });
  }
openAddCandidate(): void {
    const dialogRef = this.dialog.open(CreateCandidat, {
      width: '800px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadCandidates(); // 🔁 recharge la liste après ajout
      }
    });
  }

}
