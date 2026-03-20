export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  registrationNumber: string;
  department: string;
  email: string;
  contactNumber?: string;
  consultationFee: number;
  isAvailable: boolean;
  bio?: string;
  qualification?: string;
  experienceYears?: number;
  licenseNumber?: string;
  phoneNumber?: string;
  designation?: string;
}

export interface DoctorRegistrationRequest {
  username: string;
  temporaryPassword: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  specialization: string;
  qualification?: string;
  experienceYears?: number;
  licenseNumber: string;
  bio?: string;
  consultationFee: number;
  isAvailable?: boolean;
  phoneNumber?: string;
  designation?: string;
}

export interface DoctorOnboardingResponse {
  doctor: Doctor;
  username: string;
  temporaryPassword: string;
  passwordChangeRequired: boolean;
}
