import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { Evaluation } from '../models/evaluation.model';
import { AuthService } from './auth.service';
import { Recruitment } from '../models/recruitment.model';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = 'http://localhost:9090/talan/api/evaluations';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  canManageEvaluation(evaluation: Evaluation): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;
    
    // Allow RECRUTEUR_MANAGER or the evaluator who created the evaluation
    return this.authService.hasRole(Role.RECRUTEUR_MANAGER) ||
           evaluation.evaluateur?.id === currentUser.id;
  }

canAddEvaluation(recruitment: Recruitment): boolean {
  const currentUser = this.authService.currentUserValue;
  if (!currentUser || !recruitment?.recruteur) {
    console.log('Cannot add evaluation - missing user or recruteur');
    return false;
  }
  
  console.log('Current User:', currentUser);
  console.log('Recruitment Recruteur:', recruitment.recruteur);
  console.log('User Roles:', currentUser.roles);
  console.log('Is RECRUTEUR_MANAGER:', this.authService.hasRole(Role.RECRUTEUR_MANAGER));
  console.log('Is RECRUTEUR:', this.authService.hasRole(Role.RECRUTEUR));
  console.log('Is Owner:', recruitment.recruteur.id === currentUser.id);

  return this.authService.hasRole(Role.RECRUTEUR_MANAGER) ||
         (this.authService.hasRole(Role.RECRUTEUR) && 
          recruitment.recruteur.id === currentUser.id);
}

createEvaluation(recruitmentId: number, evaluationData: any): Observable<Evaluation> {
  const payload = {
    type: evaluationData.type,
    description: evaluationData.description,
    date: evaluationData.date,
    evaluateur: { id: evaluationData.evaluateurId }
  };

  return this.http.post<Evaluation>(
    `${this.apiUrl}/recrutement/${recruitmentId}`,
    payload,
    { headers: this.getAuthHeaders() }
  );
}



updateEvaluation(id: number, evaluation: any): Observable<Evaluation> {
  const payload = {
    type: evaluation.type,
    description: evaluation.description,
    date: evaluation.date,
    evaluateur: { id: evaluation.evaluateurId },
    statut: evaluation.statut
  };

  return this.http.put<Evaluation>(
    `${this.apiUrl}/${id}`,
    payload,
    { headers: this.getAuthHeaders() }
  );
}

deleteEvaluation(id: number): Observable<void> {
  return this.http.delete<void>(
    `${this.apiUrl}/${id}`,
    { 
      headers: this.getAuthHeaders(),
      observe: 'response' // Get full response
    }
  ).pipe(
    tap(response => {
      console.log('Delete response:', response);
      if (response.status !== 204) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    }),
    map(() => undefined),
    catchError(error => {
      console.error('Full error:', error);
      let message = 'Delete failed';
      if (error.error instanceof ErrorEvent) {
        message = `Client error: ${error.error.message}`;
      } else {
        message = `Server error: ${error.status} ${error.statusText}`;
      }
      return throwError(() => new Error(message));
    })
  );
}
getEvaluationsByRecruitment(recruitmentId: number): Observable<Evaluation[]> {
  return this.http.get<Evaluation[]>(
    `${this.apiUrl}/recrutement/${recruitmentId}`,
    { headers: this.getAuthHeaders() }
  ).pipe(
    map(evaluations => {
      return evaluations.map(e => {
        // Only map evaluateur if it exists, and do not add extra properties
        return {
          ...e,
          evaluateur: e.evaluateur
            ? {
                id: e.evaluateur.id,
                fullName: e.evaluateur.fullName,
                roles: e.evaluateur.roles || []
              }
            : undefined // Use undefined instead of null
        } as Evaluation;
      });
    })
  );
}

  getMyEvaluations(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(
      `${this.apiUrl}/my-evaluations`,
      { headers: this.getAuthHeaders() }
    );
  }



  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token;
    if (!token) {
      throw new Error('No authentication token available');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}