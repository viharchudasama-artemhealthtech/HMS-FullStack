import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Billing, BillingRequest, PaymentStatus } from '../models/billing.models';
import { ApiResponse } from '../models/common.models';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private apiUrl = `${environment.apiUrl}/billings`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Billing[]>> {
    return this.http.get<ApiResponse<Billing[]>>(this.apiUrl).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  getById(id: string): Observable<ApiResponse<Billing>> {
    return this.http.get<ApiResponse<Billing>>(`${this.apiUrl}/${id}`).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  getByPatient(patientId: string): Observable<ApiResponse<Billing[]>> {
    return this.http.get<ApiResponse<Billing[]>>(`${this.apiUrl}/patient/${patientId}`).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  create(billing: BillingRequest): Observable<ApiResponse<Billing>> {
    return this.http.post<ApiResponse<Billing>>(this.apiUrl, billing).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  updateStatus(id: string, status: PaymentStatus): Observable<ApiResponse<Billing>> {
    return this.http.patch<ApiResponse<Billing>>(`${this.apiUrl}/${id}/status`, null, {
      params: { status }
    }).pipe(
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



  generateFromAppointment(appointmentId: string): Observable<ApiResponse<Billing>> {
    return this.http.post<ApiResponse<Billing>>(`${this.apiUrl}/generate/appointment/${appointmentId}`, {});
  }

  getPreviewFromAppointment(appointmentId: string): Observable<ApiResponse<Billing>> {
    return this.http.get<ApiResponse<Billing>>(`${this.apiUrl}/preview-appointment/${appointmentId}`);
  }
}
