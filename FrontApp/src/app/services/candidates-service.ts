import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { backendUrl } from '@shared/backendUrl';
import { Candidate } from 'app/models/candidate';
import { AuthService } from '@core/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CandidatesService {
  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  private vivierCandidatesSubject = new BehaviorSubject<Candidate[]>([]);

  public candidates$ = this.candidatesSubject.asObservable();
  public vivierCandidates$ = this.vivierCandidatesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  get currentCandidates(): Candidate[] {
    return this.candidatesSubject.value;
  }

  get currentVivierCandidates(): Candidate[] {
    return this.vivierCandidatesSubject.value;
  }

  getCandidateById(id: number): Candidate | undefined {
    const regularCandidate = this.candidatesSubject.value.find(c => c.id === id);
    if (regularCandidate) return regularCandidate;
    
    const vivierCandidate = this.vivierCandidatesSubject.value.find(c => c.id === id);
    return vivierCandidate;
  }

  getAllCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${backendUrl}/candidats`).pipe(
      tap(data => {
        const regularCandidates = data.filter(c => c.statut !== 'VIVIER');
        const vivierCandidates = data.filter(c => c.statut === 'VIVIER');
        
        this.candidatesSubject.next(regularCandidates);
        this.vivierCandidatesSubject.next(vivierCandidates);
      }),
      map(data => data.filter(c => c.statut !== 'VIVIER')), // Return only non-VIVIER for backward compatibility
      catchError(error => {
        console.error('Error fetching candidates:', error);
        return throwError(() => error);
      })
    );
  }

  // Method to ensure both regular and vivier candidates are loaded
  loadAllCandidatesData(): Observable<{regular: Candidate[], vivier: Candidate[]}> {
    return this.http.get<Candidate[]>(`${backendUrl}/candidats`).pipe(
      tap(data => {
        const regularCandidates = data.filter(c => c.statut !== 'VIVIER');
        const vivierCandidates = data.filter(c => c.statut === 'VIVIER');
        
        this.candidatesSubject.next(regularCandidates);
        this.vivierCandidatesSubject.next(vivierCandidates);
      }),
      map(data => ({
        regular: data.filter(c => c.statut !== 'VIVIER'),
        vivier: data.filter(c => c.statut === 'VIVIER')
      })),
      catchError(error => {
        console.error('Error fetching all candidates data:', error);
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
          const currentVivierCandidates = this.currentVivierCandidates;
          const actualCandidate = newCandidate.candidate || newCandidate;
          
          if (actualCandidate.statut === 'VIVIER') {
            // Add to vivier candidates
            this.vivierCandidatesSubject.next([...currentVivierCandidates, actualCandidate]);
          } else {
            // Add to regular candidates
            if (Array.isArray(currentCandidates)) {
              this.candidatesSubject.next([...currentCandidates, actualCandidate]);
            } else {
              this.candidatesSubject.next([actualCandidate]);
            }
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
    return this.http.put<any>(`${backendUrl}/candidats/${id}`, candidateUpdate).pipe(
      tap(updatedCandidate => {
        const currentCandidates = this.candidatesSubject.value;
        const currentVivierCandidates = this.vivierCandidatesSubject.value;
        
        if (updatedCandidate.statut === 'VIVIER') {
          // Remove from regular candidates and add/update in vivier
          const updatedCandidates = currentCandidates.filter(c => c.id !== id);
          this.candidatesSubject.next(updatedCandidates);
          
          // Update or add to vivier candidates
          const existingVivierIndex = currentVivierCandidates.findIndex(c => c.id === id);
          if (existingVivierIndex >= 0) {
            // Update existing candidate in vivier
            const updatedVivierCandidates = [...currentVivierCandidates];
            updatedVivierCandidates[existingVivierIndex] = updatedCandidate;
            this.vivierCandidatesSubject.next(updatedVivierCandidates);
          } else {
            // Add new candidate to vivier
            this.vivierCandidatesSubject.next([...currentVivierCandidates, updatedCandidate]);
          }
        } else {
          // Remove from vivier and add/update in regular candidates
          const updatedVivierCandidates = currentVivierCandidates.filter(c => c.id !== id);
          this.vivierCandidatesSubject.next(updatedVivierCandidates);
          
          // Update or add to regular candidates
          const existingCandidateIndex = currentCandidates.findIndex(c => c.id === id);
          if (existingCandidateIndex >= 0) {
            // Update existing candidate in regular list
            const updatedCandidates = [...currentCandidates];
            updatedCandidates[existingCandidateIndex] = updatedCandidate;
            this.candidatesSubject.next(updatedCandidates);
          } else {
            // Add new candidate to regular list
            this.candidatesSubject.next([...currentCandidates, updatedCandidate]);
          }
        }
      }),
      catchError(error => {
        console.error('API Error:', error);
        return throwError(() => error);
      })
    );
  }

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
    });
  }

  getVivierCandidates(): Observable<Candidate[]> {
    // If vivier candidates are not loaded, load all candidates first
    if (this.vivierCandidatesSubject.value.length === 0) {
      return this.loadAllCandidatesAndReturnVivier();
    }
    return this.vivierCandidates$;
  }

  private loadAllCandidatesAndReturnVivier(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${backendUrl}/candidats`).pipe(
      tap(data => {
        const regularCandidates = data.filter(c => c.statut !== 'VIVIER');
        const vivierCandidates = data.filter(c => c.statut === 'VIVIER');
        
        this.candidatesSubject.next(regularCandidates);
        this.vivierCandidatesSubject.next(vivierCandidates);
      }),
      map(data => data.filter(c => c.statut === 'VIVIER')), // Return only VIVIER candidates
      catchError(error => {
        console.error('Error fetching vivier candidates:', error);
        return throwError(() => error);
      })
    );
  }
}