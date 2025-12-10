import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { 
  CouponStatusExpiryReportResponse, 
  CouponStatusExpiryReportFilters,
  ExpiringSoonFilters,
  ExpiredWithServicesLeftFilters
} from '../models/coupon-status-expiry-report.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CouponStatusExpiryReportService {
  constructor(private apiService: ApiService) { }

  /**
   * Get all coupons with filters
   */
  getAllCoupons(filters?: CouponStatusExpiryReportFilters): Observable<CouponStatusExpiryReportResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.pageNumber !== undefined) {
        params = params.set('pageNumber', filters.pageNumber.toString());
      }
      if (filters.pageSize !== undefined) {
        params = params.set('pageSize', filters.pageSize.toString());
      }
      if (filters.status !== undefined && filters.status !== null) {
        params = params.set('status', filters.status.toString());
      }
      if (filters.expiryDateFrom) {
        params = params.set('expiryDateFrom', filters.expiryDateFrom);
      }
      if (filters.expiryDateTo) {
        params = params.set('expiryDateTo', filters.expiryDateTo);
      }
      if (filters.schemeId !== undefined && filters.schemeId !== null) {
        params = params.set('schemeId', filters.schemeId.toString());
      }
    }

    return this.apiService.get<CouponStatusExpiryReportResponse>('/reports/coupon-status-expiry', params);
  }

  /**
   * Get coupons expiring soon
   */
  getExpiringSoon(filters?: ExpiringSoonFilters): Observable<CouponStatusExpiryReportResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.days !== undefined && filters.days !== null) {
        params = params.set('days', filters.days.toString());
      }
      if (filters.pageNumber !== undefined) {
        params = params.set('pageNumber', filters.pageNumber.toString());
      }
      if (filters.pageSize !== undefined) {
        params = params.set('pageSize', filters.pageSize.toString());
      }
    }

    return this.apiService.get<CouponStatusExpiryReportResponse>('/reports/coupon-status-expiry/expiring-soon', params);
  }

  /**
   * Get expired coupons with remaining services
   */
  getExpiredWithServicesLeft(filters?: ExpiredWithServicesLeftFilters): Observable<CouponStatusExpiryReportResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.pageNumber !== undefined) {
        params = params.set('pageNumber', filters.pageNumber.toString());
      }
      if (filters.pageSize !== undefined) {
        params = params.set('pageSize', filters.pageSize.toString());
      }
    }

    return this.apiService.get<CouponStatusExpiryReportResponse>('/reports/coupon-status-expiry/expired-with-remaining-services', params);
  }
}


