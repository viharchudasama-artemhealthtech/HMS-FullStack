import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/layout/header/header.component';
import { LabService } from '../../../../core/services/lab.service';
import { LabReportService } from '../../../../core/services/lab-report.service';
import { PatientService } from '../../../../core/services/patient.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LabTest, TestStatus } from '../../../../core/models/lab.models';
import { Appointment } from '../../../../core/models/appointment.models';
import { Patient } from '../../../../core/models/patient.models';
import { ApiResponse } from '../../../../core/models/common.models';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from '../../../../core/services/app-notification.service';
import { StatusModalService } from '../../../../core/services/status-modal.service';
import {
  CODE_PATTERN,
  trimRequired,
} from '../../../../core/validators/app-validators';
import { RecordTestResultsComponent } from '../../components/record-test-results/record-test-results.component';

@Component({
  selector: 'app-lab-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    TableModule,
    ButtonModule,
    DialogModule,
    RecordTestResultsComponent,
  ],
  templateUrl: './lab-list.component.html',
  styleUrl: './lab-list.component.scss',
})
export class LabListComponent implements OnInit {
  tests: LabTest[] = [];
  patients: Patient[] = [];
  patientAppointments: Appointment[] = [];
  isLoading = true;
  userRole: string | null = null;
  showCreateForm = false;
  showEditForm = false;
  showRecordResults = false;
  selectedTest: any = null;
  editingTest: LabTest | null = null;
  labForm!: FormGroup;
  isSubmitting = false;

  testStatuses = Object.values(TestStatus);
  TestStatus = TestStatus;

  constructor(
    private labService: LabService,
    private labReportService: LabReportService,
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private fb: FormBuilder,
    private appNotificationService: AppNotificationService,
    private statusModalService: StatusModalService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.initForm();
    this.loadTests();
    if (
      this.userRole === 'ADMIN' ||
      this.userRole === 'DOCTOR' ||
      this.userRole === 'RECEPTIONIST'
    ) {
      this.patientService
        .getAll()
        .subscribe((res: ApiResponse<Patient[]>) => (this.patients = res.data));
    }
  }

  initForm(): void {
    this.labForm = this.fb.group({
      testName: ['', [...trimRequired(2, 200)]],
      testCode: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(CODE_PATTERN),
        ],
      ],
      price: ['', [Validators.required, Validators.min(0.01)]],
      patientId: ['', Validators.required],
      appointmentId: [''],
      doctorId: [''],
      description: ['', Validators.maxLength(1000)],
      category: ['', Validators.maxLength(100)],
    });

    this.labForm.get('patientId')?.valueChanges.subscribe(patientId => {
      this.patientAppointments = [];
      this.labForm.get('appointmentId')?.setValue('', { emitEvent: false });
      if (patientId) {
        this.appointmentService.getByPatientId(patientId).subscribe(res => {
          this.patientAppointments = res.data.filter(a => a.status === 'COMPLETED' || a.status === 'CHECKED_IN');
        });
      }
    });
  }

  loadTests(): void {
    this.isLoading = true;
    this.labService.getAll().subscribe({
      next: (res: ApiResponse<LabTest[]>) => {
        console.log('Fetched Lab Tests:', res.data);
        this.tests = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  openCreateForm(): void {
    this.showCreateForm = true;
    this.labForm.reset();
  }

  closeForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.editingTest = null;
  }

  openEditForm(test: LabTest): void {
    this.editingTest = test;
    this.showEditForm = true;
    this.showCreateForm = false;
    this.labForm.patchValue({
      testName: test.testName,
      testCode: test.testCode,
      price: test.price,
      patientId: test.patientId,
      doctorId: test.doctorId,
      description: test.description,
      category: test.category,
    });
  }

  onSubmit(): void {
    if (this.labForm.invalid) {
      this.labForm.markAllAsTouched();
      Object.keys(this.labForm.controls).forEach(key => {
        const control = this.labForm.get(key);
        if (control?.invalid) {
          console.error(`Form control '${key}' is invalid:`, control.errors);
        }
      });
      return;
    }
    this.isSubmitting = true;
    const formValue = this.labForm.value;

    if (this.showEditForm && this.editingTest) {
      this.labService.update(this.editingTest.id, formValue).subscribe({
        next: () => {
          this.statusModalService.showSuccess(
            'Lab Test Updated',
            'The lab request has been updated.'
          );
          this.isSubmitting = false;
          this.closeForm();
          this.loadTests();
        },
        error: (err: HttpErrorResponse) => {
          this.statusModalService.showError(
            'Update Failed',
            err.error?.message || 'Update failed.'
          );
          this.isSubmitting = false;
        },
      });
    } else {
      this.labService.create(formValue).subscribe({
        next: () => {
          this.statusModalService.showSuccess(
            'Lab Test Requested',
            'A new lab request has been created.'
          );
          this.isSubmitting = false;
          this.closeForm();
          this.loadTests();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Lab test creation error:', err);
          const errorMsg = err.error?.message || err.error?.error || 'Request failed.';
          this.statusModalService.showError(
            'Lab Request Failed',
            errorMsg
          );
          this.isSubmitting = false;
        },
      });
    }
  }

  onUpdateStatus(test: LabTest, status: TestStatus): void {
    this.labService.updateStatus(test.id, status).subscribe({
      next: () => {
        this.statusModalService.showSuccess(
          'Lab Status Updated',
          `Test status changed to ${status}.`
        );
        this.loadTests();
      },
      error: () =>
        this.statusModalService.showError(
          'Status Update Failed',
          'Lab test status could not be updated.'
        ),
    });
  }

  onDelete(id: string): void {
    if (!confirm('Delete this lab test?')) return;
    this.labService.delete(id).subscribe({
      next: () => {
        this.statusModalService.showSuccess(
          'Lab Test Deleted',
          'The lab request has been removed.'
        );
        this.loadTests();
      },
      error: (err) => {
        console.error('Delete error:', err);
        const errorMsg = err.error?.message || err.error?.error || 'Lab test could not be deleted. Check permissions.';
        this.statusModalService.showError(
          'Delete Failed',
          errorMsg
        );
      },
    });
  }

  getStatusClass(status: TestStatus): string {
    switch (status) {
      case TestStatus.PENDING:
        return 'pending';
      case TestStatus.IN_PROGRESS:
        return 'in-progress';
      case TestStatus.COMPLETED:
        return 'completed';
      case TestStatus.CANCELLED:
        return 'cancelled';
      default:
        return '';
    }
  }

  patientOptions(): { label: string; value: string }[] {
    return this.patients.map(patient => ({
      label: patient.name,
      value: patient.id,
    }));
  }

  appointmentOptions(): { label: string; value: string }[] {
    return this.patientAppointments.map(appointment => ({
      label: `${new Date(appointment.appointmentTime).toLocaleDateString()} - ${appointment.department}`,
      value: appointment.id,
    }));
  }

  // ====== Test Results Recording and PDF Methods ======

  openRecordResults(test: LabTest): void {
    this.selectedTest = test;
    this.showRecordResults = true;
  }

  closeRecordResults(): void {
    this.showRecordResults = false;
    this.selectedTest = null;
    this.loadTests(); // Refresh list to show updated status
  }



  canRecordResults(): boolean {
    return (
      this.userRole === 'LABORATORY_STAFF' || this.userRole === 'ADMIN'
    );
  }

  isTestCompleted(test: LabTest): boolean {
    return test.status === TestStatus.COMPLETED;
  }
}

