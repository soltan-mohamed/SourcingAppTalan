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
    selector: 'app-emp-status1',
    imports: [MatCardModule, MatButtonModule, MatTableModule, CommonModule],
    templateUrl: './emp-status1.component.html',
    styleUrl: './emp-status1.component.scss'
})
export class EmpStatus1Component {
  empDisplayedColumns1: string[] = ['name1', 'status1'];
  empDataSource1: Employee[] = [
    {
      //image: 'assets/images/user/user5.jpg',
      name: 'Safouane Chabchoub',
     // email: 'mohamed.ali@gmail.com',
     // qualification: '(M.Ed, PhD)',
      status: 'Manager',
     // statusClass: 'badge badge-solid-green',
    },
    {
      //image: 'assets/images/user/user6.jpg',
      name: 'Anouar Khemeja',
      //email: 'sarah.smith@gmail.com',
      //qualification: '(B.Ed, M.A.)',
      status: 'Recruteur',
      //statusClass: 'badge badge-solid-orange',
    },
    {
      //image: 'assets/images/user/user3.jpg',
      name: 'Abdessalem Jebali',
      //email: 'megha.trivedi@gmail.com',
      //qualification: '(B.A., B.Ed)',
      status: 'Evaluateur',
      //statusClass: 'badge badge-solid-green',
    },
    {
      //image: 'assets/images/user/user2.jpg',
      name: 'Fatma Sherif',
      //email: 'john.deo@gmail.com',
      //qualification: '(M.Sc, B.Ed)',
      status: 'Recruteur',
      //statusClass: 'badge badge-solid-green',
    },
    {
      //image: 'assets/images/user/user1.jpg',
      name: 'Walid Othmani',
      //email: 'jacob.ryan@gmail.com',
      //qualification: '(M.A., M.Ed)',
      status: 'Evaluateur',
      //statusClass: 'badge badge-solid-orange',
    },
    {
      //image: 'assets/images/user/user8.jpg',
      name: 'Hend Ben Salem',
      //email: 'jay.soni@gmail.com',
      //qualification: '(B.Ed)',
      status: 'Manager',
      //statusClass: 'badge badge-solid-green',
    },
    {
      //image: 'assets/images/user/user9.jpg',
      name: 'Mohamed Karray',
      //email: 'linda.carter@gmail.com',
      //qualification: '(B.A., M.Ed)',
      status: 'Manager',
      //statusClass: 'badge badge-solid-green',
    },
    {
      //image: 'assets/images/user/user10.jpg',
      name: 'Rim Abidi',
      //email: 'rajesh.kumar@gmail.com',
      //qualification: '(M.A., PhD)',
      status: 'Evaluateur',
      //statusClass: 'badge badge-solid-orange',
    },
  ];
}
