import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { RedemptionReportService } from '../services/redemption-report.service';
import { 
  RedemptionReportItem, 
  RedemptionReportResponse, 
  RedemptionReportFilters
} from '../models/redemption-report.models';
import { ServiceCenterService, ServiceCenter } from '../../../organization/pages/service-centers/service-center.service';

@Component({
  selector: 'app-redemption-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    NgxDaterangepickerBootstrapDirective
  ],
  templateUrl: './redemption-report.component.html',
  styleUrls: ['./redemption-report.component.scss']
})
export class RedemptionReportComponent implements OnInit, AfterViewInit {
  reportData: RedemptionReportItem[] = [];
  isLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  // Filter form values
  selectedCouponStatus: number | null = null;
  serviceCenterIdFilter: number | null = null;
  selectedRedemptionDateRange: any = '';

  // Filter dropdown state
  showFilterDropdown = false;

  statusOptions = [
    { value: null, label: 'All Statuses' },
    { value: 1, label: 'Active' },
    { value: 2, label: 'Completed' }
  ];

  serviceCenters: ServiceCenter[] = [];

  constructor(
    private reportService: RedemptionReportService,
    private serviceCenterService: ServiceCenterService,
    private toastr: ToastrService
  ) {}

  @ViewChild('redemptionDateRangeInput', { static: false }) redemptionDateRangeInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.loadServiceCenters();
    this.loadReport();
  }

  ngAfterViewInit(): void {
    // Clear the date range input value after view initialization
    if (this.redemptionDateRangeInput) {
      setTimeout(() => {
        if (this.redemptionDateRangeInput?.nativeElement) {
          this.redemptionDateRangeInput.nativeElement.value = '';
        }
      }, 0);
    }
  }

  loadServiceCenters(): void {
    this.serviceCenterService.getServiceCenters(true).subscribe({
      next: (serviceCenters) => {
        this.serviceCenters = serviceCenters.filter(sc => sc.isActive !== false);
      },
      error: (error) => {
        console.error('Error loading service centers:', error);
        this.toastr.error('Error loading service centers', 'Error');
      }
    });
  }

  loadReport(): void {
    this.isLoading = true;
    
    const filters: RedemptionReportFilters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.selectedCouponStatus !== null) {
      filters.couponStatus = this.selectedCouponStatus;
    }
    if (this.serviceCenterIdFilter !== null && this.serviceCenterIdFilter !== undefined) {
      filters.serviceCenterId = this.serviceCenterIdFilter;
    }
    
    // Extract dates from date range
    if (this.selectedRedemptionDateRange && this.selectedRedemptionDateRange.startDate) {
      filters.redemptionDateFrom = this.formatDateForApi(this.selectedRedemptionDateRange.startDate, true);
    }
    if (this.selectedRedemptionDateRange && this.selectedRedemptionDateRange.endDate) {
      filters.redemptionDateTo = this.formatDateForApi(this.selectedRedemptionDateRange.endDate, true);
    }

    this.reportService.getRedemptionReport(filters).subscribe({
      next: (response: RedemptionReportResponse) => {
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
        this.toastr.error('Error loading redemption report', 'Error');
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
    this.selectedCouponStatus = null;
    this.serviceCenterIdFilter = null;
    this.selectedRedemptionDateRange = '';
    this.currentPage = 1;
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

  onRedemptionDateRangeChange(event: any): void {
    if (event && event.startDate && event.endDate) {
      this.selectedRedemptionDateRange = {
        startDate: event.startDate,
        endDate: event.endDate
      };
    } else {
      this.selectedRedemptionDateRange = '';
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

