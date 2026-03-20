import { Department } from '../models/appointment.models';

export const BOOKABLE_DEPARTMENTS: Department[] = [
  Department.GENERAL_MEDICINE,
  Department.CARDIOLOGY,
  Department.DERMATOLOGY,
  Department.PEDIATRICS,
  Department.ORTHOPEDICS,
  Department.GYNECOLOGY,
  Department.OPHTHALMOLOGY,
  Department.ENT,
  Department.PSYCHIATRY
];

export function formatDepartmentLabel(department: string): string {
  return department.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}
