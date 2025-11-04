import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../service/batch.service';
import { Batch, BatchStatus, BATCH_STATUS_COLORS, BATCH_STATUS_LABELS } from '../model/batch.model';

@Component({
  selector: 'app-batches',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './batches.component.html',
  styleUrls: ['./batches.component.scss']
})
export class BatchesComponent implements OnInit {
  batches: Batch[] = [];
  filteredBatches: Batch[] = [];
  paginatedBatches: Batch[] = [];
  isLoading = false;
  selectedStatus: string | number = 'all';
  searchTerm: string = '';

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Status configuration
  statusColors = BATCH_STATUS_COLORS;
  statusLabels = BATCH_STATUS_LABELS;
  BatchStatus = BatchStatus; // Expose enum to template
  
  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: BatchStatus.Generated, label: 'Generated' },
    { value: BatchStatus.Exported, label: 'Exported' },
    { value: BatchStatus.Delivered, label: 'Delivered' },
    { value: BatchStatus.Cancelled, label: 'Cancelled' }
  ];

  constructor(
    private batchService: BatchService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBatches();
  }

  loadBatches(): void {
    this.isLoading = true;
    this.batchService.getBatches().subscribe({
      next: (response) => {
        console.log('Batches loaded:', response);
        this.batches = response;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading batches:', error);
        this.snackBar.open('Error loading batches', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        this.batches = [];
        this.filteredBatches = [];
        this.updatePagination();
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.batches];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      const statusValue = typeof this.selectedStatus === 'string' 
        ? parseInt(this.selectedStatus, 10) 
        : this.selectedStatus;
      filtered = filtered.filter(batch => batch.status === statusValue);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(batch =>
        batch.prefix.toLowerCase().includes(term) ||
        batch.period.toLowerCase().includes(term) ||
        batch.id.toString().includes(term)
      );
    }

    this.filteredBatches = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  updateBatchStatus(batch: Batch, newStatus: BatchStatus | string | number): void {
    // Convert to number if it's a string (from select dropdown)
    const statusValue: BatchStatus = typeof newStatus === 'string' 
      ? parseInt(newStatus, 10) as BatchStatus 
      : newStatus as BatchStatus;
    
    this.batchService.updateBatchStatus(batch.id, statusValue).subscribe({
      next: () => {
        batch.status = statusValue;
        this.snackBar.open('Batch status updated successfully', 'Close', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        // Note: Don't call applyFilters() here as it would reset filters
        // Just update pagination to reflect the change
        this.updatePagination();
      },
      error: (error) => {
        console.error('Error updating batch status:', error);
        this.snackBar.open('Error updating batch status', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  deleteBatch(batch: Batch): void {
    const confirmed = confirm(`Are you sure you want to delete batch #${batch.id}?`);
    if (!confirmed) return;

    this.batchService.deleteBatch(batch.id).subscribe({
      next: () => {
        this.batches = this.batches.filter(b => b.id !== batch.id);
        this.filteredBatches = this.filteredBatches.filter(b => b.id !== batch.id);
        this.updatePagination();
        this.snackBar.open('Batch deleted successfully', 'Close', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Error deleting batch:', error);
        this.snackBar.open('Error deleting batch', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  getStatusColorClass(status: BatchStatus): string {
    return this.statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  formatPeriod(period: string): string {
    // Convert "MMYY" format to readable format
    // Example: "1125" becomes "Nov 2025"
    if (period.length === 4) {
      const month = parseInt(period.substring(0, 2), 10);
      const year = parseInt('20' + period.substring(2, 4), 10);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[month - 1]} ${year}`;
    }
    return period;
  }

  // Helper methods for counting batches by status
  getGeneratedCount(): number {
    return this.batches.filter(b => b.status === BatchStatus.Generated).length;
  }

  getExportedCount(): number {
    return this.batches.filter(b => b.status === BatchStatus.Exported).length;
  }

  getDeliveredCount(): number {
    return this.batches.filter(b => b.status === BatchStatus.Delivered).length;
  }

  getCancelledCount(): number {
    return this.batches.filter(b => b.status === BatchStatus.Cancelled).length;
  }

  // Helper method to get status label for display
  getStatusLabel(status: BatchStatus): string {
    return BATCH_STATUS_LABELS[status] || 'Unknown';
  }

  // Pagination methods
  updatePagination(): void {
    this.totalItems = this.filteredBatches.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedBatches = this.filteredBatches.slice(startIndex, endIndex);
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

