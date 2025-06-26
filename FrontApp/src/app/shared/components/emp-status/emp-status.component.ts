import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';

export interface Employee {
 // image: string;
  name: string;
 // email: string;
  //qualification: string;
  status: string;
  //statusClass: string;
}

@Component({
    selector: 'app-emp-status',
    imports: [MatCardModule, MatButtonModule, MatTableModule, CommonModule],
    templateUrl: './emp-status.component.html',
    styleUrl: './emp-status.component.scss'
})
export class EmpStatusComponent {
  empDisplayedColumns: string[] = ['name', 'status'];
  empDataSource: Employee[] = [
    {
      //image: 'assets/images/user/user5.jpg',
      name: 'Mohamed Ali',
     // email: 'mohamed.ali@gmail.com',
     // qualification: '(M.Ed, PhD)',
      status: 'Accepted',
     // statusClass: 'badge badge-solid-green',
    },
    {
      //image: 'assets/images/user/user6.jpg',
      name: 'Sami Ben Amor',
      //email: 'sarah.smith@gmail.com',
      //qualification: '(B.Ed, M.A.)',
      status: 'Refused',
      //statusClass: 'badge badge-solid-orange',
    },
    {
      //image: 'assets/images/user/user3.jpg',
      name: 'Omar Al Mansoori',
      //email: 'megha.trivedi@gmail.com',
      //qualification: '(B.A., B.Ed)',
      status: 'Accepted',
      //statusClass: 'badge badge-solid-green',
    },
    {
      //image: 'assets/images/user/user2.jpg',
      name: 'Sarah Ben Amor',
      //email: 'john.deo@gmail.com',
      //qualification: '(M.Sc, B.Ed)',
      status: 'Accepted',
      //statusClass: 'badge badge-solid-green',
    },
    {
      //image: 'assets/images/user/user1.jpg',
      name: 'Afef Messaoudi',
      //email: 'jacob.ryan@gmail.com',
      //qualification: '(M.A., M.Ed)',
      status: 'Refused',
      //statusClass: 'badge badge-solid-orange',
    },
    {
      //image: 'assets/images/user/user8.jpg',
      name: 'Ghassen Ben Amor',
      //email: 'jay.soni@gmail.com',
      //qualification: '(B.Ed)',
      status: 'Accepted',
      //statusClass: 'badge badge-solid-green',
    },
    {
      //image: 'assets/images/user/user9.jpg',
      name: 'Jamel Nourredine',
      //email: 'linda.carter@gmail.com',
      //qualification: '(B.A., M.Ed)',
      status: 'Accepted',
      //statusClass: 'badge badge-solid-green',
    },
    {
      //image: 'assets/images/user/user10.jpg',
      name: 'Ahmed El Khatib',
      //email: 'rajesh.kumar@gmail.com',
      //qualification: '(M.A., PhD)',
      status: 'Refused',
      //statusClass: 'badge badge-solid-orange',
    },
    {
      //image: 'assets/images/user/user11.jpg',
      name: 'Sofia Al Zahrani',
      //email: 'nina.patel@gmail.com',
      //qualification: '(B.Ed)',
      status: 'Accepted',
      //statusClass: 'badge badge-solid-green',
    },
    {
      //image: 'assets/images/user/user1.jpg',
      name: 'Sana Al Farsi',
      //email: 'michael.lee@gmail.com',
      //qualification: '(M.Ed, B.A.)',
      status: 'Accepted',
      //statusClass: 'badge badge-solid-green',
    },
  ];
}
