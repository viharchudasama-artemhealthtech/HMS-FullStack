import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DoctorScheduleService } from '../../../../core/services/doctor-schedule.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { AppNotificationService } from '../../../../core/services/app-notification.service';
import { Doctor } from '../../../../core/models/doctor.models';
import { DoctorSchedule, DAYS_OF_WEEK, DAY_LABELS } from '../../../../core/models/doctor-schedule.models';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/layout/header/header.component';

@Component({
  selector: 'app-doctor-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SidebarComponent, HeaderComponent],
  templateUrl: './doctor-schedule.component.html',
  styleUrl: './doctor-schedule.component.scss'
})
export class DoctorScheduleComponent implements OnInit {
  doctor: Doctor | null = null;
  schedules: DoctorSchedule[] = [];
  scheduleForm: FormGroup;
  
  days = DAYS_OF_WEEK;
  dayLabels = DAY_LABELS;
  
  isLoading = true;
  isSaving = false;
  doctorId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private scheduleService: DoctorScheduleService,
    private appNotificationService: AppNotificationService
  ) {
    this.scheduleForm = this.fb.group({
      dayOfWeek: ['', Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['17:00', Validators.required],
      slotDurationMinutes: [30, [Validators.required, Validators.min(5)]]
    });
  }

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.paramMap.get('id');
    if (!this.doctorId) {
      this.appNotificationService.error('Error', 'Invalid Doctor ID');
      this.router.navigate(['/staff']);
      return;
    }

    this.loadData();
  }

  loadData(): void {
    if (!this.doctorId) return;
    this.isLoading = true;

    // Load doctor details
    this.doctorService.getById(this.doctorId).subscribe({
      next: (res) => {
        this.doctor = res.data;
        this.loadSchedules();
      },
      error: () => {
        this.isLoading = false;
        this.appNotificationService.error('Error', 'Could not load doctor details');
      }
    });
  }

  loadSchedules(): void {
    if (!this.doctorId) return;
    this.scheduleService.getByDoctor(this.doctorId).subscribe({
      next: (res) => {
        this.schedules = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.appNotificationService.error('Error', 'Could not load schedules');
      }
    });
  }

  onSubmit(): void {
    if (this.scheduleForm.invalid || !this.doctorId) return;

    this.isSaving = true;
    const request = {
      ...this.scheduleForm.value,
      doctorId: this.doctorId
    };

    this.scheduleService.create(request).subscribe({
      next: () => {
        this.isSaving = false;
        this.appNotificationService.success('Success', 'Schedule added successfully');
        this.loadSchedules();
        this.scheduleForm.patchValue({ dayOfWeek: '' }); // Reset only day
      },
      error: () => {
        this.isSaving = false;
        this.appNotificationService.error('Error', 'Could not save schedule');
      }
    });
  }

  onDelete(scheduleId: string): void {
    if (!confirm('Are you sure you want to delete this availability slot?')) return;

    this.scheduleService.delete(scheduleId).subscribe({
      next: () => {
        this.appNotificationService.success('Deleted', 'Schedule removed');
        this.loadSchedules();
      },
      error: () => {
        this.appNotificationService.error('Error', 'Could not delete schedule');
      }
    });
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    // Backend gives "HH:mm:ss", we want "h:mm A"
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${suffix}`;
  }
}
