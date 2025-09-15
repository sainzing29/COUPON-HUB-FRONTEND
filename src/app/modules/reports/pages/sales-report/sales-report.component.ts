import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

interface SalesData {
  id: number;
  date: string;
  couponsSold: number;
  revenue: number;
  servicesUsed: number;
  remainingServices: number;
}

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss'],
  animations: [
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
export class SalesReportComponent implements OnInit {
  salesData: SalesData[] = [];
  filteredSalesData: SalesData[] = [];
  
  // Filter Properties
  dateFromFilter: string = '';
  dateToFilter: string = '';
  groupByFilter: string = 'day';
  serviceCenterFilter: string = 'all';
  
  // KPI Data
  totalCouponsSold = 0;
  activeCoupons = 0;
  expiredCoupons = 0;
  totalRevenue = 0;
  
  // Mock data
  private mockSalesData: SalesData[] = [
    {
      id: 1,
      date: '2025-09-01',
      couponsSold: 15,
      revenue: 8250,
      servicesUsed: 21,
      remainingServices: 54
    },
    {
      id: 2,
      date: '2025-09-02',
      couponsSold: 20,
      revenue: 11000,
      servicesUsed: 35,
      remainingServices: 65
    },
    {
      id: 3,
      date: '2025-09-03',
      couponsSold: 12,
      revenue: 6600,
      servicesUsed: 18,
      remainingServices: 48
    },
    {
      id: 4,
      date: '2025-09-04',
      couponsSold: 25,
      revenue: 13750,
      servicesUsed: 42,
      remainingServices: 58
    },
    {
      id: 5,
      date: '2025-09-05',
      couponsSold: 18,
      revenue: 9900,
      servicesUsed: 28,
      remainingServices: 62
    },
    {
      id: 6,
      date: '2025-09-06',
      couponsSold: 22,
      revenue: 12100,
      servicesUsed: 38,
      remainingServices: 72
    },
    {
      id: 7,
      date: '2025-09-07',
      couponsSold: 16,
      revenue: 8800,
      servicesUsed: 24,
      remainingServices: 56
    },
    {
      id: 8,
      date: '2025-09-08',
      couponsSold: 30,
      revenue: 16500,
      servicesUsed: 50,
      remainingServices: 80
    },
    {
      id: 9,
      date: '2025-09-09',
      couponsSold: 14,
      revenue: 7700,
      servicesUsed: 20,
      remainingServices: 46
    },
    {
      id: 10,
      date: '2025-09-10',
      couponsSold: 28,
      revenue: 15400,
      servicesUsed: 45,
      remainingServices: 75
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.salesData = [...this.mockSalesData];
    this.filteredSalesData = [...this.salesData];
    this.calculateKPIs();
  }

  private calculateKPIs(): void {
    this.totalCouponsSold = this.filteredSalesData.reduce((total, item) => total + item.couponsSold, 0);
    this.totalRevenue = this.filteredSalesData.reduce((total, item) => total + item.revenue, 0);
    
    // Mock calculations for active and expired coupons
    this.activeCoupons = Math.floor(this.totalCouponsSold * 0.7); // 70% active
    this.expiredCoupons = this.totalCouponsSold - this.activeCoupons; // 30% expired
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  onExportCSV(): void {
    // Mock CSV export functionality
    console.log('Exporting to CSV...');
    // In real implementation, you would generate and download CSV file
  }

  onExportPDF(): void {
    // Mock PDF export functionality
    console.log('Exporting to PDF...');
    // In real implementation, you would generate and download PDF file
  }

  onDateFilterChange(): void {
    this.applyFilters();
  }

  onGroupByFilterChange(): void {
    this.applyFilters();
  }

  onServiceCenterFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.salesData];

    // Date range filter
    if (this.dateFromFilter) {
      filtered = filtered.filter(item => item.date >= this.dateFromFilter);
    }
    if (this.dateToFilter) {
      filtered = filtered.filter(item => item.date <= this.dateToFilter);
    }

    // Service center filter (mock implementation)
    if (this.serviceCenterFilter !== 'all') {
      // In real implementation, you would filter by actual service center
      // For now, we'll just keep all data
    }

    this.filteredSalesData = filtered;
    this.calculateKPIs();
  }
}
