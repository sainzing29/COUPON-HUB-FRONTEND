import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { BatchService } from '../../service/batch.service';
import { BatchDetails, BatchStatus, BATCH_STATUS_COLORS, BATCH_STATUS_LABELS } from '../../model/batch.model';

@Component({
  selector: 'app-batch-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './batch-details.component.html',
  styleUrls: ['./batch-details.component.scss']
})
export class BatchDetailsComponent implements OnInit {
  batchDetails: BatchDetails | null = null;
  isLoading = false;
  isMarkingAsPrinted = false;
  BatchStatus = BatchStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private batchService: BatchService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadBatchDetails(+id);
    }
  }

  loadBatchDetails(id: number): void {
    this.isLoading = true;
    this.batchService.getBatchById(id).subscribe({
      next: (response) => {
        this.batchDetails = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading batch details:', error);
        this.toastr.error('Error loading batch details', 'Error');
        this.isLoading = false;
        this.router.navigate(['/organization/coupons/batches']);
      }
    });
  }

  getStatusColorClass(status: BatchStatus): string {
    return BATCH_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: BatchStatus): string {
    return BATCH_STATUS_LABELS[status] || 'Unknown';
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

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  onDownloadCSV(): void {
    if (!this.batchDetails || !this.batchDetails.coupons || this.batchDetails.coupons.length === 0) {
      this.toastr.warning('No coupon codes available to download', 'Warning');
      return;
    }

    const csvContent = this.generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `batch_${this.batchDetails.id}_coupons.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.toastr.success('CSV file downloaded successfully', 'Success');
  }

  onDownloadExcel(): void {
    if (!this.batchDetails || !this.batchDetails.coupons || this.batchDetails.coupons.length === 0) {
      this.toastr.warning('No coupon codes available to download', 'Warning');
      return;
    }

    const csvContent = this.generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `batch_${this.batchDetails.id}_coupons.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.toastr.success('Excel file downloaded successfully', 'Success');
  }

  private generateCSVContent(): string {
    if (!this.batchDetails || !this.batchDetails.coupons) {
      return '';
    }

    let csv = 'Coupon Code,Sequence Number,Total Services,Used Services,Status,Printed,Created At\n';
    this.batchDetails.coupons.forEach((coupon) => {
      csv += `${coupon.couponCode},${coupon.sequenceNumber},${coupon.totalServices},${coupon.usedServices},${coupon.status},${coupon.printed},${coupon.createdAt}\n`;
    });
    return csv;
  }

  onMarkAsPrinted(): void {
    if (!this.batchDetails) return;

    const confirmed = confirm('Are you sure you want to mark this batch as printed?');
    if (!confirmed) return;

    this.isMarkingAsPrinted = true;
    this.batchService.updateBatchStatus(this.batchDetails.id, BatchStatus.Printed).subscribe({
      next: () => {
        if (this.batchDetails) {
          this.batchDetails.status = BatchStatus.Printed;
        }
        this.isMarkingAsPrinted = false;
        this.toastr.success('Batch marked as printed successfully', 'Success');
      },
      error: (error) => {
        console.error('Error marking batch as printed:', error);
        this.isMarkingAsPrinted = false;
        this.toastr.error(
          error?.error?.message || error?.message || 'Failed to mark batch as printed',
          'Error'
        );
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/organization/coupons/batches']);
  }

  canShowExportButtons(): boolean {
    return this.batchDetails?.status !== BatchStatus.Printed;
  }

  canShowMarkAsPrinted(): boolean {
    return this.batchDetails?.status !== BatchStatus.Printed;
  }
}

