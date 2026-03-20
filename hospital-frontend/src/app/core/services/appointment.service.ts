import { Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';
import { timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, AppointmentRequest, AppointmentStatus } from '../models/appointment.models';
import { ApiResponse } from '../models/common.models';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(this.apiUrl).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  getByPatientId(patientId: string): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}/patient/${patientId}`).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  getById(id: string): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  getByDepartment(dept: string): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}/department/${dept}`).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  create(appointment: AppointmentRequest): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(this.apiUrl, appointment).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  update(id: string, appointment: AppointmentRequest): Observable<ApiResponse<Appointment>> {
    return this.http.put<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`, appointment).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  updateStatus(id: string, status: AppointmentStatus): Observable<ApiResponse<Appointment>> {
    return this.http.patch<ApiResponse<Appointment>>(`${this.apiUrl}/${id}/status`, null, {
      params: { status }
    }).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  checkIn(id: string): Observable<ApiResponse<Appointment>> {
    return this.http.patch<ApiResponse<Appointment>>(`${this.apiUrl}/${id}/check-in`, null).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  startConsultation(id: string): Observable<ApiResponse<Appointment>> {
    return this.http.patch<ApiResponse<Appointment>>(`${this.apiUrl}/${id}/start`, null).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  completeConsultation(id: string): Observable<ApiResponse<Appointment>> {
    return this.http.patch<ApiResponse<Appointment>>(`${this.apiUrl}/${id}/complete`, null).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }
}
