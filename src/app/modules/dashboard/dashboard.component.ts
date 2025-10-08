import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, stagger, query } from '@angular/animations';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardService } from './services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats, DashboardChartData, SalesTrendData, ServiceCenterData, CouponUsageData } from './models/dashboard';

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
  chartData: DashboardChartData | null = null;
  isLoading = false;
  errorMessage = '';
  couponSoldGrowth = 0;
  revenueGrowth = 0;

  // Chart.js configurations
  public salesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} AED`;
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
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      }
    }
  };

  public serviceCenterChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: false
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
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      }
    }
  };

  public couponUsageChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: false
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
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      }
    }
  };

  public salesChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        label: 'Revenue',
        backgroundColor: 'rgba(0, 167, 225, 0.6)',
        borderColor: 'rgba(0, 167, 225, 1)',
        borderWidth: 1
      }
    ]
  };

  public serviceCenterChartData: ChartData<'bar'> = {
    labels: ['Center A', 'Center B', 'Center C', 'Center D', 'Center E'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0],
        label: 'Services Completed',
        backgroundColor: 'rgba(0, 167, 225, 0.6)',
        borderColor: 'rgba(0, 167, 225, 1)',
        borderWidth: 1
      }
    ]
  };

  public couponUsageChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        label: 'Coupons Redeemed',
        backgroundColor: 'rgba(0, 167, 225, 0.6)',
        borderColor: 'rgba(0, 167, 225, 1)',
        borderWidth: 1
      }
    ]
  };

  public chartType: ChartType = 'bar';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // DUMMY DATA - Commented out API integrations
    // this.getDashboardStats();
    // this.getDashboardChartData();
    
    // Load dummy data instead
    this.loadDummyData();
  }

  /**
   * Initialize sample data for charts if API data is not available
   */
  private initializeSampleData(): void {
    // Sample data for Sales Trends
    this.salesChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          data: [12000, 15000, 18000, 14000, 16000, 20000, 22000, 19000, 25000, 28000, 26000, 30000],
          label: 'Revenue',
          backgroundColor: 'rgba(0, 167, 225, 0.6)',
          borderColor: 'rgba(0, 167, 225, 1)',
          borderWidth: 1
        }
      ]
    };

    // Sample data for Service Centers
    this.serviceCenterChartData = {
      labels: ['Center A', 'Center B', 'Center C', 'Center D', 'Center E'],
      datasets: [
        {
          data: [45, 38, 52, 41, 35],
          label: 'Services Completed',
          backgroundColor: 'rgba(0, 167, 225, 0.6)',
          borderColor: 'rgba(0, 167, 225, 1)',
          borderWidth: 1
        }
      ]
    };

    // Sample data for Coupon Usage
    this.couponUsageChartData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          data: [120, 150, 180, 140],
          label: 'Coupons Used',
          backgroundColor: 'rgba(0, 167, 225, 0.6)',
          borderColor: 'rgba(0, 167, 225, 1)',
          borderWidth: 1
        }
      ]
    };
  }

  /**
   * Get dashboard statistics from API - COMMENTED OUT FOR DUMMY DATA
   */
  // getDashboardStats(): void {
  //   this.isLoading = true;
  //   this.errorMessage = '';

  //   this.dashboardService.getDashboardStats().subscribe({
  //     next: (stats: DashboardStats) => {
  //       this.dashboardStats = stats;
  //       this.couponSoldGrowth = ((this.dashboardStats.couponsSoldThisMonth - this.dashboardStats.couponsSoldLastMonth)
  //        / (this.dashboardStats.couponsSoldLastMonth == 0 ? 1 : this.dashboardStats.couponsSoldLastMonth)) * 100
  //       this.revenueGrowth = ((this.dashboardStats.revenueThisMonth - this.dashboardStats.revenueLastMonth)
  //        / (this.dashboardStats.revenueLastMonth == 0 ? 1 : this.dashboardStats.revenueLastMonth)) * 100

  //       this.isLoading = false;
  //       console.log('Dashboard stats loaded:', stats);
  //     },
  //     error: (error) => {
  //       console.error('Error fetching dashboard stats:', error);
  //       this.errorMessage = 'Failed to load dashboard statistics. Please try again.';
  //       this.isLoading = false;
  //     }
  //   });
  // }

  /**
   * Get dashboard chart data - COMMENTED OUT FOR DUMMY DATA
   */
  // getDashboardChartData(): void {
  //   this.dashboardService.getDashboardChartData(6).subscribe({
  //     next: (data: DashboardChartData) => {
  //       this.chartData = data;
  //       this.updateChartsWithData();
  //       console.log('Chart data loaded:', data);
  //     },
  //     error: (error) => {
  //       console.error('Error fetching chart data:', error);
  //       this.errorMessage = 'Failed to load chart data. Please try again.';
  //       // Only show sample data if API fails
  //       this.initializeSampleData();
  //     }
  //   });
  // }

  /**
   * Update charts with new data
   */
  updateChartsWithData(): void {
    if (!this.chartData) return;

    console.log('Updating charts with API data:', this.chartData);

    // Update Sales Trends chart
    const salesLabels = this.chartData.salesTrends.data.map(item => this.getShortDateLabel(item.month));
    const salesData = this.chartData.salesTrends.data.map(item => item.revenue);
    console.log('Sales chart - Labels:', salesLabels, 'Data:', salesData);

    this.salesChartData = {
      labels: salesLabels,
      datasets: [
        {
          data: salesData,
          label: 'Revenue',
          backgroundColor: 'rgba(0, 167, 225, 0.6)',
          borderColor: 'rgba(0, 167, 225, 1)',
          borderWidth: 1
        }
      ]
    };
    
    // Update Service Center Distribution chart
    const serviceLabels = this.chartData.serviceCenterDistribution.data.map(item => this.getShortDateLabel(item.serviceCenterName));
    const serviceData = this.chartData.serviceCenterDistribution.data.map(item => item.servicesCompleted);
    console.log('Service Center chart - Labels:', serviceLabels, 'Data:', serviceData);

    this.serviceCenterChartData = {
      labels: serviceLabels,
      datasets: [
        {
          data: serviceData,
          label: 'Services Completed',
          backgroundColor: 'rgba(0, 167, 225, 0.6)',
          borderColor: 'rgba(0, 167, 225, 1)',
          borderWidth: 1
        }
      ]
    };
    
    // Update Coupon Usage chart - show redeemed coupons instead of total
    const couponLabels = this.chartData.couponUsage.data.map(item => item.period);
    const couponData = this.chartData.couponUsage.data.map(item => item.redeemedCoupons);
    console.log('Coupon Usage chart - Labels:', couponLabels, 'Data:', couponData);

    this.couponUsageChartData = {
      labels: couponLabels,
      datasets: [
        {
          data: couponData,
          label: 'Coupons Redeemed',
          backgroundColor: 'rgba(0, 167, 225, 0.6)',
          borderColor: 'rgba(0, 167, 225, 1)',
          borderWidth: 1
        }
      ]
    };

    console.log('Charts updated:', {
      salesChartData: this.salesChartData,
      serviceCenterChartData: this.serviceCenterChartData,
      couponUsageChartData: this.couponUsageChartData
    });
  }

  /**
   * Refresh chart data from API - COMMENTED OUT FOR DUMMY DATA
   */
  // refreshChartData(): void {
  //   this.getDashboardChartData();
  // }

  /**
   * Load dummy data for dashboard - replaces API calls
   */
  loadDummyData(): void {
    this.isLoading = true;
    
    // Simulate API delay
    setTimeout(() => {
      // Load dummy dashboard stats
      this.dashboardStats = {
        totalCouponsSold: 1250,
        couponsSoldThisMonth: 180,
        couponsSoldLastMonth: 150,
        activeCoupons: 95,
        servicesCompleted: 420,
        servicesCompletedThisMonth: 65,
        totalRevenue: 125000,
        revenueThisMonth: 18500,
        revenueLastMonth: 15200
      };

      // Calculate growth percentages
      this.couponSoldGrowth = ((this.dashboardStats.couponsSoldThisMonth - this.dashboardStats.couponsSoldLastMonth)
       / (this.dashboardStats.couponsSoldLastMonth == 0 ? 1 : this.dashboardStats.couponsSoldLastMonth)) * 100;
      this.revenueGrowth = ((this.dashboardStats.revenueThisMonth - this.dashboardStats.revenueLastMonth)
       / (this.dashboardStats.revenueLastMonth == 0 ? 1 : this.dashboardStats.revenueLastMonth)) * 100;

      // Load dummy chart data
      this.chartData = {
        salesTrends: {
          title: 'Sales Trends',
          description: 'Monthly revenue performance',
          footer: 'Last updated: Today',
          data: [
            { month: 'Jan', year: 2024, revenue: 12000, couponsSold: 45 },
            { month: 'Feb', year: 2024, revenue: 15000, couponsSold: 52 },
            { month: 'Mar', year: 2024, revenue: 18000, couponsSold: 68 },
            { month: 'Apr', year: 2024, revenue: 14000, couponsSold: 48 },
            { month: 'May', year: 2024, revenue: 16000, couponsSold: 55 },
            { month: 'Jun', year: 2024, revenue: 20000, couponsSold: 72 }
          ]
        },
        serviceCenterDistribution: {
          title: 'Monthly Services Performance',
          description: 'Services completed by month',
          footer: 'Monthly analysis',
          data: [
            { serviceCenterId: 1, serviceCenterName: 'Jan', servicesCompleted: 45, couponsRedeemed: 120, revenue: 15000 },
            { serviceCenterId: 2, serviceCenterName: 'Feb', servicesCompleted: 38, couponsRedeemed: 95, revenue: 12000 },
            { serviceCenterId: 3, serviceCenterName: 'Mar', servicesCompleted: 52, couponsRedeemed: 140, revenue: 18000 },
            { serviceCenterId: 4, serviceCenterName: 'Apr', servicesCompleted: 41, couponsRedeemed: 110, revenue: 14000 },
            { serviceCenterId: 5, serviceCenterName: 'May', servicesCompleted: 35, couponsRedeemed: 85, revenue: 11000 }
          ]
        },
        couponUsage: {
          title: 'Coupon Usage',
          description: 'Usage patterns and redemption rates',
          footer: 'Weekly analysis',
          data: [
            { period: 'Week 1', year: 2024, totalCoupons: 120, redeemedCoupons: 95, redemptionRate: 79.2, activeCoupons: 25, expiredCoupons: 5, unassignedCoupons: 10, completedCoupons: 80 },
            { period: 'Week 2', year: 2024, totalCoupons: 150, redeemedCoupons: 120, redemptionRate: 80.0, activeCoupons: 30, expiredCoupons: 8, unassignedCoupons: 12, completedCoupons: 100 },
            { period: 'Week 3', year: 2024, totalCoupons: 180, redeemedCoupons: 145, redemptionRate: 80.6, activeCoupons: 35, expiredCoupons: 10, unassignedCoupons: 15, completedCoupons: 120 },
            { period: 'Week 4', year: 2024, totalCoupons: 140, redeemedCoupons: 110, redemptionRate: 78.6, activeCoupons: 30, expiredCoupons: 7, unassignedCoupons: 13, completedCoupons: 90 }
          ]
        }
      };

      // Update charts with dummy data
      this.updateChartsWithData();
      
      this.isLoading = false;
      console.log('Dummy dashboard data loaded:', {
        stats: this.dashboardStats,
        chartData: this.chartData
      });
    }, 1000); // 1 second delay to simulate API call
  }

  /**
   * Refresh dummy data (simulates API refresh)
   */
  refreshChartData(): void {
    console.log('Refreshing dummy data...');
    this.loadDummyData();
  }

  /**
   * Convert date string to short format (e.g., "Oct 2024" -> "oct-24")
   * Only use this for actual date strings, not for service center names or periods
   */
  getShortDateLabel(dateString: string): string {
    if (!dateString || dateString === 'Service Center') {
      return dateString;
    }

    // Handle formats like "Oct 2024", "Dec 2024", etc.
    const parts = dateString.trim().split(' ');
    if (parts.length >= 2) {
      const month = parts[0].toLowerCase();
      const year = parts[1];
      const shortYear = year.length === 4 ? year.slice(-2) : year;
      return `${month}-${shortYear}`;
    }

    // Handle other formats or return as is
    return dateString;
  }

  /**
   * Check if chart has any data
   */
  hasChartData(chartData: any[] | undefined): boolean {
    if (!chartData || !Array.isArray(chartData)) {
      return false;
    }
    
    // Check if any item has meaningful numeric data > 0
    const hasData = chartData.some(item => {
      // Check specific numeric fields that matter for charts
      const numericFields = ['revenue', 'couponsSold', 'servicesCompleted', 'couponsRedeemed', 'redeemedCoupons', 'totalCoupons'];
      return numericFields.some(field => 
        typeof item[field] === 'number' && item[field] > 0
      );
    });
    return hasData;
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
      totalCouponsSold: this.formatNumber(this.dashboardStats.totalCouponsSold),
      couponsSoldLastMonth: this.formatNumber(this.dashboardStats.couponsSoldLastMonth),
      activeCoupons: this.formatNumber(this.dashboardStats.activeCoupons),
      servicesCompleted: this.formatNumber(this.dashboardStats.servicesCompleted),
      servicesCompletedThisMonth: this.formatNumber(this.dashboardStats.servicesCompletedThisMonth),
      totalRevenue: this.formatCurrency(this.dashboardStats.totalRevenue),
      revenueThisMonth: this.formatCurrency(this.dashboardStats.revenueThisMonth)
    };
  }
}