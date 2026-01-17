import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Global counter for active requests
let activeRequests = 0;

export function loadingInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  // Skip loading for certain requests if needed
  if (shouldSkipLoading(req)) {
    return next(req);
  }

  activeRequests++;
  setLoading(true);

  return next(req).pipe(
    finalize(() => {
      activeRequests--;
      if (activeRequests === 0) {
        setLoading(false);
      }
    })
  );
}

/**
 * Check if loading should be skipped for this request
 */
function shouldSkipLoading(req: HttpRequest<any>): boolean {
  // Skip loading for specific endpoints or methods
  const skipLoadingPatterns: string[] = [
    // Add patterns here if you want to skip loading for certain requests
    // '/api/heartbeat',
    // '/api/status'
  ];

  return skipLoadingPatterns.some(pattern => req.url.includes(pattern));
}

/**
 * Set loading state
 * You can integrate this with a loading service or state management
 */
function setLoading(loading: boolean): void {
  // You can emit this to a loading service or use a global state
  // Example: You could integrate with a loading service like this:
  // this.loadingService.setLoading(loading);
}
