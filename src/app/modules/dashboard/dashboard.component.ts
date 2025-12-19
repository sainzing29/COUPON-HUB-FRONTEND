import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, stagger, query } from '@angular/animations';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardService } from './services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from './models/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerCards', [
      transition(':enter', [
        query('.stat-card', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ]),
    trigger('slideInFromRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {

  dashboardStats: DashboardStats | null = null;
  isLoading = false;
  errorMessage = '';
  couponActivationGrowth = 0;
  servicesCompletedGrowth = 0;

  // Chart.js configurations for Line Charts
  public activeCouponChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Activated Coupons by Month',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Activated Coupons Count'
        },
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        },
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      }
    }
  };

  public serviceRedemptionsChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Service Redemptions by Month',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Number of Services Redeemed'
        },
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        },
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      }
    }
  };

  // Chart.js configuration for Donut Chart
  public couponStatusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      title: {
        display: true,
        text: 'Coupon Status Distribution',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Chart data
  public activeCouponChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Activated Coupons',
        backgroundColor: 'rgba(0, 167, 225, 0.2)',
        borderColor: 'rgba(0, 167, 225, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  public serviceRedemptionsChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Services Redeemed',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  public couponStatusChartData: ChartData<'doughnut'> = {
    labels: ['Unassigned', 'Active', 'Completed', 'Expired'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)',  // Gray for Unassigned
          'rgba(34, 197, 94, 0.8)',    // Green for Active
          'rgba(59, 130, 246, 0.8)',   // Blue for Completed
          'rgba(239, 68, 68, 0.8)'     // Red for Expired
        ],
        borderColor: [
          'rgba(156, 163, 175, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  public lineChartType: 'line' = 'line';
  public donutChartType: 'doughnut' = 'doughnut';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getDashboardStats();
  }

  /**
   * Update charts with data from dashboard stats
   */
  private updateChartsWithStats(): void {
    if (!this.dashboardStats) return;

    // Update Active Coupon Count by Month (Line Chart)
    if (this.dashboardStats.activeCouponCountByMonth && this.dashboardStats.activeCouponCountByMonth.length > 0) {
      const labels = this.dashboardStats.activeCouponCountByMonth.map(item => item.month);
      const data = this.dashboardStats.activeCouponCountByMonth.map(item => item.activatedCouponsCount);
      
      this.activeCouponChartData = {
        labels: labels,
        datasets: [
          {
            data: data,
            label: 'Activated Coupons',
            backgroundColor: 'rgba(0, 167, 225, 0.2)',
            borderColor: 'rgba(0, 167, 225, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      };
    }

    // Update Service Redemptions by Month (Line Chart)
    if (this.dashboardStats.serviceRedemptionsByMonth && this.dashboardStats.serviceRedemptionsByMonth.length > 0) {
      const labels = this.dashboardStats.serviceRedemptionsByMonth.map(item => item.month);
      const data = this.dashboardStats.serviceRedemptionsByMonth.map(item => item.servicesRedeemedCount);
      
      this.serviceRedemptionsChartData = {
        labels: labels,
        datasets: [
          {
            data: data,
            label: 'Services Redeemed',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      };
    }

    // Update Coupon Status Counts (Donut Chart)
    if (this.dashboardStats.couponStatusCounts) {
      const statusCounts = this.dashboardStats.couponStatusCounts;
      this.couponStatusChartData = {
        labels: ['Unassigned', 'Active', 'Completed', 'Expired'],
        datasets: [
          {
            data: [
              statusCounts.unassigned || 0,
              statusCounts.active || 0,
              statusCounts.completed || 0,
              statusCounts.expired || 0
            ],
            backgroundColor: [
              'rgba(156, 163, 175, 0.8)',  // Gray for Unassigned
              'rgba(34, 197, 94, 0.8)',    // Green for Active
              'rgba(59, 130, 246, 0.8)',   // Blue for Completed
              'rgba(239, 68, 68, 0.8)'     // Red for Expired
            ],
            borderColor: [
              'rgba(156, 163, 175, 1)',
              'rgba(34, 197, 94, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 2
          }
        ]
      };
    }
  }

  /**
   * Get dashboard statistics from API
   */
  getDashboardStats(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboardStats().subscribe({
      next: (stats: DashboardStats) => {
        this.dashboardStats = stats;
        
        // Calculate coupon activation growth percentage
        const activationGrowth = ((this.dashboardStats.newActivationsThisMonth - this.dashboardStats.newActivationsLastMonth)
          / Math.max(1, this.dashboardStats.newActivationsLastMonth)) * 100;
        this.couponActivationGrowth = Math.round(activationGrowth * 100) / 100; // Round to 2 decimal places
        
        // Calculate services completed growth percentage
        const servicesGrowth = ((this.dashboardStats.servicesCompletedThisMonth - this.dashboardStats.servicesCompletedLastMonth)
          / Math.max(1, this.dashboardStats.servicesCompletedLastMonth)) * 100;
        this.servicesCompletedGrowth = Math.round(servicesGrowth * 100) / 100; // Round to 2 decimal places

        // Update charts with the new data
        this.updateChartsWithStats();

        this.isLoading = false;
        console.log('Dashboard stats loaded:', stats);
      },
      error: (error) => {
        console.error('Error fetching dashboard stats:', error);
        this.errorMessage = 'Failed to load dashboard statistics. Please try again.';
        this.isLoading = false;
      }
    });
  }


  /**
   * Chart event handlers (from ng2-charts documentation)
   */
  chartHovered(event: any): void {
    console.log('Chart hovered:', event);
  }

  chartClicked(event: any): void {
    console.log('Chart clicked:', event);
  }

  /**
   * Get service center chart title based on user role
   */
  getServiceCenterTitle(): string {
    const user = this.authService.getCurrentUser();
    return user?.serviceCenterId ? "Your Center Performance" : "All Centers Performance";
  }

  /**
   * Get service center chart description based on user role
   */
  getServiceCenterDescription(): string {
    const user = this.authService.getCurrentUser();
    return user?.serviceCenterId ? "Services completed at your center" : "Total services completed across all centers";
  }


  /**
   * Get current user role from JWT token
   */
  getUserRole(): string | null {
    return this.authService.getUserRole();
  }

  /**
   * Check if current user is SuperAdmin
   */
  isSuperAdmin(): boolean {
    return this.authService.hasRole('SuperAdmin');
  }

  /**
   * Check if current user is Admin
   */
  isAdmin(): boolean {
    return this.authService.hasRole('Admin');
  }

  /**
   * Format currency values
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  /**
   * Format number with commas
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  /**
   * Get dashboard stats for display
   */
  getDashboardStatsForDisplay() {
    if (!this.dashboardStats) return null;

    return {
      totalCouponsGenerated: this.formatNumber(this.dashboardStats.totalCouponsGenerated),
      totalCouponsActivated: this.formatNumber(this.dashboardStats.totalCouponsActivated),
      newActivationsThisMonth: this.formatNumber(this.dashboardStats.newActivationsThisMonth),
      newActivationsLastMonth: this.formatNumber(this.dashboardStats.newActivationsLastMonth),
      activeCoupons: this.formatNumber(this.dashboardStats.activeCoupons),
      completedCoupons: this.formatNumber(this.dashboardStats.completedCoupons),
      expiredCoupons: this.formatNumber(this.dashboardStats.expiredCoupons),
      servicesCompleted: this.formatNumber(this.dashboardStats.servicesCompleted),
      servicesCompletedThisMonth: this.formatNumber(this.dashboardStats.servicesCompletedThisMonth),
      servicesCompletedLastMonth: this.formatNumber(this.dashboardStats.servicesCompletedLastMonth),
      totalCustomers: this.formatNumber(this.dashboardStats.totalCustomers),
      newCustomersThisMonth: this.formatNumber(this.dashboardStats.newCustomersThisMonth)
    };
  }
}