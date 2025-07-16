import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { backendUrl } from '@shared/backendUrl';
import { User } from 'app/models/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }

  getAllUsersByRole(role : string): Observable<User[]> {
    return this.http.get<User[]>(`${backendUrl}/users/${role}`).pipe(
      catchError(error => {
        console.error('Error fetching candidates:', error);
        return throwError(() => error);
      })
    );
  }
}

/*import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { User } from '../models/user';
import { AuthService } from '../core/service/auth.service';
import { Role } from '@core/models/role';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
    private apiUrl = 'http://localhost:9090/talan/users';


  constructor(private http: HttpClient,     private authService: AuthService
  ) {}

  
// user.service.ts
getCurrentUser(): Observable<User> {
  const token = this.authService.token;
  
  if (!token || !this.authService.isValidToken(token)) {
    return throwError(() => new Error('Invalid or missing token'));
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<User>(`${this.apiUrl}/me`, { headers }).pipe(
    catchError(error => {
      console.error('Error in getCurrentUser:', error);
      return throwError(() => error);
    })
  );
}

getManagers(): Observable<User[]> {
  return this.http.get<User[]>(`${this.apiUrl}/`, { 
    headers: this.getAuthHeaders() 
  }).pipe(
    map(users => users.filter(user => user.roles.includes(Role.MANAGER))
  ));
}

getEvaluators(): Observable<User[]> {
  return this.http.get<User[]>(`${this.apiUrl}/`, { 
    headers: this.getAuthHeaders() 
  }).pipe(
    map(users => users.filter(user => 
      user.roles.includes(Role.EVALUATEUR)
    ))
  );
}


getRecruiters(): Observable<User[]> {
  return this.http.get<User[]>(`${this.apiUrl}/`, { 
    headers: this.getAuthHeaders() 
  }).pipe(
    map(users => users.filter(user => 
      user.roles.includes(Role.RECRUTEUR)
    ))
  );
}

private getAuthHeaders(): HttpHeaders {
  const token = this.authService.token;
  if (!token) {
    throw new Error('No authentication token available');
  }
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
}
}*/
