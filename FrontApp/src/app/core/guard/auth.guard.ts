import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';

import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    const user = this.authService.currentUserValue;
    
    console.log('AuthGuard checking:', {
      path: route.routeConfig?.path,
      requiredRole,
      userRole: user?.role,
      isAuthenticated: this.authService.isAuthenticated()
    });

    // If no specific role required, just check authentication
    if (!requiredRole) {
      return this.authService.isAuthenticated();
    }

    // Check if user has the required role
    if (user && user.role === requiredRole) {
      return true;
    }
    
    // If not authorized, redirect to login
    this.authService.logout();
    this.router.navigate(['/authentication/signin']);
    return false;
  }
}