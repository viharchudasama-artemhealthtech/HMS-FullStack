import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="error-container">
      <div class="error-content">
        <div class="error-icon">
          <i class="ri-shield-flash-line"></i>
        </div>
        <h1>Access Denied</h1>
        <p>Your current role does not have permission to access this area. If you believe this is an error, please contact your administrator.</p>
        <div class="action-btns" style="display: flex; gap: 1rem; justify-content: center;">
          <button routerLink="/dashboard" class="btn-primary">
            <i class="ri-dashboard-line"></i> Go to Dashboard
          </button>
          <button (click)="logout()" style="background:none; border: 1px solid #ef4444; color: #ef4444; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; transition: 0.2s;">
            <i class="ri-logout-box-r-line"></i> Logout
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .error-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at center, #ffffff 0%, #f3f4f6 100%);
      padding: 2rem;
    }
    .error-content {
      text-align: center;
      max-width: 480px;
      .error-icon {
        width: 100px;
        height: 100px;
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3.5rem;
        margin: 0 auto 2rem;
        box-shadow: 0 0 0 15px rgba(239, 68, 68, 0.05);
      }
      h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        color: #111827;
      }
      p {
        color: #6b7280;
        line-height: 1.6;
        margin-bottom: 2.5rem;
        font-size: 1.1rem;
      }
    }
  `
})
export class UnauthorizedComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
