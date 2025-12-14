import { Injectable } from '@angular/core';
import { AuthService, User } from './auth.service';

/**
 * Permission Service
 * Manages role-based access control (RBAC) using permissions from JWT token
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  
  // Map permissions to routes
  private readonly permissionRouteMap: { [key: string]: string[] } = {
    'Users': ['/organization/users'],
    'ServiceCenter': ['/organization/service-centers'],
    'Customer': ['/organization/customers'],
    'CouponSale': ['/organization/new-coupons/sale', '/organization/coupons/coupon-sale'],
    'RadeemCoupon': ['/organization/service-redemption', '/organization/service-redemption/redeem-service', '/organization/redemption/coupon-redemption'],
    'GenerateCoupons': ['/organization/coupons/generate-coupons'],
    'ExportCoupons': ['/organization/coupons'], // Export is typically a feature within coupons list
    'CouponStatusChange': ['/organization/coupons'], // Status change is typically a feature within coupons list
    'CouponScheme': ['/organization/coupons/coupon-schemes'],
    'FinancialData': ['/organization/invoices'],
    'Reports': ['/reports', '/reports/coupon-generation-report', '/reports/coupon-status-expiry-report', '/reports/coupon-activation-report', '/reports/customer-report', '/reports/redemption-report', '/reports/sales-report', '/reports/service-usage-report', '/reports/service-center-performance'],
    'Configuration': ['/organization/settings'],
    'UserRoles': ['/organization/role-permissions']
  };

  // Map menu items to permissions
  private readonly menuPermissionMap: { [key: string]: string[] } = {
    'dashboard': [], // Dashboard is accessible to all authenticated users
    'users': ['Users'],
    'role-permissions': ['UserRoles'],
    'customers': ['Customer'],
    'service-centers': ['ServiceCenter'],
    'service-redemption': ['RadeemCoupon'],
    'coupons-list': ['ExportCoupons', 'CouponStatusChange'], // View coupons
    'generate-coupons': ['GenerateCoupons'],
    'batches': ['GenerateCoupons'], // Batch history is related to coupon generation
    'coupon-schemes': ['CouponScheme'],
    'coupon-sale': ['CouponSale'],
    'invoices': ['FinancialData'],
    'settings': ['Configuration'],
    'reports': ['Reports'],
    'coupon-generation-report': ['Reports'],
    'coupon-status-expiry-report': ['Reports'],
    'coupon-activation-report': ['Reports'],
    'customer-report': ['Reports'],
    'redemption-report': ['Reports'],
    'sales-report': ['Reports'],
    'service-usage-report': ['Reports'],
    'service-center-performance': ['Reports']
  };

  constructor(private authService: AuthService) {}

  /**
   * Get current user permissions
   */
  getPermissions(): string[] {
    const user = this.authService.getCurrentUser();
    return user?.permission || [];
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    const permissions = this.getPermissions();
    return permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.getPermissions();
    const hasAccess = permissions.some(permission => userPermissions.includes(permission));
    console.log('PermissionService: hasAnyPermission check', { 
      requiredPermissions: permissions, 
      userPermissions, 
      hasAccess 
    });
    return hasAccess;
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    const userPermissions = this.getPermissions();
    return permissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user can access a specific route
   */
  canAccessRoute(route: string): boolean {
    // Normalize route path
    const normalizedRoute = route.endsWith('/') && route !== '/' ? route.slice(0, -1) : route;
    
    // Dashboard is accessible to all authenticated users
    if (normalizedRoute === '/dashboard' || normalizedRoute.startsWith('/dashboard/')) {
      return this.authService.isLoggedIn();
    }

    // Check if route matches any permission
    for (const [permission, routes] of Object.entries(this.permissionRouteMap)) {
      // Check if the route matches any of the routes for this permission
      const routeMatches = routes.some(r => {
        const normalizedR = r.endsWith('/') && r !== '/' ? r.slice(0, -1) : r;
        // Exact match or route starts with the permission route
        return normalizedRoute === normalizedR || normalizedRoute.startsWith(normalizedR + '/');
      });
      
      if (routeMatches) {
        if (this.hasPermission(permission)) {
          return true;
        } else {
          // Route requires permission but user doesn't have it
          return false;
        }
      }
    }

    // If route is not in the map, allow access (for backward compatibility)
    // You may want to change this behavior based on your security requirements
    // For security, you might want to return false here instead
    return true;
  }

  /**
   * Check if user can access a menu item
   */
  canAccessMenuItem(menuId: string): boolean {
    // Dashboard is accessible to all authenticated users
    if (menuId === 'dashboard') {
      return this.authService.isLoggedIn();
    }

    const requiredPermissions = this.menuPermissionMap[menuId];
    
    // If menu item is not in the map, allow access (for backward compatibility)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Check if user has any of the required permissions
    return this.hasAnyPermission(requiredPermissions);
  }

  /**
   * Get all accessible routes for current user
   */
  getAccessibleRoutes(): string[] {
    const permissions = this.getPermissions();
    const accessibleRoutes: string[] = ['/dashboard']; // Dashboard is always accessible

    permissions.forEach(permission => {
      const routes = this.permissionRouteMap[permission];
      if (routes) {
        accessibleRoutes.push(...routes);
      }
    });

    return [...new Set(accessibleRoutes)]; // Remove duplicates
  }

  /**
   * Get all accessible menu items for current user
   */
  getAccessibleMenuItems(): string[] {
    const allMenuIds = Object.keys(this.menuPermissionMap);
    return allMenuIds.filter(menuId => this.canAccessMenuItem(menuId));
  }
}

