import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { 
  CouponActivationReportResponse, 
  CouponActivationReportFilters,
  CouponActivationKPIResponse,
  ActivationKPIFilters
} from '../models/coupon-activation-report.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CouponActivationReportService {
  constructor(private apiService: ApiService) { }

  /**
   * Get coupon activation report with filters
   */
  getCouponActivationReport(filters?: CouponActivationReportFilters): Observable<CouponActivationReportResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.pageNumber !== undefined) {
        params = params.set('pageNumber', filters.pageNumber.toString());
      }
      if (filters.pageSize !== undefined) {
        params = params.set('pageSize', filters.pageSize.toString());
      }
      if (filters.activationDateFrom) {
        params = params.set('activationDateFrom', filters.activationDateFrom);
      }
      if (filters.activationDateTo) {
        params = params.set('activationDateTo', filters.activationDateTo);
      }
      if (filters.schemeId !== undefined && filters.schemeId !== null) {
        params = params.set('schemeId', filters.schemeId.toString());
      }
      if (filters.status !== undefined && filters.status !== null) {
        params = params.set('status', filters.status.toString());
      }
      if (filters.customerPhone) {
        params = params.set('customerPhone', filters.customerPhone);
      }
      if (filters.customerEmail) {
        params = params.set('customerEmail', filters.customerEmail);
      }
    }

    return this.apiService.get<CouponActivationReportResponse>('/reports/coupon-activation', params);
  }

  /**
   * Get coupon activation KPIs
   */
  getCouponActivationKPIs(filters?: ActivationKPIFilters): Observable<CouponActivationKPIResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.activationDateFrom) {
        params = params.set('activationDateFrom', filters.activationDateFrom);
      }
      if (filters.activationDateTo) {
        params = params.set('activationDateTo', filters.activationDateTo);
      }
    }

    return this.apiService.get<CouponActivationKPIResponse>('/reports/coupon-activation/kpis', params);
  }
}

