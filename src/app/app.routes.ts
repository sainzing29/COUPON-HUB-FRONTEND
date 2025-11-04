import { Routes } from '@angular/router';

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
    children: [
      {
        path: 'users',
        loadComponent: () => import('./modules/organization/pages/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'service-centers',
        loadComponent: () => import('./modules/organization/pages/service-centers/service-centers.component').then(m => m.ServiceCentersComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./modules/organization/pages/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'service-redemption',
        loadComponent: () => import('./modules/organization/pages/service-redemption/service-redemption.component').then(m => m.ServiceRedemptionComponent)
      },
      {
        path: 'service-redemption/redeem-service',
        loadComponent: () => import('./modules/organization/pages/redeem-service/redeem-service').then(m => m.RedeemServiceComponent)
      },
      {
        path: 'new-coupons',
        loadComponent: () => import('./modules/organization/pages/new-coupons/new-coupons').then(m => m.NewCouponsComponent)
      },
      {
        path: 'new-coupons/sale',
        loadComponent: () => import('./modules/organization/pages/coupon-sale/coupon-sale').then(m => m.CouponSaleComponent)
      },
      {
        path: 'coupons/generate-coupons',
        loadComponent: () => import('./modules/organization/pages/coupons/generate-coupons/generate-coupons.component').then(m => m.GenerateCouponsComponent)
      },
      {
        path: 'coupons/batches',
        loadComponent: () => import('./modules/organization/pages/coupons/batches/batches.component').then(m => m.BatchesComponent)
      },
      {
        path: 'invoices',
        loadComponent: () => import('./modules/organization/pages/invoices/invoices.component').then(m => m.InvoicesComponent)
      },
      {
        path: 'customers/:id',
        loadComponent: () => import('./modules/organization/pages/customer-profile/customer-profile.component').then(m => m.CustomerProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./modules/organization/pages/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: 'reports',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'sales-report',
        loadComponent: () => import('./modules/reports/pages/sales-report/sales-report.component').then(m => m.SalesReportComponent)
      },
      {
        path: 'service-usage-report',
        loadComponent: () => import('./modules/reports/pages/service-usage-report/service-usage-report.component').then(m => m.ServiceUsageReportComponent)
      },
      {
        path: 'service-center-performance',
        loadComponent: () => import('./modules/reports/pages/service-center-performance/service-center-performance.component').then(m => m.ServiceCenterPerformanceComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/sign-in'
  }
];
