import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { LabReportService } from '../../../../core/services/lab-report.service';
import { AppNotificationService } from '../../../../core/services/app-notification.service';


@Component({
  selector: 'app-record-test-results',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
  ],
  templateUrl: './record-test-results.component.html',
  styleUrl: './record-test-results.component.scss',
})
export class RecordTestResultsComponent implements OnInit {
  @Input() visible = false;
  @Input() labTest: any;
  @Output() recorded = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  resultsForm!: FormGroup;
  isSubmitting = false;
  isLoadingReport = false;
  isReadOnly = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private labReportService: LabReportService,
    public appNotificationService: AppNotificationService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.labTest?.status === 'COMPLETED') {
      this.loadReport();
    }
  }

  loadReport(): void {
    this.isLoadingReport = true;
    this.isReadOnly = true;
    this.labReportService.getReportByTestId(this.labTest.id).subscribe({
      next: (res) => {
        if (res.data) {
          this.resultsForm.patchValue(res.data);
          this.resultsForm.disable(); // Make it read-only
        }
        this.isLoadingReport = false;
      },
      error: (err) => {
        console.error('Error loading report:', err);
        this.errorMessage = 'Could not load existing test results.';
        this.isLoadingReport = false;
      }
    });
  }

  initForm(): void {
    this.resultsForm = this.fb.group({
      findings: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(5000),
        ],
      ],
      result: ['', [Validators.maxLength(1000)]],
      unit: ['', Validators.maxLength(100)],
      referenceRange: ['', Validators.maxLength(200)],
      remarks: ['', Validators.maxLength(1000)],
      performedBy: ['', [Validators.required, Validators.maxLength(200)]],
    });
  }

  onSubmit(): void {
    if (this.resultsForm.invalid) {
      this.resultsForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const reportData = {
      ...this.resultsForm.value,
      labTestId: this.labTest.id,
    };

    this.labReportService.createReport(this.labTest.id, reportData).subscribe({
      next: () => {
        this.appNotificationService.success(
          'Success',
          'Lab test results recorded successfully!',
        );
        this.recorded.emit();
        this.closeDialog();
        this.resultsForm.reset();
        this.isSubmitting = false;
        // Emit event or callback to parent to refresh list
      },
      error: (err) => {
        console.error('Error recording results:', err);
        this.errorMessage =
          err.error?.message ||
          'Failed to record test results. Please try again.';
        this.appNotificationService.error('Error', this.errorMessage);
        this.isSubmitting = false;
      },
    });
  }

  closeDialog(): void {
    this.visible = false;
    this.resultsForm.reset();
    this.errorMessage = '';
    this.closed.emit();
  }
}
