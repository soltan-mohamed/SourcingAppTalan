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