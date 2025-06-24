import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgScrollbar } from 'ngx-scrollbar';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import { MatIcon } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-candidates',
  imports: [
    MatCardModule,
    NgScrollbar,
    TableCardComponent,
    MatIcon,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './candidates.html',
  styleUrl: './candidates.scss'
})
export class Candidates {

  studentColumnDefinitions = [
    { def: 'name', label: 'Name', type: 'text' },
    { def: 'phone', label: 'Phone', type: 'phone' },
    { def: 'email', label: 'Email', type: 'email' },
    { def: 'position', label: 'Position', type: 'text' },
    //{ def: 'dateOfAdmission', label: 'Date', type: 'date' },
    { def: 'status', label: 'Status', type: 'text' },
    { def: 'cv', label: 'CV', type: 'file' },
    { def: 'actions', label: 'Actions', type: 'actionBtn' },
  ];

  studentData = [
    {
      id: 1,
      name: 'Mohamed Soltan',
      phone: '+21655201869',
      email: 'soltan.mohamed@esprit.tn',
      position: 'IT',
      //dateOfAdmission: '12-06-2025',
      status : 'accepted',
      img: 'assets/images/user/user8.jpg',
      cv: 'download link',
    },
    {
      id: 2,
      name: 'Ons Trabelsi',
      phone: '+21698123456	',
      email: 'ons.trabelsi@gmail.com',
      position: 'AI',
      //dateOfAdmission: '10-05-2025',
      status : 'KO',
      img: 'assets/images/user/user2.jpg',
      cv: 'download link',
    },
    {
      id: 3,
      name: 'Ahmed Salhi',
      phone: '+21620345678',
      email: 'ahmed.salhi@gmail.com',
      position: 'IT Support',
      //dateOfAdmission: '10-05-2025',
      status : 'scheduled',
      img: 'assets/images/user/user3.jpg',
      cv: 'download link',
    },
    {
      id: 4,
      name: 'Seifeddine Gharbi	',
      phone: '+21652987654	',
      email: '	seif.gharbi@gmail.com',
      position: 'Data Science	',
      //dateOfAdmission: '12-06-2025',
      status : 'scheduled',
      img: 'assets/images/user/user4.jpg',
      cv: 'download link',
    },
    {
      id: 5,
      name: 'Nour Ben Aissa',
      phone: '+21629456123',
      email: 'nour.aissa@gmail.com',
      position: 'Web Development',
      //dateOfAdmission: '10-06-2025',
      status : 'vivier',
      img: 'assets/images/user/user6.jpg',
      cv: 'download link',
    },
    {
      id: 6,
      name: 'Youssef Kacem',
      phone: '+21623789012',
      email: 'youssef.kacem@gmail.com',
      position: 'Cybersecurity	',
      //dateOfAdmission: '12-06-2025',
      status : 'KO',
      img: 'assets/images/user/user7.jpg',
      cv: 'download link',
    },
    {
      id: 7,
      name: 'Rania Jaziri	',
      phone: '+21655112334',
      email: 'rania.jaziri@gmail.com',
      position: 'Cloud Computing',
      //dateOfAdmission: '10-06-2025',
      status : 'scheduled',
      img: 'assets/images/user/user8.jpg',
      cv: 'download link',
    },
  ];

}
