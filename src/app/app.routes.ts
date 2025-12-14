import { Routes } from '@angular/router';
import { permissionGuard } from './core/guards/permission.guard';
import { customerAuthGuard } from './core/guards/customer-auth.guard';
import { provideDaterangepickerLocale } from 'ngx-daterangepicker-bootstrap';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/customer/login',
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
    path: 'customer/forgot-pin',
    loadComponent: () => import('./modules/customer/forgot-pin/forgot-pin.component').then(m => m.ForgotPinComponent)
  },
  {
    path: 'customer/reset-pin',
    loadComponent: () => import('./modules/customer/reset-pin/reset-pin.component').then(m => m.ResetPinComponent)
  },
  {
    path: 'reset-pin',
    loadComponent: () => import('./modules/customer/reset-pin/reset-pin.component').then(m => m.ResetPinComponent)
  },
  {
    path: 'customer',
    loadComponent: () => import('./layout/customer-layout/customer-layout.component').then(m => m.CustomerLayoutComponent),
    canActivate: [customerAuthGuard],
    children: [
      {
        path: 'service-selection',
        loadComponent: () => import('./modules/customer/service-selection/service-selection').then(m => m.ServiceSelectionComponent),
        canActivate: [customerAuthGuard]
      },
      {
        path: 'locations',
        loadComponent: () => import('./modules/customer/locations/locations.component').then(m => m.LocationsComponent),
        canActivate: [customerAuthGuard]
      },
      {
        path: 'about-us',
        loadComponent: () => import('./modules/customer/about-us/about-us.component').then(m => m.AboutUsComponent),
        canActivate: [customerAuthGuard]
      },
      {
        path: 'invoice',
        loadComponent: () => import('./modules/customer/customer-invoice/customer-invoice').then(m => m.CustomerInvoiceComponent),
        canActivate: [customerAuthGuard]
      },
      {
        path: 'privacy-policy',
        loadComponent: () => import('./modules/customer/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
        canActivate: [customerAuthGuard]
      }
    ]
  },
  {
    path: 'admin-login',
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
        loadComponent: () => import('./modules/redemption/pages/coupon-redemption/coupon-redemption.component').then(m => m.CouponRedemptionComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'redemption/redemptions',
        loadComponent: () => import('./modules/redemption/pages/redemption-history/redemption-history.component').then(m => m.RedemptionHistoryComponent),
        canActivate: [permissionGuard],
        data: { permission: 'RadeemCoupon' }
      },
      {
        path: 'redemption/redemptions/:id',
        loadComponent: () => import('./modules/redemption/components/redemption-view/redemption-view.component').then(m => m.RedemptionViewComponent),
        canActivate: [permissionGuard],
        data: { permission: 'RadeemCoupon' }
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
    providers: [
      provideDaterangepickerLocale({
        format: 'YYYY-MM-DD',
        separator: ' - ',
        applyLabel: 'Apply',
        cancelLabel: 'Cancel',
        clearLabel: 'Clear'
      })
    ],
    children: [
      {
        path: '',
        redirectTo: 'coupon-generation-report',
        pathMatch: 'full'
      },
      {
        path: 'coupon-generation-report',
        loadComponent: () => import('./modules/reports/pages/coupon-generation-report/coupon-generation-report.component').then(m => m.CouponGenerationReportComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'coupon-status-expiry-report',
        loadComponent: () => import('./modules/reports/pages/coupon-status-expiry-report/coupon-status-expiry-report.component').then(m => m.CouponStatusExpiryReportComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'coupon-activation-report',
        loadComponent: () => import('./modules/reports/pages/coupon-activation-report/coupon-activation-report.component').then(m => m.CouponActivationReportComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'customer-report',
        loadComponent: () => import('./modules/reports/pages/customer-report/customer-report.component').then(m => m.CustomerReportComponent),
        canActivate: [permissionGuard]
      },
      {
        path: 'redemption-report',
        loadComponent: () => import('./modules/reports/pages/redemption-report/redemption-report.component').then(m => m.RedemptionReportComponent),
        canActivate: [permissionGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/customer/login'
  }
];
