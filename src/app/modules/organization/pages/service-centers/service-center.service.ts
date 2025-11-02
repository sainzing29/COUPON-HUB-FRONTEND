import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

export interface ServiceCenter {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  isActive?: boolean;
  delStatus?: boolean;
  createdAt?: string;
  lastUpdated?: string;
}

export interface ServiceCenterCreateRequest {
  name: string;
  address: string;
  contactNumber: string;
}

export interface ServiceCenterUpdateRequest {
  id: number;
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
  constructor(private apiService: ApiService) { }

  // Get all service centers
  getServiceCenters(showAll: boolean = false): Observable<ServiceCenter[]> {
    if (showAll) {
      return this.apiService.getWithParams<ServiceCenter[]>('/servicecenters', { showAll: 'true' });
    }
    return this.apiService.get<ServiceCenter[]>('/servicecenters');
  }

  // Get service center by ID
  getServiceCenterById(id: number): Observable<ServiceCenter> {
    return this.apiService.get<ServiceCenter>(`/servicecenters/${id}`);
  }

  // Create new service center
  createServiceCenter(serviceCenter: ServiceCenterCreateRequest): Observable<ServiceCenter> {
    return this.apiService.post<ServiceCenter>('/servicecenters', serviceCenter);
  }

  // Update service center
  updateServiceCenter(id: number, serviceCenter: ServiceCenterUpdateRequest): Observable<ServiceCenter> {
    return this.apiService.put<ServiceCenter>(`/servicecenters/${id}`, serviceCenter);
  }

  // Delete service center
  deleteServiceCenter(id: number): Observable<void> {
    return this.apiService.delete<void>(`/servicecenters/${id}`);
  }

  // Restore service center
  restoreServiceCenter(id: number): Observable<ServiceCenter> {
    return this.apiService.patch<ServiceCenter>(`/servicecenters/${id}/restore`, {});
  }

  // Toggle service center status
  toggleServiceCenterStatus(id: number, isActive: boolean): Observable<ServiceCenter> {
    return this.apiService.patch<ServiceCenter>(`/servicecenters/${id}/status`, { isActive });
  }

  // Search service centers
  searchServiceCenters(query: string): Observable<ServiceCenter[]> {
    return this.apiService.get<ServiceCenter[]>(`/servicecenters/search?q=${query}`);
  }

  // Get service centers by status
  getServiceCentersByStatus(isActive: boolean): Observable<ServiceCenter[]> {
    return this.apiService.get<ServiceCenter[]>(`/servicecenters?isActive=${isActive}`);
  }

  // Get service center statistics
  getServiceCenterStats(): Observable<{ total: number; active: number; inactive: number }> {
    return this.apiService.get<{ total: number; active: number; inactive: number }>('/servicecenters/stats');
  }
}

