import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../../../../core/services/auth.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { Subscription } from 'rxjs';

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

  allMenuItems: MenuItem[] = [
    // { id: 'dashboard', label: 'Dashboard', icon: 'grid_view', route: '/dashboard', active: true, hasSubmenu: false },
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
      permission: ['ExportCoupons', 'CouponStatusChange', 'GenerateCoupons'],
      submenu: [
        { id: 'coupons-list', label: 'Coupons', icon: 'list', route: '/organization/coupons', active: false, hasSubmenu: false, permission: ['ExportCoupons', 'CouponStatusChange'] },
        { id: 'generate-coupons', label: 'Generate Coupons', icon: 'add_circle', route: '/organization/coupons/generate-coupons', active: false, hasSubmenu: false, permission: ['GenerateCoupons'] },
        { id: 'batches', label: 'Batch History', icon: 'history', route: '/organization/coupons/batches', active: false, hasSubmenu: false, permission: ['GenerateCoupons'] }
      ]
    },
    // { id: 'invoices', label: 'Invoices & Payments', icon: 'receipt', route: '/organization/invoices', active: false, hasSubmenu: false, permission: ['FinancialData'] },
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
    },
    // { 
    //   id: 'reports', 
    //   label: 'Reports', 
    //   icon: 'assessment', 
    //   route: '', 
    //   active: false, 
    //   hasSubmenu: true,
    //   expanded: false,
    //   permission: ['Reports'],
    //   submenu: [
    //     { id: 'sales-report', label: 'Sales Report', icon: 'assessment', route: '/reports/sales-report', active: false, hasSubmenu: false, permission: ['Reports'] },
    //     { id: 'service-usage-report', label: 'Service Usage', icon: 'trending_up', route: '/reports/service-usage-report', active: false, hasSubmenu: false, permission: ['Reports'] },
    //     { id: 'service-center-performance', label: 'Center Performance', icon: 'business_center', route: '/reports/service-center-performance', active: false, hasSubmenu: false, permission: ['Reports'] }
    //   ]
    // }
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
      this.updateActiveState();
      this.ensureSubmenuExpanded();
    }, 0);

    // Subscribe to user changes to update menu items when user logs in/out
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      console.log('Sidebar: User changed, filtering menu items', user);
      console.log('Sidebar: User permissions', user?.permission);
      this.filterMenuItemsByPermission();
      this.updateActiveState();
      this.ensureSubmenuExpanded();
    });
  }

  private filterMenuItemsByPermission(): void {
    // Filter menu items based on permissions
    this.menuItems = this.allMenuItems
      .map(item => {
        // Check if main menu item is accessible
        if (item.permission && item.permission.length > 0) {
          if (!this.permissionService.hasAnyPermission(item.permission)) {
            return null; // Filter out this item
          }
        }

        // Filter submenu items if exists
        if (item.hasSubmenu && item.submenu) {
          const filteredSubmenu = item.submenu.filter(subItem => {
            if (subItem.permission && subItem.permission.length > 0) {
              return this.permissionService.hasAnyPermission(subItem.permission);
            }
            return true; // If no permission required, show it
          });

          // If parent has permission but no submenu items are accessible, hide parent
          if (filteredSubmenu.length === 0) {
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
    
    this.activeMenuItem = subItemId;
    
    // Find the parent item and ensure it stays expanded
    const parentItem = this.menuItems.find(item => item.id === parentId);
    if (parentItem) {
      parentItem.expanded = true; // Ensure parent stays expanded
    }
    
    this.updateActiveState();
    
    // Find the submenu item and navigate to its route
    if (parentItem && parentItem.submenu) {
      const subItem = parentItem.submenu.find(item => item.id === subItemId);
      if (subItem) {
        this.router.navigate([subItem.route]);
        this.menuItemClick.emit(subItemId);
      }
    }
  }
}
