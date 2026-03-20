import { Component, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/layout/header/header.component';
import { DoctorService } from '../../../../core/services/doctor.service';
import { Doctor, DoctorOnboardingResponse, DoctorRegistrationRequest } from '../../../../core/models/doctor.models';
import { ApiResponse } from '../../../../core/models/common.models';
import { AppNotificationService } from '../../../../core/services/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { BOOKABLE_DEPARTMENTS, formatDepartmentLabel } from '../../../../core/constants/department.constants';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { LICENSE_NUMBER_PATTERN, PERSON_NAME_PATTERN, PHONE_PATTERN, STRONG_PASSWORD_PATTERN, USERNAME_PATTERN, trimRequired } from '../../../../core/validators/app-validators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-doctor-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SidebarComponent,
    HeaderComponent,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    DropdownModule
  ],
  templateUrl: './doctor-registration.component.html',
  styleUrl: './doctor-registration.component.scss'
})
export class DoctorRegistrationComponent implements OnInit {
  doctorForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  departments = BOOKABLE_DEPARTMENTS;
  isEditMode = false;
  isViewMode = false;
  doctorId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private router: Router,
    private appNotificationService: AppNotificationService,
    private elementRef: ElementRef<HTMLElement>,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.doctorForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(USERNAME_PATTERN)]],
      temporaryPassword: ['Welcome@123', [Validators.required, Validators.minLength(8), Validators.maxLength(128), Validators.pattern(STRONG_PASSWORD_PATTERN)]],
      firstName: ['', [...trimRequired(1, 50), Validators.pattern(PERSON_NAME_PATTERN)]],
      lastName: ['', [...trimRequired(1, 50), Validators.pattern(PERSON_NAME_PATTERN)]],
      specialization: ['', [...trimRequired(2, 100)]],
      department: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      consultationFee: [null, [Validators.required, Validators.min(0.01)]],
      licenseNumber: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(LICENSE_NUMBER_PATTERN)]],
      qualification: ['', [Validators.maxLength(200)]],
      experienceYears: [0, [Validators.min(0), Validators.max(100)]],
      designation: ['', [Validators.maxLength(100)]],
      bio: ['', [Validators.maxLength(1000)]]
    });

    this.route.queryParams.subscribe(params => {
      this.doctorId = params['doctorId'] ?? null;
      this.isViewMode = params['mode'] === 'view';
      this.isEditMode = params['mode'] === 'edit' && !!this.doctorId;

      if (this.doctorId) {
        this.loadDoctor(this.doctorId);
      } else {
        this.doctorForm.enable();
      }
    });
  }

  getDepartmentLabel(department: string): string {
    return formatDepartmentLabel(department);
  }

  departmentOptions(): Array<{ label: string; value: string }> {
    return this.departments.map(department => ({
      label: this.getDepartmentLabel(department),
      value: department
    }));
  }

  onSubmit(): void {
    if (this.isViewMode) {
      return;
    }

    if (this.doctorForm.invalid) {
      this.errorMessage = 'Please complete all required doctor account details before submitting.';
      this.doctorForm.markAllAsTouched();
      this.scrollToFirstInvalidField();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const payload = {
      ...this.doctorForm.value,
      isAvailable: true
    } as DoctorRegistrationRequest;

    const request$: Observable<ApiResponse<DoctorOnboardingResponse | Doctor>> = this.isEditMode && this.doctorId
      ? this.doctorService.update(this.doctorId, payload)
      : this.doctorService.register(payload);

    request$.subscribe({
      next: (res: ApiResponse<DoctorOnboardingResponse | Doctor>) => {
        this.isLoading = false;
        if (this.isEditMode) {
          this.successMessage = 'Doctor profile updated successfully.';
          this.appNotificationService.success('Doctor Updated', 'Doctor profile was updated successfully.');
        } else {
          const onboarding = res.data as DoctorOnboardingResponse;
          this.successMessage = `Doctor registered. Username: ${onboarding.username} | Temporary password: ${onboarding.temporaryPassword}`;
          this.appNotificationService.success('Doctor Created', `Doctor account created for ${onboarding.doctor.firstName} ${onboarding.doctor.lastName}.`);
        }
        setTimeout(() => {
          this.router.navigate(['/staff']);
        }, 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error?.message || `Failed to ${this.isEditMode ? 'update' : 'register'} doctor. Please try again.`;
        this.appNotificationService.error(this.isEditMode ? 'Doctor Update Failed' : 'Doctor Creation Failed', this.errorMessage);
        this.isLoading = false;
      }
    });
  }

  private scrollToFirstInvalidField(): void {
    setTimeout(() => {
      const invalidControl = this.elementRef.nativeElement.querySelector(
        '.ng-invalid[formControlName], .ng-invalid .p-inputtext, .ng-invalid .p-dropdown-label'
      ) as HTMLElement | null;

      invalidControl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      invalidControl?.focus?.();
    });
  }

  private loadDoctor(id: string): void {
    this.isLoading = true;
    this.doctorService.getById(id).subscribe({
      next: (res: ApiResponse<Doctor>) => {
        const doctor = res.data;
        this.doctorForm.patchValue({
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          specialization: doctor.specialization,
          department: doctor.department,
          email: doctor.email,
          phoneNumber: doctor.phoneNumber || doctor.contactNumber || '',
          consultationFee: doctor.consultationFee,
          licenseNumber: doctor.licenseNumber || doctor.registrationNumber,
          qualification: doctor.qualification || '',
          experienceYears: doctor.experienceYears ?? 0,
          designation: doctor.designation || '',
          bio: doctor.bio || '',
          username: '',
          temporaryPassword: '********'
        });

        if (this.isViewMode) {
          this.doctorForm.disable();
        } else {
          this.doctorForm.enable();
          this.doctorForm.get('username')?.disable();
          this.doctorForm.get('temporaryPassword')?.disable();
        }

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load doctor details.';
        this.isLoading = false;
      }
    });
  }
}
