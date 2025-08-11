import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
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

  ////////////////////////////////

  deleteCV(candidateId: number): Observable<any> {

    return this.http.delete(`${backendUrl}/candidats/${candidateId}/cv`) ;

  }

  uploadCv(candidateId: number, file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${backendUrl}/candidats/${candidateId}/cv`, formData, {
      //headers: this.getAuthHeadersForFileUpload(),
      reportProgress: true,
      observe: 'events'
    });

  }

  downloadCv(candidateId: number): Observable<Blob> {
    return this.http.get(`${backendUrl}/candidats/${candidateId}/cv`, {
      responseType: 'blob'
    });
  }

  getCandidateCv(candidateId: number): Observable<Blob> {
    return this.http.get(`${backendUrl}/candidats/${candidateId}/cv`, { responseType: 'blob' });
  }


  ////////

  fetchCandidateById(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${backendUrl}/candidats/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching candidate with id ${id}:`, error);
        return throwError(() => error);
      })
    );
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
      map(data => data.filter(c => c.statut !== 'VIVIER')),
      catchError(error => {
        console.error('Error fetching candidates:', error);
        return throwError(() => error);
      })
    );
  }

  getAllContactedAndInProgressCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${backendUrl}/candidats/in-progress&contacted`).pipe(
      // map(data => data),
      catchError(error => {
        console.error('Error fetching in-progress and contacted candidates:', error);
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

  // Search functionality
  searchCandidates(searchParams: {
    searchText?: string;
    statut?: string;
    minExperience?: number;
    maxExperience?: number;
    searchCriteria?: string[];
  }): Observable<Candidate[]> {
    let params = new HttpParams();
    
    if (searchParams.searchText) {
      params = params.set('searchText', searchParams.searchText);
    }
    if (searchParams.statut) {
      params = params.set('statut', searchParams.statut);
    }
    // Handle 0 values for experience (important for 0-1 years range)
    if (searchParams.minExperience !== undefined && searchParams.minExperience !== null) {
      params = params.set('minExperience', searchParams.minExperience.toString());
    }
    if (searchParams.maxExperience !== undefined && searchParams.maxExperience !== null) {
      params = params.set('maxExperience', searchParams.maxExperience.toString());
    }
    // Add search criteria
    if (searchParams.searchCriteria && searchParams.searchCriteria.length > 0) {
      params = params.set('searchCriteria', searchParams.searchCriteria.join(','));
    }

    console.log('HTTP Params being sent:', params.toString()); // For debugging

    return this.http.get<Candidate[]>(`${backendUrl}/candidats/search/not-vivier`, { params }).pipe(
      tap(data => {
        const regularCandidates = data.filter(c => c.statut !== 'VIVIER');
        this.candidatesSubject.next(regularCandidates);
      }),
      catchError(error => {
        console.error('Error searching candidates:', error);
        return throwError(() => error);
      })
    );
  }

  // Search functionality specifically for vivier candidates
  searchVivierCandidates(searchParams: {
    searchText?: string;
    minExperience?: number;
    maxExperience?: number;
    searchCriteria?: string[];
  }): Observable<Candidate[]> {
    let params = new HttpParams();
    
    if (searchParams.searchText) {
      params = params.set('searchText', searchParams.searchText);
    }
    // Handle 0 values for experience (important for 0-1 years range)
    if (searchParams.minExperience !== undefined && searchParams.minExperience !== null) {
      params = params.set('minExperience', searchParams.minExperience.toString());
    }
    if (searchParams.maxExperience !== undefined && searchParams.maxExperience !== null) {
      params = params.set('maxExperience', searchParams.maxExperience.toString());
    }
    // Add search criteria
    if (searchParams.searchCriteria && searchParams.searchCriteria.length > 0) {
      params = params.set('searchCriteria', searchParams.searchCriteria.join(','));
    }

    console.log('Vivier search HTTP Params being sent:', params.toString()); // For debugging

    return this.http.get<Candidate[]>(`${backendUrl}/candidats/search/vivier`, { params }).pipe(
      tap(data => {
        // Update the vivier candidates subject with search results
        this.vivierCandidatesSubject.next(data);
      }),
      catchError(error => {
        console.error('Error searching vivier candidates:', error);
        return throwError(() => error);
      })
    );
  }

  // Get all available statuses
  getAllStatuses(): Observable<string[]> {
    return this.http.get<string[]>(`${backendUrl}/candidats/statuses`).pipe(
      catchError(error => {
        console.error('Error fetching statuses:', error);
        return throwError(() => error);
      })
    );
  }


private getAuthHeadersForFileUpload(): HttpHeaders {
  const token = this.authService.token;
  if (!token) {
    throw new Error('No authentication token available');
  }
  return new HttpHeaders().set('Authorization', `Bearer ${token}`);
}


  getVivierCandidates(): Observable<Candidate[]> {
    // If vivier candidates are not loaded, load all candidates first
    if (this.vivierCandidatesSubject.value.length === 0) {
      return this.loadAllCandidatesAndReturnVivier();
    }
    return this.vivierCandidates$;
  }

  // Get experience period for a specific candidate
  getCandidateExperience(candidateId: number): Observable<any> {
    return this.http.get<any>(`${backendUrl}/candidats/${candidateId}/experience-period`).pipe(
      catchError(error => {
        console.error('Error fetching candidate experience:', error);
        return throwError(() => error);
      })
    );
  }

  // Update hiring date for a candidate
  updateCandidateHiringDate(candidateId: number, hiringDate: string): Observable<Candidate> {
    return this.http.put<Candidate>(`${backendUrl}/candidats/${candidateId}/hiring-date`, null, {
      params: { hiringDate }
    }).pipe(
      tap(updatedCandidate => {
        // Update the candidate in the appropriate subject
        const currentCandidates = this.candidatesSubject.value;
        const currentVivierCandidates = this.vivierCandidatesSubject.value;
        
        if (updatedCandidate.statut === 'VIVIER') {
          const index = currentVivierCandidates.findIndex(c => c.id === candidateId);
          if (index >= 0) {
            const updatedVivierCandidates = [...currentVivierCandidates];
            updatedVivierCandidates[index] = updatedCandidate;
            this.vivierCandidatesSubject.next(updatedVivierCandidates);
          }
        } else {
          const index = currentCandidates.findIndex(c => c.id === candidateId);
          if (index >= 0) {
            const updatedCandidates = [...currentCandidates];
            updatedCandidates[index] = updatedCandidate;
            this.candidatesSubject.next(updatedCandidates);
          }
        }
      }),
      catchError(error => {
        console.error('Error updating hiring date:', error);
        return throwError(() => error);
      })
    );
  }

  private loadAllCandidatesAndReturnVivier(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${backendUrl}/candidats`).pipe(
      tap(data => {
        const regularCandidates = data.filter(c => c.statut !== 'VIVIER');
        const vivierCandidates = data.filter(c => c.statut === 'VIVIER');
        
        this.candidatesSubject.next(regularCandidates);
        this.vivierCandidatesSubject.next(vivierCandidates);
      }),
      map(data => data.filter(c => c.statut === 'VIVIER')),
      catchError(error => {
        console.error('Error fetching vivier candidates:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Computes the correct candidate status based on their current interview statuses
   * This ensures consistent status calculation across all components
   */
  computeCandidateStatus(candidate: Candidate): string {
    if (!candidate || !candidate.recrutements?.length) {
      return candidate?.statut || 'CONTACTED';
    }

    // Get all evaluations across all recruitments
    const allEvaluations = candidate.recrutements
      .flatMap(r => r?.evaluations || [])
      .filter(e => e?.date) // Only consider evaluations with dates
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!allEvaluations.length) {
      return candidate.statut || 'CONTACTED';
    }

    // Check the current status of all interviews
    const hasInProgressInterview = allEvaluations.some(e => e.statut === 'IN_PROGRESS');
    const hasScheduledInterview = allEvaluations.some(e => e.statut === 'SCHEDULED');
    const allCompletedOrCancelled = allEvaluations.every(e => 
      e.statut === 'COMPLETED' || e.statut === 'CANCELLED' || e.statut === 'REJECTED' || e.statut === 'ACCEPTED'
    );

    let computedStatus = candidate.statut; // Start with stored status

    // Determine the correct candidate status based on interview states
    if (hasInProgressInterview) {
      // If any interview is in progress, candidate should be IN_PROGRESS
      computedStatus = 'IN_PROGRESS';
    } else if (hasScheduledInterview) {
      // If no interviews are in progress but some are scheduled
      // Update to SCHEDULED only if current status allows it
      if (candidate.statut === 'CONTACTED' || candidate.statut === 'IN_PROGRESS' || candidate.statut === 'SCHEDULED') {
        computedStatus = 'SCHEDULED';
      }
    } else if (allCompletedOrCancelled && candidate.statut === 'IN_PROGRESS') {
      // If all interviews are completed/cancelled and candidate was IN_PROGRESS
      // Revert to CONTACTED (they can be contacted for new opportunities)
      computedStatus = 'CONTACTED';
    }

    return computedStatus;
  }

  /**
   * Fetches candidate by ID and returns it with computed status
   */
  fetchCandidateByIdWithComputedStatus(id: number): Observable<Candidate> {
    return this.fetchCandidateById(id).pipe(
      map(candidate => ({
        ...candidate,
        statut: this.computeCandidateStatus(candidate) as any
      }))
    );
  }
}