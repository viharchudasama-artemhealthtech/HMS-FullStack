import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { AppNotificationService } from '../../../../core/services/app-notification.service';
import { differentFieldsValidator, matchFieldsValidator } from '../../../../core/validators/app-validators';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private appNotificationService: AppNotificationService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]]
    }, {
      validators: [
        matchFieldsValidator('newPassword', 'confirmPassword'),
        differentFieldsValidator('currentPassword', 'newPassword', 'sameAsCurrent')
      ]
    });
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.authService.markPasswordChanged();
        this.successMessage = 'Password updated successfully. Redirecting to dashboard...';
        this.appNotificationService.success('Password Updated', 'Your password has been changed successfully.');
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }, 1200);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Unable to update password.';
        this.appNotificationService.error('Password Update Failed', this.errorMessage);
      }
    });
  }
}
