import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { NgScrollbar } from 'ngx-scrollbar';
import { FeatherIconsComponent } from '../feather-icons/feather-icons.component';

export interface Patient {
  image: string;
  name: string;
  gender: string;
  lastVisit: string;
  disease: string;
  diseaseClass: string;
}

@Component({
    selector: 'app-todays-appointment',
    imports: [
        MatCardModule,
        MatButtonModule,
        MatTableModule,
        NgScrollbar,
        CommonModule,
    ],
    templateUrl: './todays-appointment.component.html',
    styleUrl: './todays-appointment.component.scss'
})
export class TodaysAppointmentComponent {
  displayedColumns: string[] = [
    'patientName',
    'gender',
    'lastVisit',
    'diseases',
    'report',
    'details',
  ];

  patientDataSource: Patient[] = [
    {
      image: 'assets/images/user/user1.jpg',
      name: 'John Doe',
      gender: 'Male',
      lastVisit: '12/05/2016',
      disease: 'Fever',
      diseaseClass: 'badge col-red',
    },
    {
      image: 'assets/images/user/user2.jpg',
      name: 'Sarah Smith',
      gender: 'Female',
      lastVisit: '12/05/2016',
      disease: 'Cholera',
      diseaseClass: 'badge col-green',
    },
    {
      image: 'assets/images/user/user3.jpg',
      name: 'Airi Satou',
      gender: 'Male',
      lastVisit: '12/05/2016',
      disease: 'Jaundice',
      diseaseClass: 'badge col-purple',
    },
    {
      image: 'assets/images/user/user4.jpg',
      name: 'Angelica Ramos',
      gender: 'Female',
      lastVisit: '12/05/2016',
      disease: 'Typhoid',
      diseaseClass: 'badge col-purple',
    },
    {
      image: 'assets/images/user/user5.jpg',
      name: 'Ashton Cox',
      gender: 'Female',
      lastVisit: '12/05/2016',
      disease: 'Malaria',
      diseaseClass: 'badge col-orange',
    },
    {
      image: 'assets/images/user/user8.jpg',
      name: 'Cara Stevens',
      gender: 'Male',
      lastVisit: '12/05/2016',
      disease: 'Infection',
      diseaseClass: 'badge col-cyan',
    },
    {
      image: 'assets/images/user/user6.jpg',
      name: 'Michael Johnson',
      gender: 'Male',
      lastVisit: '12/06/2016',
      disease: 'Flu',
      diseaseClass: 'badge col-blue',
    },
    {
      image: 'assets/images/user/user7.jpg',
      name: 'Emily Davis',
      gender: 'Female',
      lastVisit: '12/07/2016',
      disease: 'Pneumonia',
      diseaseClass: 'badge col-red',
    },
    {
      image: 'assets/images/user/user9.jpg',
      name: 'David Wilson',
      gender: 'Male',
      lastVisit: '12/08/2016',
      disease: 'Diabetes',
      diseaseClass: 'badge col-green',
    },
    {
      image: 'assets/images/user/user10.jpg',
      name: 'Olivia Brown',
      gender: 'Female',
      lastVisit: '12/09/2016',
      disease: 'Asthma',
      diseaseClass: 'badge col-purple',
    },
    {
      image: 'assets/images/user/user11.jpg',
      name: 'James Garcia',
      gender: 'Male',
      lastVisit: '12/10/2016',
      disease: 'Hypertension',
      diseaseClass: 'badge col-orange',
    },
  ];
}
