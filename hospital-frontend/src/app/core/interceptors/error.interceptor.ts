import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppNotificationService } from '../services/app-notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const notificationService = inject(AppNotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';
      let errorTitle = 'Operation Failed';

      if (err.error instanceof ErrorEvent) {
        errorMessage = `Network error: ${err.error.message}`;
        console.error('Network error:', err.error);
      } else {
        switch (err.status) {
          case 0:
            errorTitle = 'Connection Error';
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
            break;
          case 401:
            authService.logout();
            router.navigate(['/login']);
            errorTitle = 'Session Expired';
            errorMessage = 'Please log in again.';
            break;
          case 403:
            router.navigate(['/unauthorized']);
            errorTitle = 'Access Denied';
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = err.error?.message || 'Resource not found.';
            break;
          case 422:
            errorTitle = 'Validation Error';
            errorMessage = err.error?.message || 'Please check your input.';
            break;
          case 500:
            errorTitle = 'Server Error';
            errorMessage = 'Internal server error. Please try again later.';
            break;
          default:
            errorMessage = err.error?.message || err.statusText || `HTTP error ${err.status}`;
        }
      }

      notificationService.error(errorTitle, errorMessage);
      return throwError(() => (err.error?.message || errorMessage));
    })
  );
};
