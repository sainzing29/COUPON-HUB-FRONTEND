import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../../../../core/services/auth.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  active: boolean;
  hasSubmenu: boolean;
  expanded?: boolean;
  submenu?: MenuItem[];
  permission?: string[]; // Required permissions for this menu item
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      state('out', style({
        transform: 'translateX(-100%)',
        opacity: 0
      })),
      transition('in => out', animate('300ms ease-in-out')),
      transition('out => in', animate('300ms ease-in-out'))
    ])
  ]
})
export class SidebarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() sidebarOpen = true;
  @Input() activeMenuItem = 'dashboard';
  @Output() menuItemClick = new EventEmitter<string>();

  private userSubscription: Subscription = new Subscription();
  private routerSubscription: Subscription = new Subscription();

  allMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view', route: '/dashboard', active: true, hasSubmenu: false },
    { id: 'users', label: 'Users', icon: 'person', route: '/organization/users', active: false, hasSubmenu: false, permission: ['Users'] },
    { id: 'role-permissions', label: 'Role & Permissions', icon: 'admin_panel_settings', route: '/organization/role-permissions', active: false, hasSubmenu: false, permission: ['UserRoles'] },
    { id: 'customers', label: 'Customers', icon: 'people', route: '/organization/customers', active: false, hasSubmenu: false, permission: ['Customer'] },
    { id: 'service-centers', label: 'Service Centers', icon: 'business', route: '/organization/service-centers', active: false, hasSubmenu: false, permission: ['ServiceCenter'] },
    // { id: 'service-redemption', label: 'Service Redemption', icon: 'local_offer', route: '/organization/service-redemption', active: false, hasSubmenu: false, permission: ['RadeemCoupon'] },
    { 
      id: 'coupons',
      label: 'Coupons',
      icon: 'confirmation_number',
      route: '',
      active: false,
      hasSubmenu: true,
      expanded: false,
      permission: ['ExportCoupons', 'CouponStatusChange', 'GenerateCoupons', 'CouponScheme', 'CouponSale'],
      submenu: [
        { id: 'coupons-list', label: 'Coupons', icon: 'list', route: '/organization/coupons', active: false, hasSubmenu: false, permission: ['ExportCoupons', 'CouponStatusChange'] },
        // { id: 'coupon-sale', label: 'Coupon Sale', icon: 'shopping_cart', route: '/organization/coupons/coupon-sale', active: false, hasSubmenu: false, permission: ['CouponSale'] },
        { id: 'generate-coupons', label: 'Generate Coupons', icon: 'add_circle', route: '/organization/coupons/generate-coupons', active: false, hasSubmenu: false, permission: ['GenerateCoupons'] },
        { id: 'batches', label: 'Batch History', icon: 'history', route: '/organization/coupons/batches', active: false, hasSubmenu: false, permission: ['GenerateCoupons'] },
        { id: 'coupon-schemes', label: 'Coupon Schemes', icon: 'category', route: '/organization/coupons/coupon-schemes', active: false, hasSubmenu: false, permission: ['CouponScheme'] }
      ]
    },
    { id: 'redeem-service', label: 'Redeem Service', icon: 'local_offer', route: '/organization/redemption/coupon-redemption', active: false, hasSubmenu: false, permission: ['RadeemCoupon'] },
    { id: 'redemption-history', label: 'Redemption History', icon: 'history', route: '/organization/redemption/redemptions', active: false, hasSubmenu: false, permission: ['RadeemCoupon'] },
    // { id: 'invoices', label: 'Invoices & Payments', icon: 'receipt', route: '/organization/invoices', active: false, hasSubmenu: false, permission: ['FinancialData'] },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: 'assessment', 
      route: '', 
      active: false, 
      hasSubmenu: true,
      expanded: false,
      permission: ['Reports'],
      submenu: [
        { id: 'coupon-generation-report', label: 'Coupon Generation', icon: 'description', route: '/reports/coupon-generation-report', active: false, hasSubmenu: false, permission: ['Reports'] },
        { id: 'coupon-status-expiry-report', label: 'Coupon Status & Expiry', icon: 'event', route: '/reports/coupon-status-expiry-report', active: false, hasSubmenu: false, permission: ['Reports'] },
        { id: 'coupon-activation-report', label: 'Coupon Activation', icon: 'check_circle', route: '/reports/coupon-activation-report', active: false, hasSubmenu: false, permission: ['Reports'] }
      ]
    },
    { 
      id: 'configuration', 
      label: 'Configuration', 
      icon: 'settings', 
      route: '', 
      active: false, 
      hasSubmenu: true,
      expanded: false,
      permission: ['Configuration'],
      submenu: [
        { id: 'settings', label: 'Settings', icon: 'tune', route: '/organization/settings', active: false, hasSubmenu: false, permission: ['Configuration'] }
      ]
    }
  ];

  menuItems: MenuItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    // Initial filter - wait a bit to ensure auth service has loaded user from token
    setTimeout(() => {
      this.filterMenuItemsByPermission();
      this.updateActiveStateFromRoute();
      this.ensureSubmenuExpanded();
    }, 0);

    // Subscribe to user changes to update menu items when user logs in/out
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      console.log('Sidebar: User changed, filtering menu items', user);
      console.log('Sidebar: User permissions', user?.permission);
      this.filterMenuItemsByPermission();
      this.updateActiveStateFromRoute();
      this.ensureSubmenuExpanded();
    });

    // Subscribe to router events to update active menu item based on current route
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Use setTimeout to ensure route is fully updated
        setTimeout(() => {
          this.updateActiveStateFromRoute();
        }, 0);
      });
  }

  private filterMenuItemsByPermission(): void {
    // Filter menu items based on permissions
    const userPermissions = this.permissionService.getPermissions();
    console.log('Sidebar: Filtering menu items. User permissions:', userPermissions);
    
    this.menuItems = this.allMenuItems
      .map(item => {
        // Check if main menu item is accessible
        if (item.permission && item.permission.length > 0) {
          const hasAccess = this.permissionService.hasAnyPermission(item.permission);
          console.log(`Sidebar: Menu item "${item.id}" requires permissions:`, item.permission, 'Has access:', hasAccess);
          if (!hasAccess) {
            return null; // Filter out this item
          }
        }

        // Filter submenu items if exists
        if (item.hasSubmenu && item.submenu) {
          const filteredSubmenu = item.submenu.filter(subItem => {
            if (subItem.permission && subItem.permission.length > 0) {
              const hasAccess = this.permissionService.hasAnyPermission(subItem.permission);
              console.log(`Sidebar: Submenu item "${subItem.id}" requires permissions:`, subItem.permission, 'Has access:', hasAccess);
              return hasAccess;
            }
            return true; // If no permission required, show it
          });

          // If parent has permission but no submenu items are accessible, hide parent
          if (filteredSubmenu.length === 0) {
            console.log(`Sidebar: Hiding parent menu "${item.id}" because no submenu items are accessible`);
            return null;
          }

          // Return item with filtered submenu
          return {
            ...item,
            submenu: filteredSubmenu
          };
        }

        return item;
      })
      .filter(item => item !== null) as MenuItem[];
    
    console.log('Sidebar: Filtered menu items:', this.menuItems.map(m => ({ id: m.id, label: m.label, submenuCount: m.submenu?.length || 0 })));

    // Always include dashboard if user is logged in
    if (this.authService.isLoggedIn()) {
      const dashboardItem = this.allMenuItems.find(item => item.id === 'dashboard');
      if (dashboardItem && !this.menuItems.find(item => item.id === 'dashboard')) {
        this.menuItems.unshift(dashboardItem);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeMenuItem']) {
      this.updateActiveState();
      this.ensureSubmenuExpanded();
    }
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

  /**
   * Update active state based on current route
   */
  private updateActiveStateFromRoute(): void {
    const currentUrl = this.router.url.split('?')[0].split('#')[0]; // Remove query parameters and hash
    let foundMenuItemId: string | null = null;

    // Search through all menu items to find matching route
    // Use allMenuItems to ensure we check all possible routes, not just filtered ones
    const itemsToCheck = this.allMenuItems;
    
    // Check submenu items first (more specific routes should be checked first)
    // Sort by route length (longer routes first) to match most specific routes first
    const submenuItems: Array<{item: MenuItem, subItem: MenuItem}> = [];
    for (const item of itemsToCheck) {
      if (item.hasSubmenu && item.submenu) {
        for (const subItem of item.submenu) {
          if (subItem.route) {
            submenuItems.push({item, subItem});
          }
        }
      }
    }
    
    // Sort by route length (longer = more specific)
    submenuItems.sort((a, b) => (b.subItem.route?.length || 0) - (a.subItem.route?.length || 0));
    
    // Check submenu items
    for (const {subItem} of submenuItems) {
      if (subItem.route) {
        // Exact match or starts with route (for nested routes)
        if (currentUrl === subItem.route || currentUrl.startsWith(subItem.route + '/')) {
          foundMenuItemId = subItem.id;
          break;
        }
      }
    }

    // If no submenu match found, check main menu items
    if (!foundMenuItemId) {
      const mainMenuItems = itemsToCheck.filter(item => item.route && item.route !== '');
      mainMenuItems.sort((a, b) => (b.route?.length || 0) - (a.route?.length || 0));
      
      for (const item of mainMenuItems) {
        if (item.route && (currentUrl === item.route || currentUrl.startsWith(item.route + '/'))) {
          foundMenuItemId = item.id;
          break;
        }
      }
    }

    // Update activeMenuItem if found
    if (foundMenuItemId) {
      this.activeMenuItem = foundMenuItemId;
    }

    // Update active state
    this.updateActiveState();
  }

  private updateActiveState(): void {
    this.menuItems.forEach(item => {
      item.active = item.id === this.activeMenuItem;
      
      // Check if any submenu item is active
      if (item.hasSubmenu && item.submenu) {
        item.submenu.forEach(subItem => {
          subItem.active = subItem.id === this.activeMenuItem;
          // If submenu item is active, mark parent as active and expanded
          if (subItem.active) {
            item.active = true;
            item.expanded = true; // Keep submenu expanded when submenu item is active
          }
        });
      }
    });
  }

  private ensureSubmenuExpanded(): void {
    // Ensure that if a submenu item is active, its parent is expanded
    this.menuItems.forEach(item => {
      if (item.hasSubmenu && item.submenu) {
        const hasActiveSubItem = item.submenu.some(subItem => subItem.active);
        if (hasActiveSubItem) {
          item.expanded = true;
        }
      }
    });
  }

  onMenuItemClick(event: Event, itemId: string): void {
    // Prevent event propagation to avoid triggering parent click handlers
    event.stopPropagation();
    event.preventDefault();
    
    const selectedItem = this.menuItems.find(item => item.id === itemId);
    
    if (selectedItem) {
      if (selectedItem.hasSubmenu) {
        // Toggle submenu expansion
        selectedItem.expanded = !selectedItem.expanded;
      } else {
        // Regular menu item - navigate to route
        this.activeMenuItem = itemId;
        this.updateActiveState();
        this.router.navigate([selectedItem.route]);
        this.menuItemClick.emit(itemId);
      }
    }
  }

  onSubmenuItemClick(event: Event, subItemId: string, parentId: string): void {
    // Prevent event propagation to avoid triggering parent click handlers
    event.stopPropagation();
    event.preventDefault();
    
    // Find the parent item and ensure it stays expanded
    const parentItem = this.menuItems.find(item => item.id === parentId);
    
    // Find the submenu item and navigate to its route
    if (parentItem && parentItem.submenu) {
      const subItem = parentItem.submenu.find(item => item.id === subItemId);
      if (subItem) {
        // Set active menu item immediately for better UX
        this.activeMenuItem = subItemId;
        
        // Ensure parent is expanded
        if (parentItem) {
          parentItem.expanded = true;
        }
        
        // Update active state immediately
        this.updateActiveState();
        
        // Navigate to route - the router subscription will handle route-based updates
        this.router.navigate([subItem.route]).then(() => {
          // Ensure active state is updated after navigation completes
          this.updateActiveStateFromRoute();
        });
        
        this.menuItemClick.emit(subItemId);
      }
    }
  }

  /**
   * Check if a menu item has an active submenu item
   */
  hasActiveSubmenu(item: MenuItem): boolean {
    return !!(item.hasSubmenu && item.submenu && item.submenu.some(sub => sub.active));
  }
}
