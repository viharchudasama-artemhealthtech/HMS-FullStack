import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { PrescriptionService } from '../../../../core/services/prescription.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AppNotificationService } from '../../../../core/services/app-notification.service';
import { Prescription } from '../../../../core/models/prescription.models';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/layout/header/header.component';
import { ApiResponse } from '../../../../core/models/common.models';
import { ExcelExportService } from '../../../../core/services/excel-export.service';

@Component({
  selector: 'app-prescription-list',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, RouterLink, TableModule],
  templateUrl: './prescription-list.component.html',
  styleUrl: './prescription-list.component.scss'
})
export class PrescriptionListComponent implements OnInit {
  prescriptions: Prescription[] = [];
  isLoading = true;

  constructor(
    private prescriptionService: PrescriptionService,
    private authService: AuthService,
    private notificationService: AppNotificationService,
    private excelExportService: ExcelExportService
  ) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    this.isLoading = true;
    this.prescriptionService.getAll().subscribe({
      next: (res: ApiResponse<Prescription[]>) => {
        this.prescriptions = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onPrint(id: string): void {
    window.open(`/prescriptions/${id}`, '_blank');
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this clinical record? This action cannot be undone.')) {
      this.prescriptionService.delete(id).subscribe({
        next: () => {
          this.notificationService.success('Success', 'Prescription record successfully removed.');
          this.loadPrescriptions();
        },
        error: (err) => {
          this.notificationService.error('Error', err.message || 'Operation failed');
        }
      });
    }
  }

  get canManage(): boolean {
    const role = this.authService.getUserRole();
    return role === 'ADMIN' || role === 'DOCTOR';
  }

  exportToExcel(): void {
    const dataToExport = this.prescriptions.map(p => ({
      'Patient Name': p.patientName,
      'Doctor Name': p.doctorName,
      'Diagnosis': p.diagnosis,
      'Symptoms': p.symptoms || 'N/A',
      'Medicines Count': p.medicines?.length || 0,
      'Treatment Date': new Date(p.createdAt || '').toLocaleDateString()
    }));

    this.excelExportService.exportAsExcelFile(dataToExport, 'Prescriptions_Export');
  }
}
