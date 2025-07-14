import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { Evaluation } from '../models/evaluation.model';
import { AuthService } from './auth.service';
import { Recruitment } from '../models/recruitment.model';
import { Role } from '../models/role';
import { CandidateService } from './candidate.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = 'http://localhost:9090/talan/api/evaluations';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public candidateService: CandidateService
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
    //console.log('Cannot add evaluation - missing user or recruteur');
    return false;
  }
  
  /*console.log('Current User:', currentUser);
  console.log('Recruitment Recruteur:', recruitment.recruteur);
  console.log('User Roles:', currentUser.roles);
  console.log('Is RECRUTEUR_MANAGER:', this.authService.hasRole(Role.RECRUTEUR_MANAGER));
  console.log('Is RECRUTEUR:', this.authService.hasRole(Role.RECRUTEUR));
  console.log('Is Owner:', recruitment.recruteur.id === currentUser.id);*/

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
  return this.http.put<Evaluation>(
    `${this.apiUrl}/${id}`,
    {
      type: evaluation.type,
      description: evaluation.description,
      date: evaluation.date,
      evaluateur: { id: evaluation.evaluateurId },
      statut: evaluation.statut
    },
    { headers: this.getAuthHeaders() }
  ).pipe(
    tap(updatedEval => {
      // Refresh candidate data after status update
      if (evaluation.statut) {
        this.refreshCandidateData(updatedEval.recrutement?.candidate?.id);
      }
    })
  );
}

private refreshCandidateData(candidateId?: number): void {
  if (candidateId) {
    // You'll need to implement this method in your candidate service
    this.candidateService.refreshCandidate(candidateId).subscribe();
  }
}

deleteEvaluation(id: number): Observable<void> {
  return this.http.delete(
    `${this.apiUrl}/${id}`,
    { 
      headers: this.getAuthHeaders(),
      observe: 'response',
      responseType: 'text' // Important for error messages
    }
  ).pipe(
    tap(response => {
      if (response.status !== 204) {
        throw new Error(response.body?.toString() || `Unexpected status: ${response.status}`);
      }
    }),
    map(() => undefined),
    catchError(error => {
      console.error('Full error:', error);
      
      // Extract the actual error message from the response
      let message = error.error?.message || error.message;
      
      if (error.error && typeof error.error === 'string') {
        message = error.error;
      } else if (error.status === 400) {
        message = error.error || 'Cannot delete evaluation with status SCHEDULED';
      } else if (error.status === 500) {
        message = 'Server error occurred';
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