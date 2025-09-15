import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceCenter {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  isActive?: boolean;
  createdAt?: string;
  lastUpdated?: string;
}

export interface ServiceCenterCreateRequest {
  name: string;
  address: string;
  contactNumber: string;
}

export interface ServiceCenterUpdateRequest {
  name?: string;
  address?: string;
  contactNumber?: string;
}

export interface ServiceCentersResponse {
  data: ServiceCenter[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceCenterService {
  constructor(private http: HttpClient) { }

  // Get all service centers
  getServiceCenters(): Observable<ServiceCenter[]> {
    return this.http.get<ServiceCenter[]>('/servicecenters');
  }

  // Get service center by ID
  getServiceCenterById(id: number): Observable<ServiceCenter> {
    return this.http.get<ServiceCenter>(`/servicecenters/${id}`);
  }

  // Create new service center
  createServiceCenter(serviceCenter: ServiceCenterCreateRequest): Observable<ServiceCenter> {
    return this.http.post<ServiceCenter>('/servicecenters', serviceCenter);
  }

  // Update service center
  updateServiceCenter(id: number, serviceCenter: ServiceCenterUpdateRequest): Observable<ServiceCenter> {
    return this.http.put<ServiceCenter>(`/servicecenters/${id}`, serviceCenter);
  }

  // Delete service center
  deleteServiceCenter(id: number): Observable<void> {
    return this.http.delete<void>(`/servicecenters/${id}`);
  }

  // Toggle service center status
  toggleServiceCenterStatus(id: number, isActive: boolean): Observable<ServiceCenter> {
    return this.http.patch<ServiceCenter>(`/servicecenters/${id}/status`, { isActive });
  }

  // Search service centers
  searchServiceCenters(query: string): Observable<ServiceCenter[]> {
    return this.http.get<ServiceCenter[]>(`/servicecenters/search?q=${query}`);
  }

  // Get service centers by status
  getServiceCentersByStatus(isActive: boolean): Observable<ServiceCenter[]> {
    return this.http.get<ServiceCenter[]>(`/servicecenters?isActive=${isActive}`);
  }

  // Get service center statistics
  getServiceCenterStats(): Observable<{ total: number; active: number; inactive: number }> {
    return this.http.get<{ total: number; active: number; inactive: number }>('/servicecenters/stats');
  }
}







