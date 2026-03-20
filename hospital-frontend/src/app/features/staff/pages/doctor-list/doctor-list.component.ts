import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService } from '../../../../core/services/doctor.service';
import { Doctor } from '../../../../core/models/doctor.models';
import { ApiResponse } from '../../../../core/models/common.models';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/layout/header/header.component';
import { Router, RouterLink } from '@angular/router';
import { AppNotificationService } from '../../../../core/services/app-notification.service';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, RouterLink],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.scss'
})
export class DoctorListComponent implements OnInit {
  doctors: Doctor[] = [];
  isLoading = true;

  constructor(
    private doctorService: DoctorService,
    private router: Router,
    private appNotificationService: AppNotificationService
  ) { }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.doctorService.getAll().subscribe({
      next: (res: ApiResponse<Doctor[]>) => {
        this.doctors = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onEdit(doctor: Doctor): void {
    this.router.navigate(['/staff/register'], { queryParams: { doctorId: doctor.id, mode: 'edit' } });
  }

  onDelete(doctor: Doctor): void {
    const confirmed = confirm(`Delete Dr. ${doctor.firstName} ${doctor.lastName}?`);
    if (!confirmed) {
      return;
    }

    this.doctorService.delete(doctor.id).subscribe({
      next: () => {
        this.appNotificationService.success('Doctor Deleted', `Dr. ${doctor.firstName} ${doctor.lastName} was removed successfully.`);
        this.loadDoctors();
      },
      error: () => {
        this.appNotificationService.error('Delete Failed', 'Doctor could not be deleted.');
      }
    });
  }
}
