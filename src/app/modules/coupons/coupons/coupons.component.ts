import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CouponService } from '../service/coupon.service';
import { Coupon } from '../model/coupon.model';

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
  filteredCoupons: Coupon[] = [];
  paginatedCoupons: Coupon[] = [];
  isLoading = false;
  searchTerm: string = '';
  selectedStatus: string = 'all';

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Unassigned', label: 'Unassigned' },
    { value: 'Assigned', label: 'Assigned' },
    { value: 'Used', label: 'Used' }
  ];

  constructor(
    private couponService: CouponService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.isLoading = true;
    this.couponService.getCoupons().subscribe({
      next: (response) => {
        this.coupons = response;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading coupons:', error);
        this.toastr.error('Error loading coupons', 'Error');
        this.coupons = [];
        this.filteredCoupons = [];
        this.updatePagination();
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.coupons];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(coupon => coupon.status === this.selectedStatus);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(coupon =>
        coupon.couponCode.toLowerCase().includes(term) ||
        coupon.prefix.toLowerCase().includes(term) ||
        coupon.period.toLowerCase().includes(term) ||
        coupon.id.toString().includes(term)
      );
    }

    this.filteredCoupons = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  getStatusColorClass(status: string): string {
    switch (status) {
      case 'Unassigned':
        return 'bg-gray-100 text-gray-800';
      case 'Assigned':
        return 'bg-blue-100 text-blue-800';
      case 'Used':
        return 'bg-green-100 text-green-800';
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
  updatePagination(): void {
    this.totalItems = this.filteredCoupons.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedCoupons = this.filteredCoupons.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
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

