import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";

// id-mapping.service.ts
@Injectable({ providedIn: 'root' })
export class IdMappingService {
  private emailToIdMap = new Map<string, number>();

  constructor(private http: HttpClient) {}

  getIdByEmail(email: string): Observable<number> {
    if (this.emailToIdMap.has(email)) {
      return of(this.emailToIdMap.get(email)!);
    }
    
    return this.http.get<{id: number}>(`/api/users/by-email`, {
      params: { email }
    }).pipe(
      map(response => {
        this.emailToIdMap.set(email, response.id);
        return response.id;
      }),
      catchError(() => of(0)) // Fallback
    );
  }
}