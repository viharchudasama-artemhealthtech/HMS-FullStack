import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/models/auth.models';
import { HttpErrorResponse } from '@angular/common/http';
import { USERNAME_PATTERN } from '../../../../core/validators/app-validators';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DropdownModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  readonly roles = Object.values(Role);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
      this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(USERNAME_PATTERN)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      role: [Role.PATIENT, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]]
    });
  }

  roleOptions(): Array<{ label: string; value: Role }> {
    return this.roles.map(role => ({
      label: role.replace(/_/g, ' '),
      value: role
    }));
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/login'], { replaceUrl: true });
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Registration failed.';
        }
      });
    } else {
      this.errorMessage = 'Please fill all required fields before registering.';
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.controls[key].markAsTouched();
      });
    }
  }
}
