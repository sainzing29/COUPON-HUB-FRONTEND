import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { 
  RedemptionReportResponse, 
  RedemptionReportFilters
} from '../models/redemption-report.models';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RedemptionReportService {
  constructor(private apiService: ApiService) { }

  /**
   * Get service redemption report with filters
   */
  getRedemptionReport(filters?: RedemptionReportFilters): Observable<RedemptionReportResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.pageNumber !== undefined) {
        params = params.set('pageNumber', filters.pageNumber.toString());
      }
      if (filters.pageSize !== undefined) {
        params = params.set('pageSize', filters.pageSize.toString());
      }
      if (filters.redemptionDateFrom) {
        params = params.set('redemptionDateFrom', filters.redemptionDateFrom);
      }
      if (filters.redemptionDateTo) {
        params = params.set('redemptionDateTo', filters.redemptionDateTo);
      }
      if (filters.couponStatus !== undefined && filters.couponStatus !== null) {
        params = params.set('couponStatus', filters.couponStatus.toString());
      }
      if (filters.serviceCenterId !== undefined && filters.serviceCenterId !== null) {
        params = params.set('serviceCenterId', filters.serviceCenterId.toString());
      }
    }

    return this.apiService.get<RedemptionReportResponse>('/reports/service-redemption', params);
  }
}

