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

  private apiUrl = 'http://localhost:9090/talan/api/evaluations';
  
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

getMyInterviews(): Observable<Evaluation[]> {
   return this.http.get<Evaluation[]>(`${this.apiUrl}/my-interviews`);
  
}

getInterviewsAssignedTo(userId: number, roles: string[]): Observable<Evaluation[]> {
    // Example query params for filtering by user and role
    const roleQuery = roles.length ? `?roles=${roles.join(',')}` : '';
    return this.http.get<Evaluation[]>(`${backendUrl}/evaluations/assigned-to/${userId}${roleQuery}`);
  }

}
