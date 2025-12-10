import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { CouponGenerationReportResponse, CouponGenerationReportFilters } from '../models/coupon-generation-report.model';

@Injectable({
  providedIn: 'root'
})
export class CouponGenerationReportService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  /**
   * Get coupon generation report with filters
   */
  getCouponGenerationReport(filters?: CouponGenerationReportFilters): Observable<CouponGenerationReportResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.pageNumber !== undefined) {
        params = params.set('pageNumber', filters.pageNumber.toString());
      }
      if (filters.pageSize !== undefined) {
        params = params.set('pageSize', filters.pageSize.toString());
      }
      if (filters.status !== undefined) {
        params = params.set('status', filters.status.toString());
      }
      if (filters.prefix) {
        params = params.set('prefix', filters.prefix);
      }
      if (filters.period) {
        params = params.set('period', filters.period);
      }
      if (filters.batchId !== undefined) {
        params = params.set('batchId', filters.batchId.toString());
      }
      if (filters.schemeId !== undefined) {
        params = params.set('schemeId', filters.schemeId.toString());
      }
      if (filters.couponCreatedDateFrom) {
        params = params.set('couponCreatedDateFrom', filters.couponCreatedDateFrom);
      }
      if (filters.couponCreatedDateTo) {
        params = params.set('couponCreatedDateTo', filters.couponCreatedDateTo);
      }
    }

    return this.apiService.get<CouponGenerationReportResponse>('/reports/coupon-generation', params);
  }
}

