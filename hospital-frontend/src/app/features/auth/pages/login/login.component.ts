import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { USERNAME_PATTERN } from '../../../../core/validators/app-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(USERNAME_PATTERN)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.passwordChangeRequired) {
            this.router.navigate(['/change-password'], { replaceUrl: true });
            return;
          }
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
          this.router.navigateByUrl(returnUrl, { replaceUrl: true });
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || err.message || 'Login failed. Please check your credentials.';
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.controls[key].markAsTouched();
      });
    }
  }
}
