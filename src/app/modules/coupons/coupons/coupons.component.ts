import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CouponService } from '../service/coupon.service';
import { Coupon, CouponsResponse } from '../model/coupon.model';

interface StatusOption {
  value: string;
  label: string;
  statusNumber: number | null;
}

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.scss']
})
export class CouponsComponent implements OnInit {
  coupons: Coupon[] = [];
  paginatedCoupons: Coupon[] = [];
  isLoading = false;
  searchTerm: string = '';
  selectedStatus: string = 'all';
  periodFilter: string = '';
  selectedMonth: string = '';
  selectedYear: string = '';
  private searchTimeout: any;

  // Pagination properties
  currentPage = 1;
  pageSize = 50;
  totalItems = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  statusOptions: StatusOption[] = [
    { value: 'all', label: 'All Statuses', statusNumber: null },
    { value: 'Unassigned', label: 'Unassigned', statusNumber: 0 },
    { value: 'Active', label: 'Active', statusNumber: 1 },
    { value: 'Completed', label: 'Completed', statusNumber: 2 },
    { value: 'Expired', label: 'Expired', statusNumber: 3 }
  ];

  monthOptions: { value: string; label: string; number: string }[] = [
    { value: '', label: 'Month', number: '' },
    { value: 'Jan', label: 'January', number: '01' },
    { value: 'Feb', label: 'February', number: '02' },
    { value: 'Mar', label: 'March', number: '03' },
    { value: 'Apr', label: 'April', number: '04' },
    { value: 'May', label: 'May', number: '05' },
    { value: 'Jun', label: 'June', number: '06' },
    { value: 'Jul', label: 'July', number: '07' },
    { value: 'Aug', label: 'August', number: '08' },
    { value: 'Sep', label: 'September', number: '09' },
    { value: 'Oct', label: 'October', number: '10' },
    { value: 'Nov', label: 'November', number: '11' },
    { value: 'Dec', label: 'December', number: '12' }
  ];

  yearOptions: number[] = [];

  constructor(
    private couponService: CouponService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeYearOptions();
    this.loadCoupons();
    this.setupSearch();
  }

  private initializeYearOptions(): void {
    for (let year = 2025; year <= 2100; year++) {
      this.yearOptions.push(year);
    }
  }

  private setupSearch(): void {
    // Search debouncing is handled in onSearchChange method
  }

  loadCoupons(): void {
    this.isLoading = true;
    const searchText = this.searchTerm?.trim() || '';
    
    const params: any = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };
    
    if (searchText) {
      params.searchText = searchText;
    }
    
    // Map status string to status number
    if (this.selectedStatus !== 'all') {
      const statusOption = this.statusOptions.find(opt => opt.value === this.selectedStatus);
      if (statusOption && statusOption.statusNumber !== null) {
        params.status = statusOption.statusNumber;
      }
    }
    
    // Build period from month and year selectors
    const periodValue = this.buildPeriodValue();
    if (periodValue) {
      params.period = periodValue;
    }
    
    this.couponService.getCouponsWithPagination(params).subscribe({
      next: (response: CouponsResponse) => {
        this.coupons = response.items;
        this.paginatedCoupons = response.items;
        this.totalItems = response.totalCount;
        this.totalPages = response.totalPages;
        this.currentPage = response.pageNumber;
        this.hasPreviousPage = response.hasPreviousPage;
        this.hasNextPage = response.hasNextPage;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading coupons:', error);
        this.toastr.error('Error loading coupons', 'Error');
        this.coupons = [];
        this.paginatedCoupons = [];
        this.totalItems = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadCoupons();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onPeriodFilterChange(): void {
    this.applyFilters();
  }

  onMonthChange(): void {
    this.applyFilters();
  }

  onYearChange(): void {
    this.applyFilters();
  }

  buildPeriodValue(): string {
    const monthOption = this.monthOptions.find(m => m.value === this.selectedMonth);
    const monthNumber = monthOption?.number || '';
    const yearLastTwo = this.selectedYear ? this.selectedYear.slice(-2) : '';

    if (monthNumber && yearLastTwo) {
      // Both month and year: "1225"
      return monthNumber + yearLastTwo;
    } else if (yearLastTwo) {
      // Only year: "25"
      return yearLastTwo;
    } else if (monthNumber) {
      // Only month: "12"
      return monthNumber;
    }
    return '';
  }

  onSearchChange(): void {
    // Debounce search to avoid too many API calls
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadCoupons();
    }, 500);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.periodFilter = '';
    this.selectedMonth = '';
    this.selectedYear = '';
    this.currentPage = 1;
    this.loadCoupons();
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

  formatPeriod(period: string): string {
    if (period.length === 4) {
      const month = parseInt(period.substring(0, 2), 10);
      const year = parseInt('20' + period.substring(2, 4), 10);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[month - 1]} ${year}`;
    }
    return period;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadCoupons();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCoupons();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCoupons();
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

