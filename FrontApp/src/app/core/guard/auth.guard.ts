import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';

import { AuthService } from '../service/auth.service';
import { Role } from '@core/models/role';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Role[];
    const user = this.authService.currentUserValue;


    // Si aucune restriction de rôle
    if (!requiredRoles) {
      return this.authService.isAuthenticated();
    }

    // Vérifie si l'utilisateur a au moins un des rôles requis
    if (user && this.authService.hasAnyRole(requiredRoles)) {
      return true;
    }
    
    // Si non autorisé, redirige vers login
    this.authService.logout();
    this.router.navigate(['/authentication/signin']);
    return false;
  }
}