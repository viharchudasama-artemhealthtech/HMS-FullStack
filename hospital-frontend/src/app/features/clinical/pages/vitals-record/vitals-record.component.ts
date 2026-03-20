import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VitalsService } from '../../../../core/services/vitals.service';
import { VitalsRequest } from '../../../../core/models/clinical.models';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/layout/header/header.component';
import { HttpErrorResponse } from '@angular/common/http';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-vitals-record',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, HeaderComponent, RouterLink, InputNumberModule, InputTextareaModule],
  templateUrl: './vitals-record.component.html',
  styleUrl: './vitals-record.component.scss'
})
export class VitalsRecordComponent implements OnInit {
  vitalsForm!: FormGroup;
  appointmentId!: string;
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private vitalsService: VitalsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.params['appointmentId'];
    if (!this.appointmentId) {
      this.router.navigate(['/appointments']);
      return;
    }

    this.initForm();
  }

  private initForm(): void {
    this.vitalsForm = this.fb.group({
      temperature: ['', [Validators.min(30), Validators.max(45)]], // Celsius
      systolicBP: ['', [Validators.min(50), Validators.max(250)]],
      diastolicBP: ['', [Validators.min(30), Validators.max(150)]],
      pulseRate: ['', [Validators.min(30), Validators.max(250)]],
      respiratoryRate: ['', [Validators.min(5), Validators.max(60)]],
      spo2: ['', [Validators.min(50), Validators.max(100)]],
      weight: ['', [Validators.min(0.1), Validators.max(500)]],
      height: ['', [Validators.min(0.1), Validators.max(300)]],
      notes: ['', Validators.maxLength(1000)]
    });
  }

  onSubmit(): void {
    if (this.vitalsForm.invalid) {
      this.vitalsForm.markAllAsTouched();
      return;
    }

    const systolicBP = this.vitalsForm.get('systolicBP')?.value;
    const diastolicBP = this.vitalsForm.get('diastolicBP')?.value;
    if (systolicBP && diastolicBP && systolicBP <= diastolicBP) {
      this.error = 'Systolic BP must be greater than diastolic BP.';
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const request: VitalsRequest = {
      appointmentId: this.appointmentId,
      ...this.vitalsForm.value
    };

    this.vitalsService.recordVitals(request).subscribe({
      next: () => {
        this.router.navigate(['/appointments']);
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to record vitals';
        this.isSubmitting = false;
      }
    });
  }
}
