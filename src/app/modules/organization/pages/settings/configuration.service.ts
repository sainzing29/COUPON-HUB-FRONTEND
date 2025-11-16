import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Configuration, ConfigurationRequest, BasicConfiguration } from './configuration.model';

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

  /**
   * Get basic configuration
   */
  getBasicConfiguration(): Observable<BasicConfiguration> {
    return this.apiService.get<BasicConfiguration>('/configuration/basic');
  }
}

