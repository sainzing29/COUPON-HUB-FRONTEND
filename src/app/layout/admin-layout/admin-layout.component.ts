import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { trigger, state, style, transition, animate, query, group } from '@angular/animations';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
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
    ]),
    trigger('fadeIn', [
      state('in', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      state('out', style({
        opacity: 0,
        transform: 'translateY(20px)'
      })),
      transition('out => in', animate('400ms ease-out')),
      transition('in => out', animate('200ms ease-in'))
    ]),
    trigger('pageFadeIn', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateY(20px)' 
        }),
        animate('500ms ease-out', style({ 
          opacity: 1, 
          transform: 'translateY(0)' 
        }))
      ])
    ])
  ]
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = true;
  activeMenuItem = 'dashboard';
  pageTitle = 'Dashboard';
  pageDescription = '';
  pageLoaded = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Set initial page loaded state
    this.pageLoaded = true;
    
    // Listen to route changes to update active menu item
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveMenuItem(event.url);
        this.triggerPageAnimation();
      });
    
    // Set initial active menu item based on current URL
    this.updateActiveMenuItem(this.router.url);
  }

  private updateActiveMenuItem(url: string): void {
    if (url.includes('/organization/users')) {
      this.activeMenuItem = 'users';
      this.pageTitle = 'Users Management';
      this.pageDescription = 'Manage organization users and their permissions';
    } else if (url.includes('/organization/role-permissions')) {
      this.activeMenuItem = 'role-permissions';
      this.pageTitle = 'Role & Permissions';
      this.pageDescription = 'Manage roles and their associated permissions';
    } else if (url.includes('/organization/service-centers')) {
      this.activeMenuItem = 'service-centers';
      this.pageTitle = 'Service Centers';
      this.pageDescription = 'Manage service centers and their locations';
    } else if (url.includes('/organization/customers')) {
      this.activeMenuItem = 'customers';
      this.pageTitle = 'Customers Management';
      this.pageDescription = 'Manage customer information and accounts';
    } else if (url.includes('/organization/service-redemption/redeem-service')) {
      this.activeMenuItem = 'redeem-service';
      this.pageTitle = 'Redeem Service';
      this.pageDescription = 'Redeem customer services and manage redemptions';
    } else if (url.includes('/organization/service-redemption')) {
      this.activeMenuItem = 'service-redemption';
      this.pageTitle = 'Service Redemption';
      this.pageDescription = 'Manage service redemption and customer services';
    } else if (url.includes('/organization/new-coupons')) {
      this.activeMenuItem = 'new-coupons';
      this.pageTitle = 'New Coupons';
      this.pageDescription = 'Create and manage new coupon batches';
    } else if (url.includes('/organization/coupons/generate-coupons')) {
      this.activeMenuItem = 'generate-coupons';
      this.pageTitle = 'Generate Coupons';
      this.pageDescription = 'Create and reserve coupon codes in batches';
    } else if (url.includes('/organization/coupons/batches')) {
      this.activeMenuItem = 'batches';
      this.pageTitle = 'Batch History';
      this.pageDescription = 'View and manage all coupon batches';
    } else if (url.includes('/organization/coupons') && !url.includes('/generate-coupons') && !url.includes('/batches')) {
      this.activeMenuItem = 'coupons-list';
      this.pageTitle = 'Coupons';
      this.pageDescription = 'View and manage all coupon codes';
    } else if (url.includes('/organization/settings')) {
      this.activeMenuItem = 'settings';
      this.pageTitle = 'Settings';
      this.pageDescription = 'Configure system settings and preferences';
    } else if (url.includes('/organization/invoices')) {
      this.activeMenuItem = 'invoices';
      this.pageTitle = 'Invoices & Payments';
      this.pageDescription = 'Manage invoices and payment information';
    } else if (url.includes('/reports/sales-report')) {
      this.activeMenuItem = 'sales-report';
      this.pageTitle = 'Sales Report';
      this.pageDescription = 'View comprehensive sales analytics and reports';
    } else if (url.includes('/reports/service-usage-report')) {
      this.activeMenuItem = 'service-usage-report';
      this.pageTitle = 'Service Usage Report';
      this.pageDescription = 'View service usage analytics and customer activity';
    } else if (url.includes('/reports/service-center-performance')) {
      this.activeMenuItem = 'service-center-performance';
      this.pageTitle = 'Service Center Performance';
      this.pageDescription = 'View service center performance metrics and analytics';
    } else if (url.includes('/dashboard/tables')) {
      this.activeMenuItem = 'tables';
      this.pageTitle = 'Table List';
      this.pageDescription = '';
    } else if (url.includes('/dashboard/typography')) {
      this.activeMenuItem = 'typography';
      this.pageTitle = 'Typography';
      this.pageDescription = '';
    } else if (url.includes('/dashboard/icons')) {
      this.activeMenuItem = 'icons';
      this.pageTitle = 'Icons';
      this.pageDescription = '';
    } else if (url.includes('/dashboard/maps')) {
      this.activeMenuItem = 'maps';
      this.pageTitle = 'Maps';
      this.pageDescription = '';
    } else if (url.includes('/dashboard/notifications')) {
      this.activeMenuItem = 'notifications';
      this.pageTitle = 'Notifications';
      this.pageDescription = '';
    } else if (url === '/dashboard' || url.endsWith('/dashboard/')) {
      this.activeMenuItem = 'dashboard';
      this.pageTitle = 'Dashboard';
      this.pageDescription = '';
    } else {
      this.activeMenuItem = 'dashboard';
      this.pageTitle = 'Dashboard';
      this.pageDescription = '';
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onMenuItemClick(itemId: string): void {
    this.activeMenuItem = itemId;
  }

  private triggerPageAnimation(): void {
    // Reset animation state
    this.pageLoaded = false;
    
    // Trigger animation after a brief delay
    setTimeout(() => {
      this.pageLoaded = true;
    }, 50);
  }

}
