import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { DashboardService } from '../../../core/services/dashboard.service';
import {
  DashboardSummary,
  ApiResponse,
  WeeklyStatistics,
} from '../../../core/models/common.models';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('patientChart') patientChartCanvas!: ElementRef;
  @ViewChild('dailyOpsChart') dailyOpsChartCanvas!: ElementRef;
  @ViewChild('summaryChart') summaryChartCanvas!: ElementRef;

  summary: DashboardSummary | null = null;
  isLoading = true;
  chart: any;
  opsChart: any;
  summaryChart: any;
  currentUser$ = this.authService.currentUser$;
  isAdminOrStaff = false;
  isPatient = false;
  role = '';
  quickActions: Array<{ label: string; link: string; icon: string }> = [];
  private chartPending = false;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.role = role || '';
    this.isAdminOrStaff = role === 'ADMIN' || role === 'RECEPTIONIST';
    this.isPatient = role === 'PATIENT';
    this.quickActions = this.buildQuickActions();

    this.dashboardService.getSummary().subscribe({
      next: (res: ApiResponse<DashboardSummary>) => {
        this.summary = res.data;
        this.isLoading = false;
        this.chartPending = true;
        this.tryInitChart();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  ngAfterViewInit(): void {
    this.tryInitChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    if (this.opsChart) {
      this.opsChart.destroy();
      this.opsChart = null;
    }
    if (this.summaryChart) {
      this.summaryChart.destroy();
      this.summaryChart = null;
    }
  }

  private buildQuickActions(): Array<{
    label: string;
    link: string;
    icon: string;
  }> {
    if (this.role === 'DOCTOR') {
      return [
        {
          label: 'Open Queue',
          link: '/appointments',
          icon: 'ri-stethoscope-line',
        },
        {
          label: 'Prescriptions',
          link: '/prescriptions',
          icon: 'ri-file-list-3-line',
        },
      ];
    }

    if (this.role === 'PATIENT') {
      return [
        {
          label: 'Book Visit',
          link: '/appointments/book',
          icon: 'ri-calendar-check-line',
        },
        {
          label: 'My Appointments',
          link: '/appointments',
          icon: 'ri-time-line',
        },
      ];
    }

    return [
      {
        label: 'Register Patient',
        link: '/patients/register',
        icon: 'ri-user-add-line',
      },
    ];
  }

  private tryInitChart(): void {
    if (
      !this.chartPending ||
      !this.summary ||
      !this.patientChartCanvas?.nativeElement ||
      !this.dailyOpsChartCanvas?.nativeElement ||
      !this.summaryChartCanvas?.nativeElement
    ) {
      return;
    }

    this.chartPending = false;
    this.initChart();
  }

  private initChart(): void {
    if (
      !this.summary ||
      !this.patientChartCanvas?.nativeElement ||
      !this.dailyOpsChartCanvas?.nativeElement ||
      !this.summaryChartCanvas?.nativeElement
    )
      return;

    const ctx = this.patientChartCanvas.nativeElement.getContext('2d');
    const ctxOps = this.dailyOpsChartCanvas.nativeElement.getContext('2d');
    const ctxSummary = this.summaryChartCanvas.nativeElement.getContext('2d');

    if (!ctx || !ctxOps || !ctxSummary) return;

    if (this.chart) {
      this.chart.destroy();
    }
    if (this.opsChart) {
      this.opsChart.destroy();
    }
    if (this.summaryChart) {
      this.summaryChart.destroy();
    }

    // ── 1. Weekly Patient Flow Line Chart ─────────────────────────────────
    const labels = this.summary.weeklyStats.map((s: WeeklyStatistics) => s.day);
    const appointmentData = this.summary.weeklyStats.map(
      (s: WeeklyStatistics) => s.appointments,
    );
    const patientData = this.summary.weeklyStats.map(
      (s: WeeklyStatistics) => s.patients,
    );

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Appointments',
            data: appointmentData,
            borderColor: '#0f6cbd',
            backgroundColor: 'rgba(15, 108, 189, 0.12)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#0f6cbd',
          },
          {
            label: 'New Patients',
            data: patientData,
            borderColor: '#1b9aaa',
            backgroundColor: 'rgba(27, 154, 170, 0.12)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#1b9aaa',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 150,
        animation: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { family: "'Manrope', sans-serif", size: 12 },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { display: true, color: 'rgba(0,0,0,0.05)' },
            ticks: { stepSize: 1, font: { family: "'Manrope', sans-serif" } },
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Manrope', sans-serif" } },
          },
        },
      },
    });

    // ── 2. Today's Operations Doughnut Chart ──────────────────────────────
    this.opsChart = new Chart(ctxOps, {
      type: 'doughnut',
      data: {
        labels: ['Pending Labs', 'In Queue', 'Completed Today'],
        datasets: [
          {
            data: [
              this.summary.pendingLabTests,
              this.summary.patientsInQueue,
              this.summary.completedConsultations,
            ],
            backgroundColor: [
              '#f59e0b', // amber  – pending labs
              '#3b82f6', // blue   – in queue
              '#10b981', // emerald – completed
            ],
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { family: "'Manrope', sans-serif", size: 13 },
            },
          },
        },
      },
    });

    // ── 3. Summary Snapshot (Totals) Bar Chart ────────────────────────────
    const summaryLabels = ['Total Patients', 'Total Consults', 'Total Revenue'];
    const summaryValues = [
      this.summary.totalPatients,
      this.summary.totalCompletedConsultations,
      Math.round(this.summary.totalRevenue / 1000),
    ];

    this.summaryChart = new Chart(ctxSummary, {
      type: 'bar',
      data: {
        labels: summaryLabels,
        datasets: [
          {
            label: 'Totals',
            data: summaryValues,
            backgroundColor: ['#0f6cbd', '#10b981', '#f59e0b'],
            borderRadius: 8,
            maxBarThickness: 40,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y ?? 0;
                if (context.label === 'Total Revenue') {
                  return `${label}: $${(value * 1000).toLocaleString()}`;
                }
                return `${label}: ${value.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: any) => {
                return value.toString();
              },
            },
            grid: { color: 'rgba(0,0,0,0.05)' },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });
  }
}
