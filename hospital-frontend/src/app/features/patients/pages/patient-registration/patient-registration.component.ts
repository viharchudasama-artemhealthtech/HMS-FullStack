import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientService } from '../../../../core/services/patient.service';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/layout/header/header.component';
import { BloodGroup, Patient, PatientOnboardingResponse, UrgencyLevel } from '../../../../core/models/patient.models';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/common.models';
import { AppNotificationService } from '../../../../core/services/app-notification.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { KeyFilterModule } from 'primeng/keyfilter';
import { FULL_NAME_PATTERN, PHONE_PATTERN, trimRequired } from '../../../../core/validators/app-validators';

@Component({
  selector: 'app-patient-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent,
    RouterLink,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    DropdownModule,
    KeyFilterModule
  ],
  templateUrl: './patient-registration.component.html',
  styleUrl: './patient-registration.component.scss'
})
export class PatientRegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  patientId: string | null = null;

  bloodGroups = Object.values(BloodGroup);
  urgencyLevels = Object.values(UrgencyLevel);

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute,
    private appNotificationService: AppNotificationService
  ) {
    this.registrationForm = this.fb.group({
      name: ['', [...trimRequired(2, 200), Validators.pattern(FULL_NAME_PATTERN)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      age: [null, [Validators.required, Validators.min(0), Validators.max(120)]],
      bloodGroup: [BloodGroup.O_POSITIVE, [Validators.required]],
      contactNumber: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      urgencyLevel: [UrgencyLevel.LOW, [Validators.required]],
      prescription: ['', [...trimRequired(2, 2000)]],
      dose: ['', [...trimRequired(1, 500)]],
      fees: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['patientId']) {
        this.patientId = params['patientId'];
        this.isEditMode = true;
        this.loadPatient(params['patientId']);
      }
    });
  }

  loadPatient(id: string): void {
    this.isLoading = true;
    this.patientService.getById(id).subscribe({
      next: (res: ApiResponse<Patient>) => {
        this.registrationForm.patchValue({
          name: res.data.name,
          email: res.data.email ?? '',
          age: res.data.age,
          bloodGroup: res.data.bloodGroup,
          contactNumber: res.data.contactNumber,
          urgencyLevel: res.data.urgencyLevel,
          prescription: res.data.prescription,
          dose: res.data.dose,
          fees: res.data.fees
        });
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load patient details.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const request$: Observable<ApiResponse<Patient | PatientOnboardingResponse>> = this.isEditMode && this.patientId
        ? this.patientService.update(this.patientId, this.registrationForm.value)
        : this.patientService.create(this.registrationForm.value);

      request$.subscribe({
        next: (res: ApiResponse<Patient | PatientOnboardingResponse>) => {
          this.isLoading = false;
          this.successMessage = this.isEditMode
            ? 'Patient record updated successfully.'
            : this.buildCreateSuccessMessage(res.data as PatientOnboardingResponse);
          this.appNotificationService.success(
            this.isEditMode ? 'Patient Updated' : 'Patient Registered',
            this.isEditMode
              ? 'The patient record was updated successfully.'
              : 'A new patient profile was created successfully with secure onboarding.'
          );
          setTimeout(() => {
            if (!this.isEditMode && (res.data as PatientOnboardingResponse)?.patient?.id) {
              this.router.navigate(['/appointments/book'], { queryParams: { patientId: (res.data as PatientOnboardingResponse).patient.id } });
            } else {
              this.router.navigate(['/patients'], { queryParams: { registered: 'true' } });
            }
          }, 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Registration failed:', err);
          this.errorMessage = err.error?.message || err.message || 'Failed to register patient. Please check your data.';
          this.appNotificationService.error('Patient Save Failed', this.errorMessage);
        }
      });
    } else {
      Object.keys(this.registrationForm.controls).forEach(key => {
        this.registrationForm.controls[key].markAsTouched();
      });
    }
  }

  private buildCreateSuccessMessage(data: PatientOnboardingResponse | null | undefined): string {
    if (!data?.username || !data?.temporaryPassword) {
      return 'Patient registered successfully.';
    }

    return `Patient registered successfully. Temporary login: ${data.username} / ${data.temporaryPassword}. Password change required on first login.`;
  }

  bloodGroupOptions(): Array<{ label: string; value: string }> {
    return this.bloodGroups.map(group => ({
      label: group.replace('_POSITIVE', '+').replace('_NEGATIVE', '-'),
      value: group
    }));
  }

  urgencyOptions(): Array<{ label: string; value: string }> {
    return this.urgencyLevels.map(level => ({
      label: level,
      value: level
    }));
  }

  getUrgencyClass(level: string): string {
    return `urgency-${level.toLowerCase()}`;
  }
}
