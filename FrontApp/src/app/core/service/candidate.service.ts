// candidate.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Candidate, Statut } from '../models/candidate.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'http://localhost:9090/talan/api/candidates';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

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

  private getAuthHeadersForFileUpload(): HttpHeaders {
    const token = this.authService.token;
    if (!token) {
      throw new Error('No authentication token available');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData - browser will set it automatically
    });
  }

// candidate.service.ts
getAllCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl, {
        headers: this.getAuthHeaders()
    }).pipe(
        catchError(error => {
            console.error('Error fetching candidates:', error);
            return throwError(() => new Error('Failed to load candidates'));
        })
    );
}

  getCandidateById(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createCandidate(candidateData: any, responsableId: number): Observable<Candidate> {
    const dataWithResponsable = {
      ...candidateData,
      responsable: { id: responsableId }
    };
    
    return this.http.post<Candidate>(this.apiUrl, dataWithResponsable, {
      headers: this.getAuthHeaders()
    });
  }

  uploadCv(candidateId: number, file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('cv', file);

    return this.http.post(`${this.apiUrl}/${candidateId}/upload-cv`, formData, {
      headers: this.getAuthHeadersForFileUpload(),
      reportProgress: true,
      observe: 'events'
    });
  }

  updateCandidate(id: number, candidateData: any): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}`, candidateData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteCandidate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getStatuses(): Statut[] {
    return Object.values(Statut);
  }
}