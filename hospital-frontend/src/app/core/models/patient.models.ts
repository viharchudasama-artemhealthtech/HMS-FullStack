export enum BloodGroup {
  A_POSITIVE = 'A_POSITIVE',
  A_NEGATIVE = 'A_NEGATIVE',
  B_POSITIVE = 'B_POSITIVE',
  B_NEGATIVE = 'B_NEGATIVE',
  AB_POSITIVE = 'AB_POSITIVE',
  AB_NEGATIVE = 'AB_NEGATIVE',
  O_POSITIVE = 'O_POSITIVE',
  O_NEGATIVE = 'O_NEGATIVE'
}

export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY'
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  age: number;
  bloodGroup: BloodGroup;
  prescription: string;
  dose: string;
  fees: number;
  contactNumber: string;
  urgencyLevel: UrgencyLevel;
  createdAt: string;
}

export interface PatientRequest {
  name: string;
  email?: string;
  age: number;
  bloodGroup: BloodGroup;
  prescription: string;
  dose: string;
  fees: number;
  contactNumber: string;
  urgencyLevel: UrgencyLevel;
}

export interface PatientOnboardingResponse {
  patient: Patient;
  username?: string;
  temporaryPassword?: string;
  passwordChangeRequired?: boolean;
}

export interface PatientSlice {
  content: Patient[];
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  number: number;
}
