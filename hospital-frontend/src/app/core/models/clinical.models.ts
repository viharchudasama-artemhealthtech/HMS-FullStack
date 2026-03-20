export interface Vitals {
  id: string;
  appointmentId: string;
  temperature?: number;
  systolicBP?: number;
  diastolicBP?: number;
  pulseRate?: number;
  respiratoryRate?: number;
  spo2?: number;
  weight?: number;
  height?: number;
  notes?: string;
  recordedAt: string;
}

export interface VitalsRequest {
  appointmentId: string;
  temperature?: number;
  systolicBP?: number;
  diastolicBP?: number;
  pulseRate?: number;
  respiratoryRate?: number;
  spo2?: number;
  weight?: number;
  height?: number;
  notes?: string;
}
