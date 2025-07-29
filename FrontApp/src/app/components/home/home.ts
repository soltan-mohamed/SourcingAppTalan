import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [
    MatSidenavModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    NgClass,
    CommonModule,
    RouterModule
  ]
})
export class Home implements OnInit {
  role: string = "";
  fullName: string = "";
  sideBarOpened: boolean = true;
  activeItem: string = '';
  currentUser: any;
  isAuthenticated: boolean = true;

  constructor(private router: Router, private authService: AuthService) {
    // Subscribe to authentication status changes
    this.authService.currentUser.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUser = user;
      if (user) {
        this.role = user.roles?.[0] || '';
      }
    });

    // Subscribe to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.setActiveItemBasedOnRoute(event.url);
    });
  }

  ngOnInit() {
    const userString = localStorage.getItem("currentUser");
    this.currentUser = userString ? JSON.parse(userString) : null;
    this.fullName = this.currentUser?.fullName || '';

    // Set initial active item from localStorage or based on route
    const savedActiveItem = localStorage.getItem('activeMenuItem');
    if (savedActiveItem) {
      this.activeItem = savedActiveItem;
    } else {
      this.setActiveItemBasedOnRoute(this.router.url);
    }
  }

  setActiveItemBasedOnRoute(url: string): void {
    if (url.includes('/home/dashboard')) {
      this.activeItem = '';
    } else if (url.includes('/home/my-interviews')) {
      this.activeItem = 'interviews';
    } else if (url.includes('/home/list-candidates')) {
      this.activeItem = 'candidates';
    } else if (url.includes('/home/vivier-candidates')) {
      this.activeItem = 'vivier';
    } else if (url.includes('/home/my-account')) {
      this.activeItem = 'manage-accounts';
    } else if (url.includes('/home/my-publications')) {
      this.activeItem = 'my-publications';
    } else {
      this.activeItem = '';
    }
    
    // Save to localStorage
    localStorage.setItem('activeMenuItem', this.activeItem);
  }

  setActiveItem(item: string): void {
    this.activeItem = item;
    localStorage.setItem('activeMenuItem', item);
  }

  logout(): void {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      localStorage.removeItem('activeMenuItem');
      this.authService.logout();
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}