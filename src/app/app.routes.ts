import { Routes } from '@angular/router';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/sign-in',
    pathMatch: 'full'
  },
  // Customer routes (outside admin layout)
  {
    path: 'customer/login',
    loadComponent: () => import('./modules/customer/customer-login/customer-login').then(m => m.CustomerLoginComponent)
  },
  {
    path: 'customer/register',
    loadComponent: () => import('./modules/customer/register-customer/register-customer').then(m => m.RegisterCustomerComponent)
  },
  {
    path: 'customer/otp-verification',
    loadComponent: () => import('./modules/customer/otp-verification/otp-verification').then(m => m.OtpVerificationComponent)
  },
  {
    path: 'customer',
    loadComponent: () => import('./layout/customer-layout/customer-layout.component').then(m => m.CustomerLayoutComponent),
    children: [
      {
        path: 'service-selection',
        loadComponent: () => import('./modules/customer/service-selection/service-selection').then(m => m.ServiceSelectionComponent)
      },
      {
        path: 'locations',
        loadComponent: () => import('./modules/customer/locations/locations.component').then(m => m.LocationsComponent)
      },
      {
        path: 'about-us',
        loadComponent: () => import('./modules/customer/about-us/about-us.component').then(m => m.AboutUsComponent)
      },
      {
        path: 'invoice',
        loadComponent: () => import('./modules/customer/customer-invoice/customer-invoice').then(m => m.CustomerInvoiceComponent)
      },
      {
        path: 'privacy-policy',
        loadComponent: () => import('./modules/customer/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
      }
    ]
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./modules/auth/pages/sign-in/sign-in.component').then(m => m.SignInComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./modules/auth/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./modules/auth/pages/sign-up/sign-up.component').then(m => m.SignUpComponent)
  },
  {
    path: 'set-password',
    loadComponent: () => import('./modules/auth/pages/set-password/set-password.component').then(m => m.SetPasswordComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [permissionGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent)
      }
    ]
  },
  {
    path: 'organization',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [permissionGuard],
    children: [
      {
        path: 'users',
        loadComponent: () => import('./modules/organization/pages/users/users.component').then(m => m.UsersComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'service-centers',
        loadComponent: () => import('./modules/organization/pages/service-centers/service-centers.component').then(m => m.ServiceCentersComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'customers',
        loadComponent: () => import('./modules/organization/pages/customers/customers.component').then(m => m.CustomersComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'service-redemption',
        loadComponent: () => import('./modules/organization/pages/service-redemption/service-redemption.component').then(m => m.ServiceRedemptionComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'service-redemption/redeem-service',
        loadComponent: () => import('./modules/organization/pages/redeem-service/redeem-service').then(m => m.RedeemServiceComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'new-coupons',
        loadComponent: () => import('./modules/organization/pages/new-coupons/new-coupons').then(m => m.NewCouponsComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'coupons',
        loadComponent: () => import('./modules/coupons/coupons/coupons.component').then(m => m.CouponsComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'coupons/generate-coupons',
        loadComponent: () => import('./modules/coupons/generate-coupons/generate-coupons.component').then(m => m.GenerateCouponsComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'coupons/batches',
        loadComponent: () => import('./modules/coupons/batches/batches.component').then(m => m.BatchesComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'coupons/batches/:id',
        loadComponent: () => import('./modules/coupons/batches/batch-details/batch-details.component').then(m => m.BatchDetailsComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'coupons/coupon-schemes',
        loadComponent: () => import('./modules/coupons/coupon-schemes/coupon-schemes.component').then(m => m.CouponSchemesComponent),
        canActivate: [permissionGuard],
        data: { permission: 'CouponScheme' }
      },
      {
        path: 'coupons/coupon-schemes/new',
        loadComponent: () => import('./modules/coupons/coupon-scheme-add/coupon-scheme-add.component').then(m => m.CouponSchemeAddComponent),
        canActivate: [permissionGuard],
        data: { permission: 'CouponScheme' }
      },
      {
        path: 'coupons/coupon-schemes/:id',
        loadComponent: () => import('./modules/coupons/coupon-scheme-add/coupon-scheme-add.component').then(m => m.CouponSchemeAddComponent),
        canActivate: [permissionGuard],
        data: { permission: 'CouponScheme' }
      },
      {
        path: 'coupons/coupon-sale',
        loadComponent: () => import('./modules/coupons/coupon-sale/coupon-sale.component').then(m => m.CouponSaleComponent),
        canActivate: [permissionGuard],
        data: { permission: 'CouponSale' }
      },
      {
        path: 'redemption/coupon-redemption',
        loadComponent: () => import('./modules/redemption/components/pages/coupon-redemption.component').then(m => m.CouponRedemptionComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'coupons/invoice-view',
        loadComponent: () => import('./modules/coupons/invoice-view/invoice-view.component').then(m => m.InvoiceViewComponent),
        canActivate: [permissionGuard],
        data: { permission: 'CouponSale' }
      },
      {
        path: 'invoices',
        loadComponent: () => import('./modules/organization/pages/invoices/invoices.component').then(m => m.InvoicesComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'customers/:id',
        loadComponent: () => import('./modules/organization/pages/customer-profile/customer-profile.component').then(m => m.CustomerProfileComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'settings',
        loadComponent: () => import('./modules/organization/pages/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'role-permissions',
        loadComponent: () => import('./modules/organization/pages/role-permissions/role-permissions.component').then(m => m.RolePermissionsComponent),
        canActivate: [permissionGuard]
      }
    ]
  },
  {
    path: 'reports',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [permissionGuard],
    children: [
      {
        path: 'sales-report',
        loadComponent: () => import('./modules/reports/pages/sales-report/sales-report.component').then(m => m.SalesReportComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'service-usage-report',
        loadComponent: () => import('./modules/reports/pages/service-usage-report/service-usage-report.component').then(m => m.ServiceUsageReportComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'service-center-performance',
        loadComponent: () => import('./modules/reports/pages/service-center-performance/service-center-performance.component').then(m => m.ServiceCenterPerformanceComponent),
        canActivate: [permissionGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/sign-in'
  }
];
