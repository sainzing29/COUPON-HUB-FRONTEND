import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { CouponSchemeService } from '../service/coupon-scheme.service';
import { CouponScheme } from '../model/coupon-scheme.model';

@Component({
  selector: 'app-coupon-schemes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './coupon-schemes.component.html',
  styleUrls: ['./coupon-schemes.component.scss'],
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
export class CouponSchemesComponent implements OnInit {
  schemes: CouponScheme[] = [];
  filteredSchemes: CouponScheme[] = [];
  paginatedSchemes: CouponScheme[] = [];
  isLoading = false;

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  searchForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private couponSchemeService: CouponSchemeService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadSchemes();
    this.setupSearch();
  }

  loadSchemes(): void {
    this.isLoading = true;
    this.couponSchemeService.getCouponSchemes().subscribe({
      next: (schemes) => {
        this.schemes = schemes;
        this.filteredSchemes = [...schemes];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading coupon schemes:', error);
        this.toastr.error('Error loading coupon schemes', 'Error');
        this.schemes = [];
        this.filteredSchemes = [];
        this.updatePagination();
        this.isLoading = false;
      }
    });
  }

  private setupSearch(): void {
    this.searchForm.get('search')?.valueChanges.subscribe(value => {
      const searchTerm = value.trim().toLowerCase();
      if (searchTerm) {
        this.filteredSchemes = this.schemes.filter(scheme => 
          scheme.name.toLowerCase().includes(searchTerm) ||
          scheme.description.toLowerCase().includes(searchTerm) ||
          scheme.price.toString().includes(searchTerm)
        );
      } else {
        this.filteredSchemes = [...this.schemes];
      }
      this.currentPage = 1;
      this.updatePagination();
    });
  }

  onAddScheme(): void {
    this.router.navigate(['/organization/coupons/coupon-schemes/new']);
  }

  onEditScheme(scheme: CouponScheme): void {
    this.router.navigate([`/organization/coupons/coupon-schemes/${scheme.id}`]);
  }

  onDeleteScheme(scheme: CouponScheme): void {
    if (confirm(`Are you sure you want to delete "${scheme.name}"?`)) {
      this.couponSchemeService.deleteCouponScheme(scheme.id).subscribe({
        next: () => {
          this.toastr.success('Coupon scheme deleted successfully', 'Success');
          this.loadSchemes();
        },
        error: (error) => {
          console.error('Error deleting coupon scheme:', error);
          this.toastr.error('Error deleting coupon scheme', 'Error');
        }
      });
    }
  }

  onToggleActive(scheme: CouponScheme): void {
    const action = scheme.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} "${scheme.name}"?`)) {
      this.couponSchemeService.toggleCouponSchemeActive(scheme.id).subscribe({
        next: (updatedScheme) => {
          const index = this.schemes.findIndex(s => s.id === scheme.id);
          if (index > -1) {
            this.schemes[index] = updatedScheme;
            this.filteredSchemes = [...this.schemes];
            this.updatePagination();
          }
          this.toastr.success(`Coupon scheme ${action}d successfully`, 'Success');
        },
        error: (error) => {
          console.error('Error toggling coupon scheme status:', error);
          this.toastr.error('Error updating coupon scheme status', 'Error');
        }
      });
    }
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  // Pagination methods
  updatePagination(): void {
    this.totalItems = this.filteredSchemes.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedSchemes = this.filteredSchemes.slice(startIndex, endIndex);
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

