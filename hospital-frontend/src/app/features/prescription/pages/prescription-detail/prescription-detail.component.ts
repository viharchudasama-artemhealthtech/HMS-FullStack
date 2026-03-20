import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PrescriptionService } from '../../../../core/services/prescription.service';
import { Prescription } from '../../../../core/models/prescription.models';
import { ApiResponse } from '../../../../core/models/common.models';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/layout/header/header.component';

@Component({
  selector: 'app-prescription-detail',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, RouterLink],
  templateUrl: './prescription-detail.component.html',
  styleUrl: './prescription-detail.component.scss'
})
export class PrescriptionDetailComponent implements OnInit {
  prescription?: Prescription;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private prescriptionService: PrescriptionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadPrescription(id);
    }
  }

  loadPrescription(id: string): void {
    this.isLoading = true;
    this.prescriptionService.getById(id).subscribe({
      next: (res: ApiResponse<Prescription>) => {
        this.prescription = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/prescriptions']);
      }
    });
  }

  onPrint(): void {
    window.print();
  }
}
