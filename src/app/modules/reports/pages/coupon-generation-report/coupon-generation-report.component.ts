import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { CouponGenerationReportService } from '../services/coupon-generation-report.service';
import { CouponGenerationReportItem, CouponGenerationReportResponse, CouponGenerationReportFilters } from '../models/coupon-generation-report.model';
import { CouponSchemeService } from '../../../coupons/service/coupon-scheme.service';
import { CouponScheme } from '../../../coupons/model/coupon-scheme.model';

@Component({
  selector: 'app-coupon-generation-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    NgxDaterangepickerBootstrapDirective
  ],
  templateUrl: './coupon-generation-report.component.html',
  styleUrls: ['./coupon-generation-report.component.scss']
})
export class CouponGenerationReportComponent implements OnInit, AfterViewInit {
  reportData: CouponGenerationReportItem[] = [];
  isLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  // Filters
  filters: CouponGenerationReportFilters = {
    pageNumber: 1,
    pageSize: 10
  };

  // Filter form values
  selectedStatus: number | null = null;
  prefixFilter: string = '';
  periodFilter: string = '';
  batchIdFilter: number | null = null;
  schemeIdFilter: number | null = null;
  
  // Date range
  selectedDateRange: any = '';

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
    private reportService: CouponGenerationReportService,
    private couponSchemeService: CouponSchemeService,
    private toastr: ToastrService
  ) {}

  @ViewChild('dateRangeInput', { static: false }) dateRangeInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.loadSchemes();
    this.loadReport();
  }

  ngAfterViewInit(): void {
    // Clear the date range input value after view initialization
    if (this.dateRangeInput) {
      setTimeout(() => {
        if (this.dateRangeInput?.nativeElement) {
          this.dateRangeInput.nativeElement.value = '';
        }
      }, 0);
    }
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
    
    // Build filters
    const filters: CouponGenerationReportFilters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.selectedStatus !== null) {
      filters.status = this.selectedStatus;
    }
    if (this.prefixFilter.trim()) {
      filters.prefix = this.prefixFilter.trim();
    }
    if (this.periodFilter.trim()) {
      filters.period = this.periodFilter.trim();
    }
    if (this.batchIdFilter !== null && this.batchIdFilter !== undefined) {
      filters.batchId = this.batchIdFilter;
    }
    if (this.schemeIdFilter !== null && this.schemeIdFilter !== undefined) {
      filters.schemeId = this.schemeIdFilter;
    }
    
    // Extract dates from date range
    if (this.selectedDateRange && this.selectedDateRange.startDate) {
      filters.couponCreatedDateFrom = this.formatDateForApi(this.selectedDateRange.startDate);
    }
    if (this.selectedDateRange && this.selectedDateRange.endDate) {
      filters.couponCreatedDateTo = this.formatDateForApi(this.selectedDateRange.endDate);
    }

    this.reportService.getCouponGenerationReport(filters).subscribe({
      next: (response: CouponGenerationReportResponse) => {
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
        this.toastr.error('Error loading coupon generation report', 'Error');
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
    this.selectedStatus = null;
    this.prefixFilter = '';
    this.periodFilter = '';
    this.batchIdFilter = null;
    this.schemeIdFilter = null;
    this.selectedDateRange = '';
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

  onDateRangeChange(event: any): void {
    if (event && event.startDate && event.endDate) {
      this.selectedDateRange = {
        startDate: event.startDate,
        endDate: event.endDate
      };
    } else {
      this.selectedDateRange = '';
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

