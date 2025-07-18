import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { backendUrl } from '@shared/backendUrl';
import { Evaluation } from 'app/models/evaluation';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {

  constructor(private http: HttpClient) { }

  CreateNewInterview(interview: Evaluation): Observable<any> {

    return this.http.post<Evaluation>(`${backendUrl}/evaluations`, interview)
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
  updateEvaluation(id: number, updatedEvaluation: Partial<Evaluation>): Observable<Evaluation> {
  return this.http.put<Evaluation>(`${backendUrl}/evaluations/${id}`, updatedEvaluation)
    .pipe(
      tap(res => {
        console.log("✅ Évaluation mise à jour :", res);
      }),
      catchError(error => {
        console.error("❌ Échec mise à jour évaluation :", error);
        return throwError(() => error);
      })
    );
}

}
