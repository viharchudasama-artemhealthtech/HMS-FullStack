export enum TestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface LabTest {
  id: string;
  testName: string;
  testCode: string;
  price: number;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  description?: string;
  category?: string;
  status: TestStatus;
  requestedDate: string;
  completedDate?: string;
}

export interface LabTestRequest {
  testName: string;
  testCode: string;
  price: number; // Always send as number; JSON will serialize it correctly
  patientId: string; // UUID as string is valid in JSON
  doctorId?: string; // UUID as string is valid in JSON
  description?: string;
  category?: string;
}
