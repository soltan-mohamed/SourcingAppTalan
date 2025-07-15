import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FormsModule} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [MatSidenavModule,
     MatButtonModule,
     FormsModule,
     MatIconModule,
     NgClass,
     CommonModule,
     RouterModule
  ]
})
export class Home implements OnInit {
  role : string = "";
  fullName : string = "";
  sideBarOpened: boolean = true; // Set to true to keep sidebar open by default
  activeItem: string = 'home';
  currentUser: any;
  isAuthenticated: boolean = true;

  constructor(private router: Router) {

  }

  ngOnInit() {

    const userString = localStorage.getItem("currentUser")
    this.currentUser = userString ? JSON.parse(userString) : null ;
    this.fullName = this.currentUser.fullName;

    // Set active item based on current route
    const currentUrl = this.router.url;
    if (currentUrl.includes('/home/list')) {
      this.activeItem = 'home';
    } else if (currentUrl.includes('/home/my-account')) {
      this.activeItem = 'manage-accounts';
    } else if (currentUrl.includes('/home/my-publications')) {
      this.activeItem = 'my-publications';
    } else {
      this.activeItem = 'home';
    }
  }

  // Logout method
  logout() {
  }

  // Navigate to login page
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}