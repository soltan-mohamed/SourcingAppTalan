import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { backendUrl } from '@shared/backendUrl';
import { User } from 'app/models/user';
import { AuthService } from '@core/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {


  constructor(private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllUsersByRole(role : string): Observable<User[]> {
    return this.http.get<User[]>(`${backendUrl}/users/${role}`).pipe(
      catchError(error => {
        console.error('Error fetching candidates:', error);
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): Observable<User> {
    const token = this.authService.token;
    
    if (!token || !this.authService.isValidToken(token)) {
      return throwError(() => new Error('Invalid or missing token'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<User>(`${backendUrl}/users/me`, { headers }).pipe(
      catchError(error => {
        console.error('Error in getCurrentUser:', error);
        return throwError(() => error);
      })
    );
  }
}