import { HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { EnvironmentService } from '../services/environment.service';

export function apiInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const environmentService = inject(EnvironmentService);
  // Clone the request and add base URL if it's a relative URL
  let apiReq = req;
  
  if (isRelativeUrl(req.url)) {
    const baseUrl = environmentService.getBaseUrl();
    apiReq = req.clone({
      url: `${baseUrl}${req.url}`
    });
  }

  // Add common headers
  apiReq = addCommonHeaders(apiReq);

  // Log request in development mode
  if (environmentService.isDebugMode()) {
    console.log('API Request:', {
      method: apiReq.method,
      url: apiReq.url,
      headers: apiReq.headers,
      body: apiReq.body
    });
  }

  return next(apiReq).pipe(
    tap(event => {
      if (event instanceof HttpResponse && environmentService.isDebugMode()) {
        console.log('API Response:', {
          status: event.status,
          url: event.url,
          body: event.body
        });
      }
    }),
    catchError((error: HttpErrorResponse) => {
      return handleError(error, environmentService);
    })
  );
}

/**
 * Check if the URL is relative (doesn't start with http:// or https://)
 */
function isRelativeUrl(url: string): boolean {
  return !url.startsWith('http://') && !url.startsWith('https://');
}

/**
 * Add common headers to all API requests
 */
function addCommonHeaders(req: HttpRequest<any>): HttpRequest<any> {
  let headers = req.headers;

  // Add Content-Type if not already present
  if (!headers.has('Content-Type')) {
    headers = headers.set('Content-Type', 'application/json');
  }

  // Add Accept header
  if (!headers.has('Accept')) {
    headers = headers.set('Accept', 'application/json');
  }

  // Add custom headers if needed
  headers = headers.set('X-Requested-With', 'XMLHttpRequest');

  return req.clone({ headers });
}

/**
 * Handle HTTP errors
 */
function handleError(error: HttpErrorResponse, environmentService: EnvironmentService): Observable<never> {
  let errorMessage = 'An unknown error occurred';

  if (environmentService.isDebugMode()) {
    console.error('API Error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });
  }

  if (error.error instanceof ErrorEvent) {
    // Client-side error
    errorMessage = `Client Error: ${error.error.message}`;
  } else {
    // Server-side error
    switch (error.status) {
      case 400:
        errorMessage = 'Bad Request - Please check your input';
        break;
      case 401:
        errorMessage = 'Unauthorized - Please check your credentials';
        break;
      case 403:
        errorMessage = 'Forbidden - You do not have permission to access this resource';
        break;
      case 404:
        errorMessage = 'Not Found - The requested resource was not found';
        break;
      case 422:
        errorMessage = 'Validation Error - Please check your input data';
        break;
      case 500:
        errorMessage = 'Internal Server Error - Please try again later';
        break;
      case 502:
        errorMessage = 'Bad Gateway - Server is temporarily unavailable';
        break;
      case 503:
        errorMessage = 'Service Unavailable - Server is temporarily unavailable';
        break;
      default:
        errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
    }
  }

  // You can add global error handling here (e.g., show toast notification)
  // this.notificationService.showError(errorMessage);

  return throwError(() => new Error(errorMessage));
}
