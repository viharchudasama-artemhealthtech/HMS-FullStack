export interface LabReport {
  id: string;
  labTestId: string;
  testName: string;
  testCode: string;
  patientName: string;
  findings: string;
  result: string;
  unit?: string;
  referenceRange?: string;
  remarks?: string;
  performedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabReportRequest {
  labTestId: string;
  findings: string;
  result: string;
  unit?: string;
  referenceRange?: string;
  remarks?: string;
  performedBy: string;
}

export interface LabReportResponse {
  id: string;
  labTestId: string;
  testName: string;
  testCode: string;
  patientName: string;
  findings: string;
  result: string;
  unit?: string;
  referenceRange?: string;
  remarks?: string;
  performedBy: string;
  createdAt: string;
  updatedAt: string;
}
