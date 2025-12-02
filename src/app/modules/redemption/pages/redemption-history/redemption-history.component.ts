import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CouponRedemptionService } from '../../services/coupon-redemption.service';
import { RedemptionHistory } from '../../models/coupon-redemption.model';

@Component({
  selector: 'app-redemption-history',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './redemption-history.component.html',
  styleUrls: ['./redemption-history.component.scss']
})
export class RedemptionHistoryComponent implements OnInit {
  redemptions: RedemptionHistory[] = [];
  filteredRedemptions: RedemptionHistory[] = [];
  paginatedRedemptions: RedemptionHistory[] = [];
  isLoading = false;
  searchTerm: string = '';

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  constructor(
    private couponRedemptionService: CouponRedemptionService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRedemptions();
  }

  loadRedemptions(): void {
    this.isLoading = true;
    this.couponRedemptionService.getRedemptionHistory().subscribe({
      next: (response) => {
        this.redemptions = response;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading redemption history:', error);
        this.toastr.error('Error loading redemption history', 'Error');
        this.redemptions = [];
        this.filteredRedemptions = [];
        this.updatePagination();
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.redemptions];

    // Filter by search term (customer name, phone, email, coupon number, date)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(redemption =>
        redemption.customerName.toLowerCase().includes(term) ||
        redemption.couponCode.toLowerCase().includes(term) ||
        redemption.productName.toLowerCase().includes(term) ||
        redemption.serviceCenterName.toLowerCase().includes(term) ||
        this.formatDate(redemption.redemptionDate).toLowerCase().includes(term) ||
        redemption.id.toString().includes(term)
      );
    }

    this.filteredRedemptions = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  onSearchChange(): void {
    this.applyFilters();
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
  updatePagination(): void {
    this.totalItems = this.filteredRedemptions.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRedemptions = this.filteredRedemptions.slice(startIndex, endIndex);
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

