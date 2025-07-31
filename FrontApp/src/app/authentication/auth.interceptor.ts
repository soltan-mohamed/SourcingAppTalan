import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  
  const token = localStorage.getItem('token');

  if (!token) return next(request);

  // to avoid the request is not a multipart file
  if (request.body instanceof FormData || request.headers.has('Content-Type')) {
    return next(
      request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      })
    );
  }

  // If token exists, add it to the Authorization header
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type' : 'application/json'
      }
      
    });
  }

  // Continue with the modified request
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        // Clear localStorage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};