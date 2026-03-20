import { Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';
import { timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient, PatientOnboardingResponse, PatientRequest, PatientSlice } from '../models/patient.models';
import { ApiResponse } from '../models/common.models';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Patient[]>> {
    return this.http.get<ApiResponse<Patient[]>>(`${this.apiUrl}/all`).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  search(name?: string, email?: string, bloodGroup?: string, urgencyLevel?: string, page = 0, size = 10): Observable<ApiResponse<PatientSlice>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (name) params = params.set('name', name);
    if (email) params = params.set('email', email);
    if (bloodGroup) params = params.set('bloodGroup', bloodGroup);
    if (urgencyLevel) params = params.set('urgencyLevel', urgencyLevel);

    return this.http.get<ApiResponse<PatientSlice>>(this.apiUrl, { params }).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  getById(id: string): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${this.apiUrl}/${id}`).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  create(patient: PatientRequest): Observable<ApiResponse<PatientOnboardingResponse>> {
    return this.http.post<ApiResponse<PatientOnboardingResponse>>(this.apiUrl, patient).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  update(id: string, patient: PatientRequest): Observable<ApiResponse<Patient>> {
    return this.http.put<ApiResponse<Patient>>(`${this.apiUrl}/${id}`, patient).pipe(
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
