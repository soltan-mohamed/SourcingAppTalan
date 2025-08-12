import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { backendUrl } from '@shared/backendUrl';

@Injectable({
  providedIn: 'root'
})
export class RecrutementService {

  constructor(private http : HttpClient) { }

  CreateNewRecrutement(recrutement: any): Observable<any> {

    return this.http.post<any>(`${backendUrl}/recrutements`, recrutement)
      .pipe(
        catchError(error => {
          console.error('API Error:', error);
          if (error.status === 401) {
            console.error('Unauthorized: Token might be invalid, expired, or headers missing.');
          }
          return throwError(() => error);
        })
      );
  }

  updateRecrutementStatus(updatedRecrutement : any) : Observable<any> {
    return this.http.put<any>(`${backendUrl}/recrutements`, updatedRecrutement)
      .pipe(
        catchError(error => {
          console.error('API Error:', error);
          if (error.status === 401) {
            console.error('Unauthorized: Token might be invalid, expired, or headers missing.');
          }
          return throwError(() => error);
        })
      );
  }
}
