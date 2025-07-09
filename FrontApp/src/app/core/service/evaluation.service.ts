import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evaluation } from '../models/evaluation.model';
import { AuthService } from './auth.service';
import { Recruitment } from '../models/recruitment.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = 'http://localhost:9090/talan/api/evaluations';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

createEvaluation(recruitmentId: number, evaluation: Evaluation): Observable<Evaluation> {
  return this.http.post<Evaluation>(
    `${this.apiUrl}/recrutement/${recruitmentId}`,
    evaluation,
    { headers: this.getAuthHeaders() }
  );
}

  updateEvaluation(id: number, evaluation: Evaluation): Observable<Evaluation> {
    return this.http.put<Evaluation>(
      `${this.apiUrl}/${id}`,
      evaluation,
      { headers: this.getAuthHeaders() }
    );
  }

  getEvaluationsByRecruitment(recruitmentId: number): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(
      `${this.apiUrl}/recrutement/${recruitmentId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getMyEvaluations(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(
      `${this.apiUrl}/my-evaluations`,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteEvaluation(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
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