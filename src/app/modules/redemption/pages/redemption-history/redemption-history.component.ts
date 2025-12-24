import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { NgxDaterangepickerBootstrapDirective, NgxDaterangepickerLocaleService } from 'ngx-daterangepicker-bootstrap';
import { CouponRedemptionService } from '../../services/coupon-redemption.service';
import { RedemptionHistory, RedemptionHistoryResponse } from '../../models/coupon-redemption.model';

@Component({
  selector: 'app-redemption-history',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    NgxDaterangepickerBootstrapDirective
  ],
  templateUrl: './redemption-history.component.html',
  styleUrls: ['./redemption-history.component.scss']
})
export class RedemptionHistoryComponent implements OnInit, AfterViewInit {
  redemptions: RedemptionHistory[] = [];
  paginatedRedemptions: RedemptionHistory[] = [];
  isLoading = false;
  searchTerm: string = '';
  selectedRedemptionDateRange: any = '';
  private searchTimeout: any;

  // Pagination properties
  currentPage = 1;
  pageSize = 50;
  totalItems = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  @ViewChild('redemptionDateRangeInput', { static: false }) redemptionDateRangeInput!: ElementRef<HTMLInputElement>;

  constructor(
    private couponRedemptionService: CouponRedemptionService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRedemptions();
    this.setupSearch();
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

  private setupSearch(): void {
    // Search debouncing is handled in onSearchChange method
  }

  loadRedemptions(): void {
    this.isLoading = true;
    const searchText = this.searchTerm?.trim() || '';
    
    const params: any = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };
    
    if (searchText) {
      params.searchText = searchText;
    }
    
    // Extract dates from date range
    if (this.selectedRedemptionDateRange && this.selectedRedemptionDateRange.startDate) {
      params.redemptionDateFrom = this.formatDateForApi(this.selectedRedemptionDateRange.startDate, false);
    }
    if (this.selectedRedemptionDateRange && this.selectedRedemptionDateRange.endDate) {
      params.redemptionDateTo = this.formatDateForApi(this.selectedRedemptionDateRange.endDate, false);
    }
    
    this.couponRedemptionService.getRedemptionHistory(params).subscribe({
      next: (response: RedemptionHistoryResponse) => {
        this.redemptions = response.items;
        this.paginatedRedemptions = response.items;
        this.totalItems = response.totalCount;
        this.totalPages = response.totalPages;
        this.currentPage = response.pageNumber;
        this.hasPreviousPage = response.hasPreviousPage;
        this.hasNextPage = response.hasNextPage;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading redemption history:', error);
        this.toastr.error('Error loading redemption history', 'Error');
        this.redemptions = [];
        this.paginatedRedemptions = [];
        this.totalItems = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadRedemptions();
  }

  onSearchChange(): void {
    // Debounce search to avoid too many API calls
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadRedemptions();
    }, 500);
  }

  onRedemptionDateRangeChange(event: any): void {
    // Match the pattern from coupon-generation-report component
    if (event && event.startDate && event.endDate) {
      this.selectedRedemptionDateRange = {
        startDate: event.startDate,
        endDate: event.endDate
      };
      this.applyFilters();
    } else {
      // If event doesn't have both dates, clear the date range
      this.selectedRedemptionDateRange = '';
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    // Set the model to empty string (matching coupon-generation-report component)
    this.selectedRedemptionDateRange = '';
    this.currentPage = 1;
    this.loadRedemptions();
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

  getStatusLabel(status: number): string {
    return status === 0 ? 'Redeemed' : 'Cancelled';
  }

  getStatusColorClass(status: number): string {
    return status === 0 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  }

  viewRedemption(redemption: RedemptionHistory): void {
    this.router.navigate(['/organization/redemption/redemptions', redemption.id]);
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadRedemptions();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadRedemptions();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRedemptions();
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

