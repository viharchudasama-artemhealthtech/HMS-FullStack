import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AccessFeedbackState {
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccessFeedbackService {
  private readonly modalSubject = new BehaviorSubject<AccessFeedbackState | null>(null);
  readonly modal$ = this.modalSubject.asObservable();

  showUnauthorized(message = 'You do not have permission to open that page. Redirecting you to the dashboard.'): void {
    this.modalSubject.next({
      title: 'Unauthorized Access',
      message
    });
  }

  close(): void {
    this.modalSubject.next(null);
  }
}
