export interface WeeklyStatistics {
  day: string;
  appointments: number;
  patients: number;
}

export interface DashboardSummary {
  totalPatients: number;
  todayAppointments: number;
  totalDoctors: number;
  lowStockMedicines: number;
  todayRevenue: number;
  pendingLabTests: number;
  patientsInQueue: number;
  completedConsultations: number;
  weeklyStats: WeeklyStatistics[];
}
