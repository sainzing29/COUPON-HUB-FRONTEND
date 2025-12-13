import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { CustomerReportService } from '../services/customer.report.service';
import { 
  CustomerReportItem, 
  CustomerReportResponse, 
  CustomerReportFilters,
  CustomerKPIResponse,
  CustomerKPIFilters
} from '../models/customer-report.models';

@Component({
  selector: 'app-customer-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    NgxDaterangepickerBootstrapDirective
  ],
  templateUrl: './customer-report.component.html',
  styleUrls: ['./customer-report.component.scss']
})
export class CustomerReportComponent implements OnInit, AfterViewInit {
  reportData: CustomerReportItem[] = [];
  isLoading = false;
  isLoadingKPIs = false;

  // KPI Data
  kpiData: CustomerKPIResponse | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  // Filter form values
  hasActiveCoupons: boolean | null = null;
  totalRedemptionsMin: number | null = null;
  engagedCustomerMinRedemptions: number = 1;
  selectedCreatedDateRange: any = '';

  // Filter dropdown state
  showFilterDropdown = false;

  constructor(
    private reportService: CustomerReportService,
    private toastr: ToastrService
  ) {}

  @ViewChild('createdDateRangeInput', { static: false }) createdDateRangeInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.loadKPIs();
    this.loadReport();
  }

  ngAfterViewInit(): void {
    // Clear the date range input value after view initialization
    if (this.createdDateRangeInput) {
      setTimeout(() => {
        if (this.createdDateRangeInput?.nativeElement) {
          this.createdDateRangeInput.nativeElement.value = '';
        }
      }, 0);
    }
  }

  loadKPIs(): void {
    this.isLoadingKPIs = true;
    
    const filters: CustomerKPIFilters = {
      engagedCustomerMinRedemptions: this.engagedCustomerMinRedemptions
    };
    
    // Extract dates from date range for KPIs
    if (this.selectedCreatedDateRange && this.selectedCreatedDateRange.startDate) {
      filters.customerCreatedAtFrom = this.formatDateForApi(this.selectedCreatedDateRange.startDate, true);
    }
    if (this.selectedCreatedDateRange && this.selectedCreatedDateRange.endDate) {
      filters.customerCreatedAtTo = this.formatDateForApi(this.selectedCreatedDateRange.endDate, true);
    }

    this.reportService.getCustomerKPIs(filters).subscribe({
      next: (response: CustomerKPIResponse) => {
        this.kpiData = response;
        this.isLoadingKPIs = false;
      },
      error: (error) => {
        console.error('Error loading KPIs:', error);
        this.toastr.error('Error loading customer KPIs', 'Error');
        this.isLoadingKPIs = false;
      }
    });
  }

  loadReport(): void {
    this.isLoading = true;
    
    const filters: CustomerReportFilters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.hasActiveCoupons !== null) {
      filters.hasActiveCoupons = this.hasActiveCoupons;
    }
    if (this.totalRedemptionsMin !== null && this.totalRedemptionsMin !== undefined) {
      filters.totalRedemptionsMin = this.totalRedemptionsMin;
    }
    
    // Extract dates from date range
    if (this.selectedCreatedDateRange && this.selectedCreatedDateRange.startDate) {
      filters.customerCreatedAtFrom = this.formatDateForApi(this.selectedCreatedDateRange.startDate, true);
    }
    if (this.selectedCreatedDateRange && this.selectedCreatedDateRange.endDate) {
      filters.customerCreatedAtTo = this.formatDateForApi(this.selectedCreatedDateRange.endDate, true);
    }

    this.reportService.getCustomerReport(filters).subscribe({
      next: (response: CustomerReportResponse) => {
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
        this.toastr.error('Error loading customer report', 'Error');
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
    this.hasActiveCoupons = null;
    this.totalRedemptionsMin = null;
    this.engagedCustomerMinRedemptions = 1;
    this.selectedCreatedDateRange = '';
    this.currentPage = 1;
    this.loadKPIs();
    this.loadReport();
  }

  formatDateForApi(date: Date | any, includeTime: boolean = false): string {
    if (!date) return '';
    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else if (date && typeof date.toDate === 'function') {
      d = date.toDate();
    } else if (date && typeof date.format === 'function') {
      // Handle dayjs format
      if (includeTime) {
        return date.format('YYYY-MM-DDTHH:mm:ss[Z]');
      }
      return date.format('YYYY-MM-DD');
    } else {
      d = new Date(date);
    }
    
    if (includeTime) {
      // Format as ISO 8601 with time
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    } else {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  onCreatedDateRangeChange(event: any): void {
    if (event && event.startDate && event.endDate) {
      this.selectedCreatedDateRange = {
        startDate: event.startDate,
        endDate: event.endDate
      };
    } else {
      this.selectedCreatedDateRange = '';
    }
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
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

