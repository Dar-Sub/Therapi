import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service'; // Ensure the correct path to AuthService
import { catchError, throwError } from 'rxjs';

export const jwtInterceptorFn: HttpInterceptorFn = (req, next) => {
  // Retrieve the token from AuthService or sessionStorage
  let token: string | null = null;

  // Check if running in a browser environment
  if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
    const userData = sessionStorage.getItem('userData');
    token = userData ? JSON.parse(userData).accessToken : null;
  }


  // Add Authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Added Authorization Header:', req.headers);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error in Interceptor:', error);

      // Handle unauthorized (401) responses
      if (error.status === 401) {
        console.log('Unauthorized request, logging out...');
        // const authService = new AuthService(); // Instantiate AuthService (if required)
        // authService.logout();
      }
      return throwError(() => error);
    })
  );
};
