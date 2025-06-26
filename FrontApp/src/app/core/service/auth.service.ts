import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../models/user';
import { Role } from '@core/models/role';

interface LoginResponse {
  email: string;
  token: string;
  expiresIn: number;
  fullName: string;
  role: Role;
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
        this.redirectBasedOnRole(user.role); // Add this line
        return user;
      }),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
}

private redirectBasedOnRole(role: Role): void {
  console.log('Attempting redirect for role:', role);
  
  const routes = {
    [Role.RECRUTEUR]: '/recruteur', // Juste '/recruteur' car la redirection est gérée dans RECRUTEUR_ROUTE
    [Role.EVALUATEUR]: '/evaluateur',
    [Role.MANAGER]: '/manager'
  };

  const targetRoute = routes[role] || '/recruteur';
  
  console.log('Navigating to:', targetRoute);
  this.router.navigateByUrl(targetRoute)
    .then(success => {
      if (!success) {
        console.error('Navigation failed, falling back to dashboard');
        this.router.navigate(['/recruteur']);  /// hna l'mochkla !!!!!!
      }
    })
    .catch(err => {
      console.error('Navigation error:', err);
      this.router.navigate(['/dashboard']);
    });
}
  private createUserFromResponse(response: LoginResponse): User {
    const user = new User();
    user.email = response.email;
    user.fullName = response.fullName;
    user.role = response.role;
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
      console.error('Error parsing user data:', error);
      this.clearAuthData();
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    return this.jwtHelper.isTokenExpired(token);
  }

  private storeAuthData(user: User, token: string): void {
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
    return user?.role === requiredRole;
  }
}