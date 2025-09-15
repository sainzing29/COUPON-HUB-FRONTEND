import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

interface ServiceCenterPerformanceData {
  id: number;
  serviceCenter: string;
  admin: string;
  couponsSold: number;
  servicesUsed: number;
  revenue: number;
}


@Component({
  selector: 'app-service-center-performance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-center-performance.component.html',
  styleUrls: ['./service-center-performance.component.scss'],
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
export class ServiceCenterPerformanceComponent implements OnInit {
  serviceCenterData: ServiceCenterPerformanceData[] = [];
  filteredServiceCenterData: ServiceCenterPerformanceData[] = [];
  
  // Filter Properties
  dateFromFilter: string = '';
  dateToFilter: string = '';
  serviceCenterFilter: string = 'all';
  
  // KPI Data
  topPerformingCenter = '';
  lowestPerformingCenter = '';
  totalRevenue = 0;
  
  // Mock data
  private mockServiceCenterData: ServiceCenterPerformanceData[] = [
    {
      id: 1,
      serviceCenter: 'Downtown SC',
      admin: 'John Admin',
      couponsSold: 120,
      servicesUsed: 350,
      revenue: 190000
    },
    {
      id: 2,
      serviceCenter: 'TechFix Hub',
      admin: 'Mary Admin',
      couponsSold: 80,
      servicesUsed: 210,
      revenue: 120000
    },
    {
      id: 3,
      serviceCenter: 'Central Service',
      admin: 'David Admin',
      couponsSold: 95,
      servicesUsed: 280,
      revenue: 150000
    },
    {
      id: 4,
      serviceCenter: 'North Branch',
      admin: 'Sarah Admin',
      couponsSold: 60,
      servicesUsed: 180,
      revenue: 95000
    },
    {
      id: 5,
      serviceCenter: 'East Center',
      admin: 'Mike Admin',
      couponsSold: 75,
      servicesUsed: 220,
      revenue: 110000
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.serviceCenterData = [...this.mockServiceCenterData];
    this.filteredServiceCenterData = [...this.serviceCenterData];
    this.calculateKPIs();
  }

  private calculateKPIs(): void {
    this.totalRevenue = this.filteredServiceCenterData.reduce((total, item) => total + item.revenue, 0);
    
    // Find top and lowest performing centers by revenue
    const sortedByRevenue = [...this.filteredServiceCenterData].sort((a, b) => b.revenue - a.revenue);
    this.topPerformingCenter = sortedByRevenue.length > 0 ? sortedByRevenue[0].serviceCenter : '';
    this.lowestPerformingCenter = sortedByRevenue.length > 0 ? sortedByRevenue[sortedByRevenue.length - 1].serviceCenter : '';
  }


  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }


  onDateFilterChange(): void {
    this.applyFilters();
  }

  onServiceCenterFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.serviceCenterData];

    // Date range filter (mock implementation - in real app, you'd filter by actual dates)
    if (this.dateFromFilter || this.dateToFilter) {
      // For now, keep all data as we don't have date fields in this mock data
    }

    // Service center filter
    if (this.serviceCenterFilter !== 'all') {
      const serviceCenterMap: Record<string, string> = {
        'downtown': 'Downtown SC',
        'techfix': 'TechFix Hub',
        'central': 'Central Service',
        'north': 'North Branch',
        'east': 'East Center'
      };
      const centerName = serviceCenterMap[this.serviceCenterFilter];
      if (centerName) {
        filtered = filtered.filter(item => item.serviceCenter === centerName);
      }
    }

    this.filteredServiceCenterData = filtered;
    this.calculateKPIs();
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
}
