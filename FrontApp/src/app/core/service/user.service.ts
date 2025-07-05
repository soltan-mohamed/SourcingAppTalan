import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '../models/user';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
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
}