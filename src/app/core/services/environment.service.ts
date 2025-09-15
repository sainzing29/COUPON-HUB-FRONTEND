import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Environment } from '../../../environments/environment.interface';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private environment: Environment = environment;

  constructor() { }

  /**
   * Get the current environment configuration
   */
  getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Get the base URL for API calls
   */
  getBaseUrl(): string {
    return this.environment.baseUrl;
  }


  /**
   * Check if running in production mode
   */
  isProduction(): boolean {
    return this.environment.production;
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugMode(): boolean {
    return this.environment.debug;
  }

  /**
   * Get application name
   */
  getAppName(): string {
    return this.environment.appName;
  }

  /**
   * Get application version
   */
  getVersion(): string {
    return this.environment.version;
  }
}



