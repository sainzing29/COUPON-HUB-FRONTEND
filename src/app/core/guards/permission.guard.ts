import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';

/**
 * Permission Guard
 * Protects routes based on user permissions from JWT token
 */
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isLoggedIn()) {
    router.navigate(['/admin-login']);
    return false;
  }

  // Build the full route path from the route snapshot
  const buildFullPath = (routeSnapshot: ActivatedRouteSnapshot): string => {
    const segments: string[] = [];
    let current: ActivatedRouteSnapshot | null = routeSnapshot;

    while (current) {
      if (current.routeConfig?.path) {
        const path = current.routeConfig.path;
        // Skip empty paths and wildcard routes
        if (path && path !== '' && path !== '**') {
          segments.unshift(path);
        }
      }
      current = current.parent;
    }

    return '/' + segments.join('/');
  };

  const fullRoutePath = buildFullPath(route);

  // Check if user has permission to access this route
  if (!permissionService.canAccessRoute(fullRoutePath)) {
    // Redirect to dashboard if user doesn't have permission
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

