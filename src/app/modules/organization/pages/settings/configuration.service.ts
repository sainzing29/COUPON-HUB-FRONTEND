import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Configuration, ConfigurationRequest } from './configuration.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  constructor(private apiService: ApiService) { }

  /**
   * Get configuration
   */
  getConfiguration(): Observable<Configuration> {
    return this.apiService.get<Configuration>('/configuration');
  }

  /**
   * Create configuration
   */
  createConfiguration(config: ConfigurationRequest): Observable<Configuration> {
    return this.apiService.post<Configuration>('/configuration', config);
  }

  /**
   * Update configuration
   */
  updateConfiguration(config: ConfigurationRequest): Observable<Configuration> {
    return this.apiService.put<Configuration>('/configuration', config);
  }
}

