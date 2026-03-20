export interface PrescriptionMedicine {
  id: string;
  medicineName: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  symptoms: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  advice: string;
  notes: string;
  createdAt: string;
}

export interface PrescriptionRequest {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  symptoms: string;
  diagnosis: string;
  medicines: PrescriptionMedicineRequest[];
  advice: string;
  notes: string;
}

export interface PrescriptionMedicineRequest {
  medicineName: string;
  dosage: string;
  duration: string;
  instructions: string;
}
