import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vitals, VitalsRequest } from '../models/clinical.models';
import { ApiResponse } from '../models/common.models';

@Injectable({
  providedIn: 'root'
})
export class VitalsService {
  private apiUrl = `${environment.apiUrl}/vitals`;

  constructor(private http: HttpClient) {}

  recordVitals(vitals: VitalsRequest): Observable<ApiResponse<Vitals>> {
    return this.http.post<ApiResponse<Vitals>>(this.apiUrl, vitals);
  }

  updateVitals(id: string, vitals: VitalsRequest): Observable<ApiResponse<Vitals>> {
    return this.http.put<ApiResponse<Vitals>>(`${this.apiUrl}/${id}`, vitals);
  }

  getByAppointment(appointmentId: string): Observable<ApiResponse<Vitals>> {
    return this.http.get<ApiResponse<Vitals>>(`${this.apiUrl}/appointment/${appointmentId}`);
  }

  getAllToday(): Observable<ApiResponse<Vitals[]>> {
    return this.http.get<ApiResponse<Vitals[]>>(`${this.apiUrl}/today`);
  }

  getByPatientId(patientId: string): Observable<ApiResponse<Vitals[]>> {
    return this.http.get<ApiResponse<Vitals[]>>(`${this.apiUrl}/patient/${patientId}`);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
