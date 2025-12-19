import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { CouponStatusExpiryReportService } from '../services/coupon-status-expiry-report.service';
import { 
  CouponStatusExpiryReportItem, 
  CouponStatusExpiryReportResponse, 
  CouponStatusExpiryReportFilters,
  ExpiringSoonFilters,
  ExpiredWithServicesLeftFilters
} from '../models/coupon-status-expiry-report.model';
import { CouponSchemeService } from '../../../coupons/service/coupon-scheme.service';
import { CouponScheme } from '../../../coupons/model/coupon-scheme.model';

@Component({
  selector: 'app-coupon-status-expiry-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    NgxDaterangepickerBootstrapDirective
  ],
  templateUrl: './coupon-status-expiry-report.component.html',
  styleUrls: ['./coupon-status-expiry-report.component.scss']
})
export class CouponStatusExpiryReportComponent implements OnInit, AfterViewInit {
  // Tab management
  selectedTabIndex = 0;

  // Report data
  reportData: CouponStatusExpiryReportItem[] = [];
  isLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  // Filters for "All Coupons" tab
  selectedStatus: number | null = null;
  schemeIdFilter: number | null = null;
  selectedExpiryDateRange: any = '';
  
  // Filter for "Expiring Soon" tab
  daysUntilExpiry: number = 30;

  // Filter dropdown state
  showFilterDropdown = false;

  statusOptions = [
    { value: null, label: 'All Statuses' },
    { value: 0, label: 'Unassigned' },
    { value: 1, label: 'Active' },
    { value: 2, label: 'Completed' },
    { value: 3, label: 'Expired' }
  ];

  schemes: CouponScheme[] = [];

  constructor(
    private reportService: CouponStatusExpiryReportService,
    private couponSchemeService: CouponSchemeService,
    private toastr: ToastrService
  ) {}

  @ViewChild('expiryDateRangeInput', { static: false }) expiryDateRangeInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.loadSchemes();
    this.loadReport();
  }

  ngAfterViewInit(): void {
    // Clear the date range input value after view initialization
    if (this.expiryDateRangeInput) {
      setTimeout(() => {
        if (this.expiryDateRangeInput?.nativeElement) {
          this.expiryDateRangeInput.nativeElement.value = '';
        }
      }, 0);
    }
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.currentPage = 1;
    this.loadReport();
  }

  loadSchemes(): void {
    this.couponSchemeService.getCouponSchemes().subscribe({
      next: (schemes) => {
        this.schemes = schemes;
      },
      error: (error) => {
        console.error('Error loading schemes:', error);
        this.toastr.error('Error loading coupon schemes', 'Error');
      }
    });
  }

  loadReport(): void {
    this.isLoading = true;

    if (this.selectedTabIndex === 0) {
      // All Coupons tab
      this.loadAllCoupons();
    } else if (this.selectedTabIndex === 1) {
      // Expiring Soon tab
      this.loadExpiringSoon();
    } else if (this.selectedTabIndex === 2) {
      // Expired With Services Left tab
      this.loadExpiredWithServicesLeft();
    }
  }

  loadAllCoupons(): void {
    const filters: CouponStatusExpiryReportFilters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.selectedStatus !== null) {
      filters.status = this.selectedStatus;
    }
    if (this.schemeIdFilter !== null && this.schemeIdFilter !== undefined) {
      filters.schemeId = this.schemeIdFilter;
    }
    
    // Extract dates from date range
    if (this.selectedExpiryDateRange && this.selectedExpiryDateRange.startDate) {
      filters.expiryDateFrom = this.formatDateForApi(this.selectedExpiryDateRange.startDate);
    }
    if (this.selectedExpiryDateRange && this.selectedExpiryDateRange.endDate) {
      filters.expiryDateTo = this.formatDateForApi(this.selectedExpiryDateRange.endDate);
    }

    this.reportService.getAllCoupons(filters).subscribe({
      next: (response: CouponStatusExpiryReportResponse) => {
        this.reportData = response.items;
        this.totalCount = response.totalCount;
        this.currentPage = response.pageNumber;
        this.pageSize = response.pageSize;
        this.totalPages = response.totalPages;
        this.hasPreviousPage = response.hasPreviousPage;
        this.hasNextPage = response.hasNextPage;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading report:', error);
        this.toastr.error('Error loading coupon status expiry report', 'Error');
        this.reportData = [];
        this.isLoading = false;
      }
    });
  }

  loadExpiringSoon(): void {
    const filters: ExpiringSoonFilters = {
      days: this.daysUntilExpiry,
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.reportService.getExpiringSoon(filters).subscribe({
      next: (response: CouponStatusExpiryReportResponse) => {
        this.reportData = response.items;
        this.totalCount = response.totalCount;
        this.currentPage = response.pageNumber;
        this.pageSize = response.pageSize;
        this.totalPages = response.totalPages;
        this.hasPreviousPage = response.hasPreviousPage;
        this.hasNextPage = response.hasNextPage;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading expiring soon report:', error);
        this.toastr.error('Error loading expiring soon coupons', 'Error');
        this.reportData = [];
        this.isLoading = false;
      }
    });
  }

  loadExpiredWithServicesLeft(): void {
    const filters: ExpiredWithServicesLeftFilters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.reportService.getExpiredWithServicesLeft(filters).subscribe({
      next: (response: CouponStatusExpiryReportResponse) => {
        this.reportData = response.items;
        this.totalCount = response.totalCount;
        this.currentPage = response.pageNumber;
        this.pageSize = response.pageSize;
        this.totalPages = response.totalPages;
        this.hasPreviousPage = response.hasPreviousPage;
        this.hasNextPage = response.hasNextPage;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading expired with services left report:', error);
        this.toastr.error('Error loading expired coupons with services left', 'Error');
        this.reportData = [];
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadReport();
  }

  clearFilters(): void {
    if (this.selectedTabIndex === 0) {
      this.selectedStatus = null;
      this.schemeIdFilter = null;
      this.selectedExpiryDateRange = '';
    } else if (this.selectedTabIndex === 1) {
      this.daysUntilExpiry = 30;
    }
    this.currentPage = 1;
    this.loadReport();
  }

  formatDateForApi(date: Date | any): string {
    if (!date) return '';
    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else if (date && typeof date.toDate === 'function') {
      d = date.toDate();
    } else if (date && typeof date.format === 'function') {
      // Handle dayjs format
      return date.format('YYYY-MM-DD');
    } else {
      d = new Date(date);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onExpiryDateRangeChange(event: any): void {
    if (event && event.startDate && event.endDate) {
      this.selectedExpiryDateRange = {
        startDate: event.startDate,
        endDate: event.endDate
      };
    } else {
      this.selectedExpiryDateRange = '';
    }
  }

  getStatusColorClass(status: string): string {
    switch (status) {
      case 'Unassigned':
        return 'bg-gray-100 text-gray-800';
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadReport();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadReport();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage--;
      this.loadReport();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Expose Math for template
  get Math() {
    return Math;
  }
}


