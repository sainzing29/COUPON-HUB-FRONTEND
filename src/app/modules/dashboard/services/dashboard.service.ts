import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { DashboardStats, DashboardChartData } from '../models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private apiService: ApiService) { }

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.apiService.get<DashboardStats>('/Dashboard/stats');
  }

  /**
   * Get dashboard chart data from API
   */
  getDashboardChartData(months: number = 12): Observable<DashboardChartData> {
    return this.apiService.get<DashboardChartData>(`/Dashboard/widgets?months=${months}`);
  }

  /**
   * Update chart data with new data
   */
  updateChartData(newData: DashboardChartData): Observable<DashboardChartData> {
    // This method can be used for any future updates if needed
    return this.apiService.post<DashboardChartData>('/Dashboard/widgets', newData);
  }
}
