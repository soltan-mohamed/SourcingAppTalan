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
