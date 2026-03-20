export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY:    'Monday',
  TUESDAY:   'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY:  'Thursday',
  FRIDAY:    'Friday',
  SATURDAY:  'Saturday',
  SUNDAY:    'Sunday',
};

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  doctorName: string;
  dayOfWeek: DayOfWeek;
  startTime: string;   // "HH:mm:ss" from backend
  endTime: string;
  slotDurationMinutes: number;
}

export interface DoctorScheduleRequest {
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;   // "HH:mm" sent to backend
  endTime: string;
  slotDurationMinutes: number;
}
