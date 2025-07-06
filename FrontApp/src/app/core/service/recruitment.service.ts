// src/app/core/service/recruitment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recruitment, RecruitmentStatus } from '../models/recruitment.model';
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

// src/app/core/service/recruitment.service.ts
createRecruitment(candidateId: number, position: string, managerId: number): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/candidate/${candidateId}`,
    { position, managerId }, // Send both position and managerId
    { headers: this.getAuthHeaders() }
  );
}

  getRecruitmentsByCandidate(candidateId: number): Observable<Recruitment[]> {
    return this.http.get<Recruitment[]>(
      `${this.apiUrl}/candidate/${candidateId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateRecruitmentStatus(recruitmentId: number, newStatus: RecruitmentStatus): Observable<Recruitment> {
    return this.http.put<Recruitment>(
      `${this.apiUrl}/${recruitmentId}/status`,
      null,
      {
        params: { newStatus },
        headers: this.getAuthHeaders()
      }
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token;
    if (!token) {
      throw new Error('No authentication token available');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}