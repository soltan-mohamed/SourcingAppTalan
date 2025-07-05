import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/service/auth.service';
import { Role } from '@core/models/role';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() activeItem: string = 'dashboard';
  @Output() logoutEvent = new EventEmitter<void>();
  @Output() activeItemChange = new EventEmitter<string>();

  constructor(private authService: AuthService) {}

  get userName(): string {
    return this.authService.currentUserValue?.fullName || 'User';
  }

  get userRole(): string {
    const roles = this.authService.currentUserValue?.roles;
    if (!roles || roles.length === 0) return 'User';
    
    return roles[0]; 
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout() {
    this.logoutEvent.emit();
  }

  setActiveItem(item: string) {
    this.activeItem = item;
    this.activeItemChange.emit(item);
  }
}