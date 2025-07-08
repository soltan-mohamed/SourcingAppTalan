import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'http://localhost:9090/talan/api/candidats';

  constructor(private http: HttpClient) {}

  addCandidate(candidateData: any): Observable<any> {
  return this.http.post('http://localhost:9090/talan/api/candidats', candidateData, {
    headers: { 'Content-Type': 'application/json' }
  });
}
  getAllCandidates(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:9090/talan/api/candidats');
  }
  updateCandidate(id: number, data: any): Observable<any> {
  return this.http.put(`http://localhost:9090/talan/api/candidats/${id}`, data);
}


}
