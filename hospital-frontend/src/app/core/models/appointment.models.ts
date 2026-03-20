export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CHECKED_IN = 'CHECKED_IN',
  CONFIRMED = 'CONFIRMED',
  IN_CONSULTATION = 'IN_CONSULTATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NOSHOW = 'NOSHOW'
}

export enum Department {
  GENERAL_MEDICINE = 'GENERAL_MEDICINE',
  CARDIOLOGY = 'CARDIOLOGY',
  DERMATOLOGY = 'DERMATOLOGY',
  PEDIATRICS = 'PEDIATRICS',
  ORTHOPEDICS = 'ORTHOPEDICS',
  NEUROLOGY = 'NEUROLOGY',
  GYNECOLOGY = 'GYNECOLOGY',
  OPHTHALMOLOGY = 'OPHTHALMOLOGY',
  ENT = 'ENT',
  PSYCHIATRY = 'PSYCHIATRY',
  RADIOLOGY = 'RADIOLOGY',
  ONCOLOGY = 'ONCOLOGY',
  EMERGENCY = 'EMERGENCY'
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  department: Department;
  appointmentTime: string;
  status: AppointmentStatus;
  reason: string;
  tokenNumber?: string;
  isEmergency: boolean;
}

export interface AppointmentRequest {
  patientId: string;
  doctorId?: string;
  department: Department;
  appointmentDate: string; // ISO date string
  appointmentTime: string; // HH:mm
  reason: string;
  notes?: string;
  isEmergency: boolean;
}
