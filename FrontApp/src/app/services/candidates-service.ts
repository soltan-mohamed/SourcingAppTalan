import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { backendUrl } from '@shared/backendUrl';
import { Candidate } from 'app/models/candidate';

@Injectable({
  providedIn: 'root'
})
export class CandidatesService {
  
  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  public candidates$ = this.candidatesSubject.asObservable();

  constructor(private http: HttpClient) { }

  get currentCandidates(): Candidate[] {
    return this.candidatesSubject.value;
  }

  getAllCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${backendUrl}/candidats/not-vivier`).pipe(
      tap(candidates => {
        this.candidatesSubject.next(candidates);
      }),
      catchError(error => {
        console.error('Error fetching candidates:', error);
        return throwError(() => error);
      })
    );
  }

  CreateNewCandidate(candidate: any): Observable<any> {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Authentication token not found');
      return throwError(() => new Error('Authentication token not found'));
    }

    return this.http.post<any>(`${backendUrl}/candidats`, candidate)
      .pipe(
        tap(newCandidate => {
          const currentCandidates = this.currentCandidates;
          this.candidatesSubject.next([...currentCandidates, newCandidate]);
        }),
        catchError(error => {
          console.error('API Error:', error);
          if (error.status === 401) {
            console.error('Unauthorized: Token might be invalid, expired, or headers missing.');
          }
          return throwError(() => error);
        })
      );
  }

  updateCandidate(id: number, candidateUpdate: any): Observable<any> {
    return this.http.put<any>(`${backendUrl}/candidats/${id}`, candidateUpdate)
      .pipe(
        tap(updatedCandidate => {
          const currentCandidates = this.currentCandidates;
          const index = currentCandidates.findIndex(candidate => candidate.id === id);
          
          if (index !== -1) {
            const updatedCandidates = [...currentCandidates];
            updatedCandidates[index] = updatedCandidate;
            this.candidatesSubject.next(updatedCandidates);
          }
        }),
        catchError(error => {
          console.error('API Error:', error);
          if (error.status === 401) {
            console.error('Unauthorized: Token might be invalid, expired, or headers missing.');
          }
          else if (error.status === 500) {
            console.error('Candidate not found.');
          }
          return throwError(() => error);
        })
      );
  }

  // Method to manually refresh candidates list
  refreshCandidates(): Observable<Candidate[]> {
    return this.getAllCandidates();
  }

  // Method to remove a candidate from the list
  // removeCandidate(id: number): void {
  //   const currentCandidates = this.candidatesSubject.value;
  //   const filteredCandidates = currentCandidates.filter(candidate => candidate.id !== id);
  //   this.candidatesSubject.next(filteredCandidates);
  // }
}
/*
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Candidate } from '../models/candidate';
import { AuthService } from './../core/service/auth.service';
import { Role } from '@core/models/role';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'http://localhost:9090/talan/api/candidates';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(candidates => {
        //console.log('API Response:', candidates);
        //console.log('Current Auth User:', this.authService.currentUserValue);
      }),
map(candidates => {
  const currentUser = this.authService.currentUserValue;

  return candidates.map(c => ({
    ...c,
    isEditable: !!(c.responsable && currentUser && (c.responsable.id === currentUser.id || currentUser.roles.includes(Role.RECRUTEUR)))
  }));
})
    );
  }

  getCandidateById(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(candidate => {
        const currentUser = this.authService.currentUserValue;
        return {
          ...candidate,
          isEditable: candidate.responsable?.id === currentUser?.id
        };
      }),
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

refreshCandidate(id: number): Observable<Candidate> {
  return this.http.get<Candidate>(
    `${this.apiUrl}/${id}`,
    { headers: this.getAuthHeaders() }
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
    console.log('Uploading CV for candidate:', candidateId);
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const formData = new FormData();
    formData.append('file', file); // Changed from 'cv' to 'file'

    const token = this.authService.token;
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Only set Authorization header, let Angular handle Content-Type for multipart
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/${candidateId}/upload-cv`, formData, {
      headers: headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError(error => {
        console.error('CV upload error:', error);
        if (error.status === 403) {
          return throwError(() => new Error('You are not authorized to upload CV for this candidate'));
        }
        return throwError(() => error);
      })
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

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}*/