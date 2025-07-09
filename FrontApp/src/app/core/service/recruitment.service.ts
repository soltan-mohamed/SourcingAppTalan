import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Recruitment, RecruitmentStatus } from '../models/recruitment.model';
import { AuthService } from './auth.service';
import { Role } from '@core/models/role';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {
  private apiUrl = 'http://localhost:9090/talan/api/recrutements';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

createRecruitment(candidateId: number, position: string, managerId: number): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/candidate/${candidateId}`,
    { position, managerId },
    { headers: this.getAuthHeaders() }
  );
}

getRecruitmentsByCandidate(candidateId: number): Observable<Recruitment[]> {
  return this.http.get<Recruitment[]>(
    `${this.apiUrl}/candidate/${candidateId}`,
    { headers: this.getAuthHeaders() }
  ).pipe(
    map(recruitments => {
      const currentUser = this.authService.currentUserValue;
      return recruitments.map(r => ({
        ...r,
        editable: this.canManageRecruitment(r)
      }));
    })
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


// recruitment.service.ts
canManageRecruitment(recruitment: Recruitment): boolean {
  const currentUser = this.authService.currentUserValue;
  if (!currentUser || !recruitment) return false;
  
  const recruiter = recruitment.recruteur || recruitment.demandeur;
  
  return this.authService.hasRole(Role.RECRUTEUR_MANAGER) ||
         (recruiter && recruiter.id === currentUser.id);
}


 /* canManageRecruitment(recruitment: Recruitment): boolean {
  const currentUser = this.authService.currentUserValue;
  if (!currentUser) return false;
  
  return this.authService.hasRole(Role.RECRUTEUR_MANAGER) ||
         recruitment.demandeur.id === currentUser.id ;
}*/
}