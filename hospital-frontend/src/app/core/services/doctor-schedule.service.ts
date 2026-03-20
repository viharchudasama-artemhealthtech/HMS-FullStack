import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/common.models';
import { DoctorSchedule, DoctorScheduleRequest } from '../models/doctor-schedule.models';

@Injectable({ providedIn: 'root' })
export class DoctorScheduleService {
  private apiUrl = `${environment.apiUrl}/doctor-schedules`;

  constructor(private http: HttpClient) {}

  create(request: DoctorScheduleRequest): Observable<ApiResponse<DoctorSchedule>> {
    return this.http.post<ApiResponse<DoctorSchedule>>(this.apiUrl, request);
  }

  getByDoctor(doctorId: string): Observable<ApiResponse<DoctorSchedule[]>> {
    return this.http.get<ApiResponse<DoctorSchedule[]>>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  getByDoctorAndDay(doctorId: string, dayOfWeek: string): Observable<ApiResponse<DoctorSchedule[]>> {
    return this.http.get<ApiResponse<DoctorSchedule[]>>(
      `${this.apiUrl}/doctor/${doctorId}/day/${dayOfWeek}`
    );
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
