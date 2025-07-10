import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recruitment } from '../models/recruitment.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {
  private apiUrl = 'http://localhost:9090/talan/api/recrutements';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

getRecruitmentsByCandidate(candidateId: number): Observable<Recruitment[]> {
  return this.http.get<Recruitment[]>(
    `${this.apiUrl}/candidate/${candidateId}?_expand=recruteur`,
    { headers: this.getAuthHeaders() }
  );
}

  createRecruitment(candidateId: number, position: string, managerId: number): Observable<Recruitment> {
    return this.http.post<Recruitment>(
      `${this.apiUrl}/candidate/${candidateId}`,
      { position, managerId },
      { headers: this.getAuthHeaders() }
    );
  }

  updateRecruitmentStatus(id: number, status: string): Observable<Recruitment> {
    return this.http.put<Recruitment>(
      `${this.apiUrl}/${id}/status`,
      { status },
      { headers: this.getAuthHeaders() }
    );
  }

  deleteRecruitment(id: number): Observable<void> {
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

  getRecruitmentWithEvaluations(recruitmentId: number): Observable<Recruitment> {
  return this.http.get<Recruitment>(`${this.apiUrl}/${recruitmentId}/with-evaluations`, 
    { headers: this.getAuthHeaders() }
  );
}




}