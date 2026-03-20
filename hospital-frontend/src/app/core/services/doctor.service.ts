import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';
import { timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Doctor, DoctorOnboardingResponse, DoctorRegistrationRequest } from '../models/doctor.models';
import { ApiResponse } from '../models/common.models';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/doctors`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Doctor[]>> {
    return this.http.get<ApiResponse<Doctor[]>>(this.apiUrl).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  getMe(userId: string): Observable<ApiResponse<Doctor>> {
    return this.http.get<ApiResponse<Doctor>>(`${this.apiUrl}/me?userId=${userId}`).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  getById(id: string): Observable<ApiResponse<Doctor>> {
    return this.http.get<ApiResponse<Doctor>>(`${this.apiUrl}/${id}`).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  getByDepartment(dept: string): Observable<ApiResponse<Doctor[]>> {
    return this.http.get<ApiResponse<Doctor[]>>(`${this.apiUrl}/department/${dept}`).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  register(doctor: DoctorRegistrationRequest): Observable<ApiResponse<DoctorOnboardingResponse>> {
    return this.http.post<ApiResponse<DoctorOnboardingResponse>>(this.apiUrl, doctor).pipe(
      retry({ count: 3, delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000) }),
      timeout(10000)
    );
  }

  update(id: string, doctor: Partial<DoctorRegistrationRequest>): Observable<ApiResponse<Doctor>> {
    return this.http.put<ApiResponse<Doctor>>(`${this.apiUrl}/${id}`, doctor).pipe(
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
