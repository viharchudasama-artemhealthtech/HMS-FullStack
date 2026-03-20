import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';
import { timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, ChangePasswordRequest, LoginRequest, RegisterRequest, User } from '../models/auth.models';
import { AppNotificationService } from './app-notification.service';
import { AccessFeedbackService } from './access-feedback.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenStorageKey = 'hms_token';
  private readonly userStorageKey = 'hms_user';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private appNotificationService: AppNotificationService,
    private accessFeedbackService: AccessFeedbackService
  ) {
    this.clearLegacyLocalStorage();

    if (!this.currentUserSubject.value || !this.getToken()) {
      this.clearSession();
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
        timeout(10000),
        tap(res => {
          this.clearAuthArtifacts();
          sessionStorage.setItem(this.tokenStorageKey, res.token);
          const user: User = { 
            username: res.username, 
            email: res.email,
            role: res.role,
            passwordChangeRequired: res.passwordChangeRequired
          };
          this.currentUserSubject.next(user);
          sessionStorage.setItem(this.userStorageKey, JSON.stringify(user));
          this.appNotificationService.success('Login Successful', `Welcome back, ${res.username}.`);
        })
      );
  }

  register(request: RegisterRequest): Observable<string> {
    return this.http.post(`${environment.apiUrl}/auth/register`, request, { responseType: 'text' }).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  logout(): void {
    const token = this.getToken();

    if (token) {
      this.http.post(
        `${environment.apiUrl}/auth/logout`,
        {},
        { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }), responseType: 'text' }
      ).subscribe({
        error: () => {
          // Client-side logout still proceeds even if token revocation request fails.
        }
      });
    }

    this.clearSession();
  }

  changePassword(request: ChangePasswordRequest): Observable<string> {
    return this.http.post(`${environment.apiUrl}/auth/change-password`, request, { responseType: 'text' }).pipe(
      retry({ count: 1, delay: () => timer(500) }),
      timeout(10000)
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenStorageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserValue;
  }

  getUserRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  isPasswordChangeRequired(): boolean {
    return !!this.currentUserValue?.passwordChangeRequired;
  }

  markPasswordChanged(): void {
    const currentUser = this.currentUserValue;
    if (!currentUser) {
      return;
    }

    const updatedUser = { ...currentUser, passwordChangeRequired: false };
    this.currentUserSubject.next(updatedUser);
    sessionStorage.setItem(this.userStorageKey, JSON.stringify(updatedUser));
  }

  private getUserFromStorage(): User | null {
    const user = sessionStorage.getItem(this.userStorageKey);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as User;
    } catch {
      this.clearSession();
      return null;
    }
  }

  private clearSession(): void {
    this.clearAuthArtifacts();
    this.currentUserSubject.next(null);
  }

  private clearLegacyLocalStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  private clearAuthArtifacts(): void {
    sessionStorage.removeItem(this.tokenStorageKey);
    sessionStorage.removeItem(this.userStorageKey);
    this.appNotificationService.clear();
    this.accessFeedbackService.close();
  }
}
