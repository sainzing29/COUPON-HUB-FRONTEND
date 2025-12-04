import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService
  ) {}

  /**
   * Generic GET request
   * The interceptor will automatically add the base URL for relative paths
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(endpoint, { params });
  }

  /**
   * Generic POST request
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(endpoint, data);
  }

  /**
   * Generic PUT request
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(endpoint, data);
  }

  /**
   * Generic PATCH request
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(endpoint, data);
  }

  /**
   * Generic DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(endpoint);
  }

  /**
   * DELETE request with body
   */
  deleteWithBody<T>(endpoint: string, data: any): Observable<T> {
    return this.http.delete<T>(endpoint, { body: data });
  }

  /**
   * GET request with query parameters
   */
  getWithParams<T>(endpoint: string, queryParams: any): Observable<T> {
    let params = new HttpParams();
    
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== null && queryParams[key] !== undefined) {
        params = params.set(key, queryParams[key].toString());
      }
    });

    return this.http.get<T>(endpoint, { params });
  }

  /**
   * Upload file
   */
  uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<T>(endpoint, formData);
  }

  /**
   * Download file
   */
  downloadFile(endpoint: string): Observable<Blob> {
    return this.http.get(endpoint, { responseType: 'blob' });
  }
}
