import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { backendUrl } from '@shared/backendUrl';
import { Candidate } from 'app/models/candidate';
import { AuthService } from '@core/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CandidatesService {

  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  public candidates$ = this.candidatesSubject.asObservable();

  constructor(private http: HttpClient,
        private authService: AuthService

  ) { }

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

    createCandidate(candidateData: any, responsableId: number): Observable<Candidate> {
    const dataWithResponsable = {
      ...candidateData,
      responsable: { id: responsableId }
    };

    return this.http.post<Candidate>(`${backendUrl}/candidats`, dataWithResponsable, {
      headers: this.getAuthHeaders()
    });
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
          // Check if currentCandidates is a valid array before spreading
          if (Array.isArray(currentCandidates)) {
            this.candidatesSubject.next([...currentCandidates, newCandidate.candidate || newCandidate]);
          } else {
            // If currentCandidates is not an array, initialize with the new candidate
            this.candidatesSubject.next([newCandidate.candidate || newCandidate]);
          }
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


  uploadCv(candidateId: number, file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('cv', file);

    return this.http.post(`${backendUrl}/candidats/${candidateId}/upload-cv`, formData, {
      headers: this.getAuthHeadersForFileUpload(),
      reportProgress: true,
      observe: 'events'
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

}
