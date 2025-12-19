import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { CouponActivationReportService } from '../services/coupon-activation-report.service';
import { 
  CouponActivationReportItem, 
  CouponActivationReportResponse, 
  CouponActivationReportFilters,
  CouponActivationKPIResponse,
  ActivationKPIFilters
} from '../models/coupon-activation-report.model';
import { CouponSchemeService } from '../../../coupons/service/coupon-scheme.service';
import { CouponScheme } from '../../../coupons/model/coupon-scheme.model';

@Component({
  selector: 'app-coupon-activation-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    NgxDaterangepickerBootstrapDirective
  ],
  templateUrl: './coupon-activation-report.component.html',
  styleUrls: ['./coupon-activation-report.component.scss']
})
export class CouponActivationReportComponent implements OnInit, AfterViewInit {
  reportData: CouponActivationReportItem[] = [];
  isLoading = false;
  isLoadingKPIs = false;

  // KPI Data
  kpiData: CouponActivationKPIResponse | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  // Filter form values
  selectedStatus: number | null = 1; // Default to Active
  schemeIdFilter: number | null = null;
  customerPhoneFilter: string = '';
  customerEmailFilter: string = '';
  selectedActivationDateRange: any = '';

  // Filter dropdown state
  showFilterDropdown = false;

  statusOptions = [
    { value: 1, label: 'Active' },
    { value: 2, label: 'Completed' },
    { value: 3, label: 'Expired' }
  ];

  schemes: CouponScheme[] = [];

  constructor(
    private reportService: CouponActivationReportService,
    private couponSchemeService: CouponSchemeService,
    private toastr: ToastrService
  ) {}

  @ViewChild('activationDateRangeInput', { static: false }) activationDateRangeInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.loadSchemes();
    this.loadKPIs();
    this.loadReport();
  }

  ngAfterViewInit(): void {
    // Clear the date range input value after view initialization
    if (this.activationDateRangeInput) {
      setTimeout(() => {
        if (this.activationDateRangeInput?.nativeElement) {
          this.activationDateRangeInput.nativeElement.value = '';
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

  loadKPIs(): void {
    this.isLoadingKPIs = true;
    
    const filters: ActivationKPIFilters = {};
    
    // Extract dates from date range for KPIs
    if (this.selectedActivationDateRange && this.selectedActivationDateRange.startDate) {
      filters.activationDateFrom = this.formatDateForApi(this.selectedActivationDateRange.startDate);
    }
    if (this.selectedActivationDateRange && this.selectedActivationDateRange.endDate) {
      filters.activationDateTo = this.formatDateForApi(this.selectedActivationDateRange.endDate);
    }

    this.reportService.getCouponActivationKPIs(filters).subscribe({
      next: (response: CouponActivationKPIResponse) => {
        this.kpiData = response;
        this.isLoadingKPIs = false;
      },
      error: (error) => {
        console.error('Error loading KPIs:', error);
        this.toastr.error('Error loading activation KPIs', 'Error');
        this.isLoadingKPIs = false;
      }
    });
  }

  loadReport(): void {
    this.isLoading = true;
    
    const filters: CouponActivationReportFilters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.selectedStatus !== null) {
      filters.status = this.selectedStatus;
    }
    if (this.schemeIdFilter !== null && this.schemeIdFilter !== undefined) {
      filters.schemeId = this.schemeIdFilter;
    }
    if (this.customerPhoneFilter.trim()) {
      filters.customerPhone = this.customerPhoneFilter.trim();
    }
    if (this.customerEmailFilter.trim()) {
      filters.customerEmail = this.customerEmailFilter.trim();
    }
    
    // Extract dates from date range
    if (this.selectedActivationDateRange && this.selectedActivationDateRange.startDate) {
      filters.activationDateFrom = this.formatDateForApi(this.selectedActivationDateRange.startDate);
    }
    if (this.selectedActivationDateRange && this.selectedActivationDateRange.endDate) {
      filters.activationDateTo = this.formatDateForApi(this.selectedActivationDateRange.endDate);
    }

    this.reportService.getCouponActivationReport(filters).subscribe({
      next: (response: CouponActivationReportResponse) => {
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
        this.toastr.error('Error loading coupon activation report', 'Error');
        this.reportData = [];
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadKPIs();
    this.loadReport();
  }

  clearFilters(): void {
    this.selectedStatus = 1; // Reset to Active
    this.schemeIdFilter = null;
    this.customerPhoneFilter = '';
    this.customerEmailFilter = '';
    this.selectedActivationDateRange = '';
    this.currentPage = 1;
    this.loadKPIs();
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

  onActivationDateRangeChange(event: any): void {
    if (event && event.startDate && event.endDate) {
      this.selectedActivationDateRange = {
        startDate: event.startDate,
        endDate: event.endDate
      };
    } else {
      this.selectedActivationDateRange = '';
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

