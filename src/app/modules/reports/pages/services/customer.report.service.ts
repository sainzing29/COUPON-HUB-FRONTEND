import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { 
  CustomerReportResponse, 
  CustomerReportFilters,
  CustomerKPIResponse,
  CustomerKPIFilters
} from '../models/customer-report.models';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CustomerReportService {
  constructor(private apiService: ApiService) { }

  /**
   * Get customer report with filters
   */
  getCustomerReport(filters?: CustomerReportFilters): Observable<CustomerReportResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.pageNumber !== undefined) {
        params = params.set('pageNumber', filters.pageNumber.toString());
      }
      if (filters.pageSize !== undefined) {
        params = params.set('pageSize', filters.pageSize.toString());
      }
      if (filters.customerCreatedAtFrom) {
        params = params.set('customerCreatedAtFrom', filters.customerCreatedAtFrom);
      }
      if (filters.customerCreatedAtTo) {
        params = params.set('customerCreatedAtTo', filters.customerCreatedAtTo);
      }
      if (filters.hasActiveCoupons !== undefined && filters.hasActiveCoupons !== null) {
        params = params.set('hasActiveCoupons', filters.hasActiveCoupons.toString());
      }
      if (filters.totalRedemptionsMin !== undefined && filters.totalRedemptionsMin !== null) {
        params = params.set('totalRedemptionsMin', filters.totalRedemptionsMin.toString());
      }
    }

    return this.apiService.get<CustomerReportResponse>('/reports/customer', params);
  }

  /**
   * Get customer report KPIs
   */
  getCustomerKPIs(filters?: CustomerKPIFilters): Observable<CustomerKPIResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.customerCreatedAtFrom) {
        params = params.set('customerCreatedAtFrom', filters.customerCreatedAtFrom);
      }
      if (filters.customerCreatedAtTo) {
        params = params.set('customerCreatedAtTo', filters.customerCreatedAtTo);
      }
      if (filters.engagedCustomerMinRedemptions !== undefined && filters.engagedCustomerMinRedemptions !== null) {
        params = params.set('engagedCustomerMinRedemptions', filters.engagedCustomerMinRedemptions.toString());
      }
    }

    return this.apiService.get<CustomerKPIResponse>('/reports/customer/kpis', params);
  }
}

