
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { NgScrollbar } from 'ngx-scrollbar';
import { FeatherIconsComponent } from '../feather-icons/feather-icons.component';

export interface Doctor {
  image: string;
}

export interface Operation {
  patientImage: string;
  patientName: string;
  doctors: Doctor[];
  extraDoctors: number;
  dateOfOperation: string;
  disease: string;
  operationType: string;
  duration: string;
  anesthesiaType: string;
  postOpStatus: string;
  followUpDate: string;
  location: string;
  notes: string;
  surgeonLead: string;
  patientID: string;
  billingInformation: string;
}

@Component({
    selector: 'app-operations-tbl-widget',
    imports: [
        MatCardModule,
        MatButtonModule,
        MatTableModule,
        NgScrollbar,
        FeatherIconsComponent
    ],
    templateUrl: './operations-tbl-widget.component.html',
    styleUrl: './operations-tbl-widget.component.scss'
})
export class OperationsTblWidgetComponent {
  displayedColumns: string[] = [
    'patientName',
    'doctorsTeam',
    'dateOfOperation',
    'duration',
    'anesthesiaType',
    'followUpDate',
    'report',
    'diseases',
    'actions',
  ];

  operationDataSource: Operation[] = [
    {
      patientImage: 'assets/images/user/user8.jpg',
      patientName: 'John Deo',
      doctors: [
        { image: 'assets/images/user/user1.jpg' },
        { image: 'assets/images/user/user2.jpg' },
      ],
      extraDoctors: 2,
      dateOfOperation: '12-08-2019',
      disease: 'Cancer',
      operationType: 'Tumor Resection',
      duration: '3 hours',
      anesthesiaType: 'General',
      postOpStatus: 'Stable',
      followUpDate: '12-09-2019',
      location: 'Operating Room 2',
      notes: 'Patient is responding well to treatment.',
      surgeonLead: 'Dr. Jacob Ryan',
      patientID: 'P001',
      billingInformation: 'Covered by insurance, co-pay: $100',
    },
    {
      patientImage: 'assets/images/user/user5.jpg',
      patientName: 'Jens Brincker',
      doctors: [
        { image: 'assets/images/user/user3.jpg' },
        { image: 'assets/images/user/user2.jpg' },
      ],
      extraDoctors: 1,
      dateOfOperation: '14-08-2019',
      disease: 'Fracture',
      operationType: 'Fracture Fixation',
      duration: '2 hours',
      anesthesiaType: 'Local',
      postOpStatus: 'Recovery',
      followUpDate: '14-09-2019',
      location: 'Operating Room 1',
      notes: 'Surgery went as planned.',
      surgeonLead: 'Dr. Sarah Smith',
      patientID: 'P002',
      billingInformation: 'Insurance claim filed, awaiting approval.',
    },
    {
      patientImage: 'assets/images/user/user6.jpg',
      patientName: 'Alice Johnson',
      doctors: [
        { image: 'assets/images/user/user4.jpg' },
        { image: 'assets/images/user/user1.jpg' },
      ],
      extraDoctors: 3,
      dateOfOperation: '20-08-2019',
      disease: 'Appendicitis',
      operationType: 'Appendectomy',
      duration: '1.5 hours',
      anesthesiaType: 'General',
      postOpStatus: 'Stable',
      followUpDate: '20-09-2019',
      location: 'Operating Room 3',
      notes: 'Monitor for signs of infection.',
      surgeonLead: 'Dr. Jay Soni',
      patientID: 'P003',
      billingInformation: 'Fully covered by insurance.',
    },
    {
      patientImage: 'assets/images/user/user7.jpg',
      patientName: 'Robert Brown',
      doctors: [
        { image: 'assets/images/user/user5.jpg' },
        { image: 'assets/images/user/user2.jpg' },
      ],
      extraDoctors: 1,
      dateOfOperation: '25-08-2019',
      disease: 'Hernia',
      operationType: 'Hernia Repair',
      duration: '2 hours',
      anesthesiaType: 'Local',
      postOpStatus: 'Recovery',
      followUpDate: '25-09-2019',
      location: 'Operating Room 1',
      notes: 'Successful repair, follow-up in one month.',
      surgeonLead: 'Dr. Jacob Ryan',
      patientID: 'P004',
      billingInformation: 'Co-pay: $150.',
    },
    {
      patientImage: 'assets/images/user/user8.jpg',
      patientName: 'Sophia Clark',
      doctors: [
        { image: 'assets/images/user/user3.jpg' },
        { image: 'assets/images/user/user1.jpg' },
      ],
      extraDoctors: 4,
      dateOfOperation: '30-08-2019',
      disease: 'Gallstones',
      operationType: 'Cholecystectomy',
      duration: '2.5 hours',
      anesthesiaType: 'General',
      postOpStatus: 'Stable',
      followUpDate: '30-09-2019',
      location: 'Operating Room 2',
      notes: 'Patient is recovering well, no complications.',
      surgeonLead: 'Dr. Sarah Smith',
      patientID: 'P005',
      billingInformation: 'Insurance approved, no out-of-pocket expenses.',
    },
    {
      patientImage: 'assets/images/user/user9.jpg',
      patientName: 'Liam Davis',
      doctors: [
        { image: 'assets/images/user/user4.jpg' },
        { image: 'assets/images/user/user2.jpg' },
      ],
      extraDoctors: 2,
      dateOfOperation: '05-09-2019',
      disease: 'Knee Injury',
      operationType: 'Knee Arthroscopy',
      duration: '2 hours',
      anesthesiaType: 'Local',
      postOpStatus: 'Recovery',
      followUpDate: '05-10-2019',
      location: 'Operating Room 1',
      notes: 'Physical therapy recommended.',
      surgeonLead: 'Dr. Jay Soni',
      patientID: 'P006',
      billingInformation: 'Insurance covered, co-pay: $75.',
    },
    {
      patientImage: 'assets/images/user/user10.jpg',
      patientName: 'Emma Wilson',
      doctors: [
        { image: 'assets/images/user/user5.jpg' },
        { image: 'assets/images/user/user3.jpg' },
      ],
      extraDoctors: 1,
      dateOfOperation: '10-09-2019',
      disease: 'Cataract',
      operationType: 'Cataract Surgery',
      duration: '1 hour',
      anesthesiaType: 'Local',
      postOpStatus: 'Stable',
      followUpDate: '10-10-2019',
      location: 'Operating Room 2',
      notes: 'Vision improved post-surgery.',
      surgeonLead: 'Dr. Jacob Ryan',
      patientID: 'P007',
      billingInformation: 'Insurance processed, no out-of-pocket expenses.',
    },
    {
      patientImage: 'assets/images/user/user11.jpg',
      patientName: 'Olivia Martinez',
      doctors: [
        { image: 'assets/images/user/user1.jpg' },
        { image: 'assets/images/user/user2.jpg' },
      ],
      extraDoctors: 3,
      dateOfOperation: '15-09-2019',
      disease: 'Cardiac',
      operationType: 'Bypass Surgery',
      duration: '4 hours',
      anesthesiaType: 'General',
      postOpStatus: 'Stable',
      followUpDate: '15-10-2019',
      location: 'Operating Room 3',
      notes: 'Monitor heart rate closely.',
      surgeonLead: 'Dr. Sarah Smith',
      patientID: 'P008',
      billingInformation: 'Insurance claim in process.',
    },
    {
      patientImage: 'assets/images/user/user7.jpg',
      patientName: 'William Johnson',
      doctors: [
        { image: 'assets/images/user/user4.jpg' },
        { image: 'assets/images/user/user3.jpg' },
      ],
      extraDoctors: 2,
      dateOfOperation: '20-09-2019',
      disease: 'Spinal',
      operationType: 'Spinal Fusion',
      duration: '5 hours',
      anesthesiaType: 'General',
      postOpStatus: 'Recovery',
      followUpDate: '20-10-2019',
      location: 'Operating Room 1',
      notes: 'Pain management plan initiated.',
      surgeonLead: 'Dr. Jay Soni',
      patientID: 'P009',
      billingInformation: 'Covered by insurance.',
    },
    {
      patientImage: 'assets/images/user/user5.jpg',
      patientName: 'Mia Brown',
      doctors: [
        { image: 'assets/images/user/user2.jpg' },
        { image: 'assets/images/user/user5.jpg' },
      ],
      extraDoctors: 1,
      dateOfOperation: '25-09-2019',
      disease: 'Obesity',
      operationType: 'Bariatric Surgery',
      duration: '3 hours',
      anesthesiaType: 'General',
      postOpStatus: 'Stable',
      followUpDate: '25-10-2019',
      location: 'Operating Room 2',
      notes: 'Diet and exercise plan discussed.',
      surgeonLead: 'Dr. Jacob Ryan',
      patientID: 'P010',
      billingInformation: 'Insurance claim filed, awaiting approval.',
    },
  ];
}
