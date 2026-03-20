import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';
import { timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LabTest, LabTestRequest, TestStatus } from '../models/lab.models';
import { ApiResponse } from '../models/common.models';

@Injectable({ providedIn: 'root' })
export class LabService {
  private apiUrl = `${environment.apiUrl}/lab-tests`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<LabTest[]>> {
    return this.http
      .get<ApiResponse<LabTest[]>>(this.apiUrl)
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
        }),
        timeout(10000),
      );
  }

  getById(id: string): Observable<ApiResponse<LabTest>> {
    return this.http
      .get<ApiResponse<LabTest>>(`${this.apiUrl}/${id}`)
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
        }),
        timeout(10000),
      );
  }

  create(labTest: LabTestRequest): Observable<ApiResponse<LabTest>> {
    // Ensure proper type conversion
    const payload = {
      ...labTest,
      price: Number(labTest.price), // Convert price to number
      patientId: String(labTest.patientId), // Ensure patientId is string UUID
      doctorId: labTest.doctorId ? String(labTest.doctorId) : undefined,
    };

    console.log('Lab Test Request Payload:', payload);

    return this.http
      .post<ApiResponse<LabTest>>(this.apiUrl, payload)
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
        }),
        timeout(10000),
      );
  }

  update(id: string, labTest: LabTestRequest): Observable<ApiResponse<LabTest>> {
    const payload = {
      ...labTest,
      price: Number(labTest.price),
      patientId: String(labTest.patientId),
      doctorId: labTest.doctorId ? String(labTest.doctorId) : undefined,
    };

    return this.http
      .put<ApiResponse<LabTest>>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
        }),
        timeout(10000),
      );
  }

  updateStatus(
    id: string,
    status: TestStatus,
  ): Observable<ApiResponse<LabTest>> {
    return this.http
      .patch<ApiResponse<LabTest>>(`${this.apiUrl}/${id}/status`, null, {
        params: { status },
      })
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
        }),
        timeout(10000),
      );
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
        }),
        timeout(10000),
      );
  }
}
