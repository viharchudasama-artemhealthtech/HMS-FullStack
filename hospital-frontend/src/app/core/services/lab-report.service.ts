import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';
import { timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LabReport,
  LabReportRequest,
  LabReportResponse,
} from '../models/lab-report.models';
import { ApiResponse } from '../models/common.models';

@Injectable({ providedIn: 'root' })
export class LabReportService {
  private apiUrl = `${environment.apiUrl}/lab-tests`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new lab report for a test
   */
  createReport(
    testId: string,
    report: LabReportRequest,
  ): Observable<ApiResponse<LabReportResponse>> {
    return this.http
      .post<
        ApiResponse<LabReportResponse>
      >(`${this.apiUrl}/${testId}/report`, report)
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
        }),
        timeout(10000),
      );
  }

  /**
   * Update an existing lab report
   */
  updateReport(
    reportId: string,
    report: LabReportRequest,
  ): Observable<ApiResponse<LabReportResponse>> {
    return this.http
      .put<
        ApiResponse<LabReportResponse>
      >(`${this.apiUrl}/report/${reportId}`, report)
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
        }),
        timeout(10000),
      );
  }

  /**
   * Get lab report by test ID
   */
  getReportByTestId(
    testId: string,
  ): Observable<ApiResponse<LabReportResponse>> {
    return this.http
      .get<ApiResponse<LabReportResponse>>(`${this.apiUrl}/${testId}/report`)
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
        }),
        timeout(10000),
      );
  }

  /**
   * Get lab report by report ID
   */
  getReportById(reportId: string): Observable<ApiResponse<LabReportResponse>> {
    return this.http
      .get<ApiResponse<LabReportResponse>>(`${this.apiUrl}/report/${reportId}`)
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
        }),
        timeout(10000),
      );
  }

  /**
   * Get all lab reports
   */
  getAllReports(): Observable<ApiResponse<LabReportResponse[]>> {
    return this.http
      .get<ApiResponse<LabReportResponse[]>>(`${this.apiUrl}/reports/list`)
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
        }),
        timeout(10000),
      );
  }

  /**
   * Delete a lab report
   */
  deleteReport(reportId: string): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/report/${reportId}`)
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
        }),
        timeout(10000),
      );
  }

  /**
   * Generate PDF for lab report
   */
  downloadReportPDF(testId: string): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/${testId}/report/pdf`, { responseType: 'blob' })
      .pipe(
        retry({
          count: 2,
          delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
        }),
        timeout(10000),
      );
  }
}
