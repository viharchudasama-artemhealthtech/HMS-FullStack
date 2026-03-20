import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../../../../core/services/patient.service';
import { VitalsService } from '../../../../core/services/vitals.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Patient } from '../../../../core/models/patient.models';
import { Vitals, VitalsRequest } from '../../../../core/models/clinical.models';
import { Appointment } from '../../../../core/models/appointment.models';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/layout/header/header.component';
import { ApiResponse } from '../../../../core/models/common.models';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, RouterLink, DialogModule, TableModule, ReactiveFormsModule, DropdownModule],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.scss'
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  vitalsHistory: Vitals[] = [];
  appointments: Appointment[] = [];
  isLoading = true;
  isLoadingVitals = false;
  error = '';
  
  // Vitals Management
  vitalsDialogVisible = false;
  vitalsForm: FormGroup;
  isSavingVitals = false;
  editingVitalsId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private vitalsService: VitalsService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.vitalsForm = this.fb.group({
      appointmentId: ['', Validators.required],
      temperature: [null, [Validators.min(30), Validators.max(45)]],
      systolicBP: [null, [Validators.min(60), Validators.max(250)]],
      diastolicBP: [null, [Validators.min(40), Validators.max(150)]],
      pulseRate: [null, [Validators.min(30), Validators.max(250)]],
      respiratoryRate: [null, [Validators.min(8), Validators.max(60)]],
      spo2: [null, [Validators.min(50), Validators.max(100)]],
      weight: [null, [Validators.min(0), Validators.max(300)]],
      height: [null, [Validators.min(0), Validators.max(250)]],
      notes: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPatient(id);
      this.loadVitalsHistory(id);
      this.loadAppointments(id);
    }
  }

  loadPatient(id: string): void {
    this.isLoading = true;
    this.patientService.getById(id).subscribe({
      next: (res: ApiResponse<Patient>) => {
        this.patient = res.data;
        this.isLoading = false;
      },
      error: (_err: HttpErrorResponse) => {
        this.error = 'Failed to load patient details.';
        this.isLoading = false;
      }
    });
  }

  loadVitalsHistory(patientId: string): void {
    this.isLoadingVitals = true;
    this.vitalsService.getByPatientId(patientId).subscribe({
      next: (res: ApiResponse<Vitals[]>) => {
        this.vitalsHistory = res.data;
        this.isLoadingVitals = false;
      },
      error: () => {
        this.isLoadingVitals = false;
      }
    });
  }

  loadAppointments(patientId: string): void {
    this.appointmentService.getByPatientId(patientId).subscribe({
      next: (res: ApiResponse<Appointment[]>) => {
        // Only show scheduled or checked-in appointments for vitals
        this.appointments = res.data.filter(a => a.status !== 'CANCELLED' && a.status !== 'COMPLETED');
      }
    });
  }

  canManageVitals(): boolean {
    const role = this.authService.currentUserValue?.role;
    return role === 'ADMIN' || role === 'NURSE';
  }

  openVitalsDialog(vitals?: Vitals): void {
    if (vitals) {
      this.editingVitalsId = vitals.id;
      this.vitalsForm.patchValue(vitals);
      this.vitalsForm.get('appointmentId')?.disable();
    } else {
      this.editingVitalsId = null;
      this.vitalsForm.reset();
      this.vitalsForm.get('appointmentId')?.enable();
      
      // Auto-select most recent appointment if available
      if (this.appointments.length > 0) {
        this.vitalsForm.patchValue({ appointmentId: this.appointments[0].id });
      }
    }
    this.vitalsDialogVisible = true;
  }

  saveVitals(): void {
    if (this.vitalsForm.invalid) return;

    this.isSavingVitals = true;
    const data = this.vitalsForm.getRawValue();

    const request = this.editingVitalsId 
      ? this.vitalsService.updateVitals(this.editingVitalsId, data)
      : this.vitalsService.recordVitals(data);

    request.subscribe({
      next: () => {
        this.vitalsDialogVisible = false;
        this.isSavingVitals = false;
        if (this.patient) {
          this.loadVitalsHistory(this.patient.id);
        }
      },
      error: () => {
        this.isSavingVitals = false;
      }
    });
  }

  deleteVitals(id: string): void {
    if (confirm('Are you sure you want to delete this vital record?')) {
      this.vitalsService.delete(id).subscribe({
        next: () => {
          if (this.patient) {
            this.loadVitalsHistory(this.patient.id);
          }
        }
      });
    }
  }

  getUrgencyClass(level: string | undefined): string {
    return level ? `urgency-${level.toLowerCase()}` : '';
  }
}
