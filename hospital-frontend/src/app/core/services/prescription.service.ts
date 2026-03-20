import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Prescription, PrescriptionRequest } from '../models/prescription.models';
import { ApiResponse } from '../models/common.models';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private apiUrl = `${environment.apiUrl}/prescriptions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Prescription[]>> {
    return this.http.get<ApiResponse<Prescription[]>>(this.apiUrl);
  }

  create(prescription: PrescriptionRequest): Observable<ApiResponse<Prescription>> {
    return this.http.post<ApiResponse<Prescription>>(this.apiUrl, prescription);
  }

  getById(id: string): Observable<ApiResponse<Prescription>> {
    return this.http.get<ApiResponse<Prescription>>(`${this.apiUrl}/${id}`);
  }

  getByPatientId(patientId: string): Observable<ApiResponse<Prescription[]>> {
    return this.http.get<ApiResponse<Prescription[]>>(`${this.apiUrl}/patient/${patientId}`);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
