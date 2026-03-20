import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medicine, MedicineRequest, InventoryTransaction } from '../models/pharmacy.models';
import { ApiResponse } from '../models/common.models';

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  private apiUrl = `${environment.apiUrl}/medicines`;
  private inventoryUrl = `${environment.apiUrl}/pharmacy/inventory-log`;

  constructor(private http: HttpClient) {}

  getInventoryLog(): Observable<ApiResponse<InventoryTransaction[]>> {
    return this.http.get<ApiResponse<InventoryTransaction[]>>(this.inventoryUrl);
  }

  getAll(): Observable<ApiResponse<Medicine[]>> {
    return this.http.get<ApiResponse<Medicine[]>>(this.apiUrl);
  }

  getActive(): Observable<ApiResponse<Medicine[]>> {
    return this.http.get<ApiResponse<Medicine[]>>(`${this.apiUrl}/active`);
  }

  getLowStock(): Observable<ApiResponse<Medicine[]>> {
    return this.http.get<ApiResponse<Medicine[]>>(`${this.apiUrl}/low-stock`);
  }

  getById(id: string): Observable<ApiResponse<Medicine>> {
    return this.http.get<ApiResponse<Medicine>>(`${this.apiUrl}/${id}`);
  }

  create(medicine: MedicineRequest): Observable<ApiResponse<Medicine>> {
    return this.http.post<ApiResponse<Medicine>>(this.apiUrl, medicine);
  }

  update(id: string, medicine: MedicineRequest): Observable<ApiResponse<Medicine>> {
    return this.http.put<ApiResponse<Medicine>>(`${this.apiUrl}/${id}`, medicine);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  reportNeeded(id: string, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${id}/report`, { reason });
  }
}
