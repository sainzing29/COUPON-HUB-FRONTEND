import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/sign-in',
    pathMatch: 'full'
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./modules/auth/pages/sign-in/sign-in.component').then(m => m.SignInComponent)
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./modules/auth/pages/sign-up/sign-up.component').then(m => m.SignUpComponent)
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
        path: 'coupons',
        loadComponent: () => import('./modules/organization/pages/coupons/coupons.component').then(m => m.CouponsComponent)
      },
      {
        path: 'invoices',
        loadComponent: () => import('./modules/organization/pages/invoices/invoices.component').then(m => m.InvoicesComponent)
      },
      {
        path: 'customer-profile/:id',
        loadComponent: () => import('./modules/organization/pages/customer-profile/customer-profile.component').then(m => m.CustomerProfileComponent)
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
  }
];
