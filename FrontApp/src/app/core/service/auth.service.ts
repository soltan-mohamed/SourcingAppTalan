import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../models/user';
import { Role } from '@core/models/role';

interface LoginResponse {
  id : number;
  email: string;
  token: string;
  expiresIn: number;
  fullName: string;
  roles: Role[]; // Changé de 'role' à 'roles' (array)
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private jwtHelper = new JwtHelperService();
  private apiUrl = 'http://localhost:9090/talan';

  constructor(private http: HttpClient, private router: Router) {
    // Initialize currentUserSubject with null
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    
    // Load user after initialization
    this.loadInitialUser();
  }

  private loadInitialUser(): void {
    const user = this.getUserFromStorage();
    this.currentUserSubject.next(user);
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        map(response => {
          const user = this.createUserFromResponse(response);
          this.storeAuthData(user, response.token);
          this.redirectBasedOnRoles(user.roles); // Modifié pour gérer plusieurs rôles
          return user;
        }),
        catchError(error => {
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  private redirectBasedOnRoles(roles: Role[]): void {
    //console.log('User roles:', roles);
    
    // Priorité des redirections (si l'utilisateur a plusieurs rôles)
    if (roles.includes(Role.MANAGER)) {
      this.router.navigate(['/manager/dashboard']);
    } else if (roles.includes(Role.EVALUATEUR)) {
      this.router.navigate(['/evaluateur/dashboard']);
    } else if (roles.includes(Role.RECRUTEUR)) {
      this.router.navigate(['/home/dashboard']);
    } else {
      //console.error('No valid role found, redirecting to signin');
      this.router.navigate(['/authentication/signin']);
    }
  }
  private createUserFromResponse(response: LoginResponse): User {
    const user = new User();
    user.id = response.id;
    user.email = response.email;
    user.fullName = response.fullName;
    user.roles = response.roles; // Changé pour stocker un tableau
    user.token = response.token;
    return user;
  }

  private getUserFromStorage(): User | null {
    try {
      const userJson = localStorage.getItem('currentUser');
      const token = localStorage.getItem('token');
      
      if (!userJson || !token || this.isTokenExpired(token)) {
        this.clearAuthData();
        return null;
      }
      
      return JSON.parse(userJson) as User;
    } catch (error) {
      //console.error('Error parsing user data:', error);
      this.clearAuthData();
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    return this.jwtHelper.isTokenExpired(token);
  }

  private storeAuthData(user: User, token: string): void {
     // S'assurer que l'objet user contient l'id
   if (!user.id) {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    user.id = tokenPayload.id;  // 👈 only works if the token has 'id'
  }
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', token);
    this.currentUserSubject.next(user);
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/authentication/signin']);
  }

  clearAuthData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    // Check if currentUserSubject exists before calling next
    if (this.currentUserSubject) {
      this.currentUserSubject.next(null);
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject?.value;
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.token;
    return token ? !this.isTokenExpired(token) : false;
  }

  hasRole(requiredRole: Role): boolean {
    const user = this.currentUserValue;
    return user?.roles?.includes(requiredRole) ?? false;
  }

    hasAnyRole(requiredRoles: Role[]): boolean {
    const user = this.currentUserValue;
    return requiredRoles.some(role => user?.roles?.includes(role)) ?? false;
  }
  getCurrentUserRoles(): Role[] {
    const user = this.currentUserValue;
    return user && user.roles ? user.roles.map((role: Role) => role.toUpperCase() as Role) : [];
}

public isValidToken(token: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3; // Valid JWT has 3 parts
}

private extractIdFromToken(token: string): number | null {
  try {
    const decoded = this.jwtHelper.decodeToken(token);
    return decoded?.id ?? null;
  } catch {
    return null;
  }
}

}