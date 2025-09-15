import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

interface ServiceUsageData {
  id: number;
  date: string;
  customer: string;
  couponCode: string;
  servicesUsed: number;
  serviceCenter: string;
}


@Component({
  selector: 'app-service-usage-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-usage-report.component.html',
  styleUrls: ['./service-usage-report.component.scss'],
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
export class ServiceUsageReportComponent implements OnInit {
  serviceUsageData: ServiceUsageData[] = [];
  filteredServiceUsageData: ServiceUsageData[] = [];
  
  // Filter Properties
  dateFromFilter: string = '';
  dateToFilter: string = '';
  serviceCenterFilter: string = 'all';
  customerFilter: string = '';
  
  // KPI Data
  totalServicesRedeemed = 0;
  avgServicesPerCoupon = 0;
  mostActiveCustomer = '';
  
  // Mock data
  private mockServiceUsageData: ServiceUsageData[] = [
    {
      id: 1,
      date: '2025-09-01',
      customer: 'Alice Smith',
      couponCode: 'C0001',
      servicesUsed: 1,
      serviceCenter: 'Downtown SC'
    },
    {
      id: 2,
      date: '2025-09-01',
      customer: 'Bob Johnson',
      couponCode: 'C0002',
      servicesUsed: 2,
      serviceCenter: 'TechFix Hub'
    },
    {
      id: 3,
      date: '2025-09-02',
      customer: 'Charlie Brown',
      couponCode: 'C0003',
      servicesUsed: 3,
      serviceCenter: 'Central Service'
    },
    {
      id: 4,
      date: '2025-09-02',
      customer: 'Alice Smith',
      couponCode: 'C0004',
      servicesUsed: 1,
      serviceCenter: 'Downtown SC'
    },
    {
      id: 5,
      date: '2025-09-03',
      customer: 'David Wilson',
      couponCode: 'C0005',
      servicesUsed: 2,
      serviceCenter: 'North Branch'
    },
    {
      id: 6,
      date: '2025-09-03',
      customer: 'Eva Davis',
      couponCode: 'C0006',
      servicesUsed: 1,
      serviceCenter: 'TechFix Hub'
    },
    {
      id: 7,
      date: '2025-09-04',
      customer: 'Alice Smith',
      couponCode: 'C0007',
      servicesUsed: 2,
      serviceCenter: 'Downtown SC'
    },
    {
      id: 8,
      date: '2025-09-04',
      customer: 'Frank Miller',
      couponCode: 'C0008',
      servicesUsed: 1,
      serviceCenter: 'Central Service'
    },
    {
      id: 9,
      date: '2025-09-05',
      customer: 'Grace Lee',
      couponCode: 'C0009',
      servicesUsed: 3,
      serviceCenter: 'North Branch'
    },
    {
      id: 10,
      date: '2025-09-05',
      customer: 'Alice Smith',
      couponCode: 'C0010',
      servicesUsed: 1,
      serviceCenter: 'Downtown SC'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.serviceUsageData = [...this.mockServiceUsageData];
    this.filteredServiceUsageData = [...this.serviceUsageData];
    this.calculateKPIs();
  }

  private calculateKPIs(): void {
    this.totalServicesRedeemed = this.filteredServiceUsageData.reduce((total, item) => total + item.servicesUsed, 0);
    
    const uniqueCoupons = new Set(this.filteredServiceUsageData.map(item => item.couponCode)).size;
    this.avgServicesPerCoupon = uniqueCoupons > 0 ? this.totalServicesRedeemed / uniqueCoupons : 0;
    
    // Find most active customer
    const customerUsage = this.filteredServiceUsageData.reduce((acc, item) => {
      acc[item.customer] = (acc[item.customer] || 0) + item.servicesUsed;
      return acc;
    }, {} as Record<string, number>);
    
    this.mostActiveCustomer = Object.keys(customerUsage).reduce((a, b) => 
      customerUsage[a] > customerUsage[b] ? a : b, '');
  }


  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatNumber(value: number, decimals: number = 1): string {
    return value.toFixed(decimals);
  }


  onDateFilterChange(): void {
    this.applyFilters();
  }

  onServiceCenterFilterChange(): void {
    this.applyFilters();
  }

  onCustomerFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.serviceUsageData];

    // Date range filter
    if (this.dateFromFilter) {
      filtered = filtered.filter(item => item.date >= this.dateFromFilter);
    }
    if (this.dateToFilter) {
      filtered = filtered.filter(item => item.date <= this.dateToFilter);
    }

    // Service center filter
    if (this.serviceCenterFilter !== 'all') {
      const serviceCenterMap: Record<string, string> = {
        'downtown': 'Downtown SC',
        'techfix': 'TechFix Hub',
        'central': 'Central Service',
        'north': 'North Branch'
      };
      const centerName = serviceCenterMap[this.serviceCenterFilter];
      if (centerName) {
        filtered = filtered.filter(item => item.serviceCenter === centerName);
      }
    }

    // Customer filter
    if (this.customerFilter.trim()) {
      filtered = filtered.filter(item => 
        item.customer.toLowerCase().includes(this.customerFilter.toLowerCase())
      );
    }

    this.filteredServiceUsageData = filtered;
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
