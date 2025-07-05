import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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

// candidate.service.ts
getAllCandidates(): Observable<Candidate[]> {
  return this.http.get<Candidate[]>(this.apiUrl, {
    headers: this.getAuthHeaders()
  }).pipe(
    tap(candidates => {
      console.log('API Response:', candidates);
      console.log('Current Auth User:', this.authService.currentUserValue);
    }),
    map(candidates => {
      const currentUser = this.authService.currentUserValue;
      return candidates.map(c => ({
        ...c,
        isEditable: c.responsable?.id === currentUser?.id
      }));
    })
  );
}
  getCandidateById(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 403) {
          return throwError(() => new Error('You are not authorized to view this candidate'));
        }
        return throwError(() => error);
      })
    );
  }

  createCandidate(candidateData: any, id: number): Observable<Candidate> {
    return this.http.post<Candidate>(this.apiUrl, candidateData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateCandidate(id: number, candidateData: any): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}`, candidateData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 403) {
          return throwError(() => new Error('You are not authorized to edit this candidate'));
        }
        return throwError(() => error);
      })
    );
  }

  deleteCandidate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 403) {
          return throwError(() => new Error('You are not authorized to delete this candidate'));
        }
        return throwError(() => error);
      })
    );
  }

  uploadCv(candidateId: number, file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('cv', file);

    return this.http.post(`${this.apiUrl}/${candidateId}/upload-cv`, formData, {
      headers: this.getAuthHeadersForFileUpload(),
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError(error => {
        if (error.status === 403) {
          return throwError(() => new Error('You are not authorized to upload CV for this candidate'));
        }
        return throwError(() => error);
      })
    );
  }

  getStatuses(): Statut[] {
    return Object.values(Statut);
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

  private getAuthHeadersForFileUpload(): HttpHeaders {
    const token = this.authService.token;
    if (!token) {
      throw new Error('No authentication token available');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}