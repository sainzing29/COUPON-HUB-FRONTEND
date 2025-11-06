import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { CouponService, GenerateResponse } from '../service/coupon.service';
import { BatchService } from '../service/batch.service';

@Component({
  selector: 'app-generate-coupons',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './generate-coupons.component.html',
  styleUrls: ['./generate-coupons.component.scss']
})
export class GenerateCouponsComponent implements OnInit {
  couponForm!: FormGroup;
  isLoading = false;
  generatedBatch: GenerateResponse | null = null;
  showPreview = false;
  previewCodes: string[] = [];
  previewFrom = '';
  previewTo = '';
  isGenerating = false;
  isPrintedMarked = false;

  sequenceWidthOptions = [
    { value: 1, label: '1 (1)' },
    { value: 2, label: '2 (01)' },
    { value: 3, label: '3 (001)' },
    { value: 4, label: '4 (0001)' },
    { value: 5, label: '5 (00001)' },
    { value: 6, label: '6 (000001)' }
  ];

  constructor(
    private fb: FormBuilder,
    private couponService: CouponService,
    private batchService: BatchService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const currentDate = new Date();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const yearLastTwo = String(currentDate.getFullYear()).slice(-2);
    const defaultPeriod = `${month}${yearLastTwo}`; // Format: MMYY (e.g., "1225")
    const defaultBatchName = this.generateDefaultBatchName();

    this.couponForm = this.fb.group({
      prefix: [{ value: 'CES', disabled: true }, Validators.required],
      period: [{ value: defaultPeriod, disabled: true }, Validators.required],
      sequenceWidth: [{ value: 6, disabled: true }, Validators.required],
      quantity: [10, [Validators.required, Validators.min(10), Validators.max(5000)]],
      batchName: [defaultBatchName, [Validators.maxLength(100)]],
      notes: ['']
    });
  }

  private generateDefaultBatchName(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `Batch_${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  private generateRandomAlphanumeric(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }



  onPreview(): void {
    if (this.couponForm.invalid) {
      this.markFormGroupTouched();
      this.toastr.error('Please fill all required fields correctly', 'Validation Error');
      return;
    }

    const quantity = this.couponForm.get('quantity')?.value;
    if (quantity > 2000) {
      this.toastr.warning('For quantities > 2000, consider generating in multiple batches for better performance', 'Performance Warning');
    }

    // Generate preview codes locally
    const prefix = 'CES';
    const period = this.couponForm.get('period')?.value; // Already in MMYY format (e.g., "1225")
    const sequenceWidth = this.couponForm.get('sequenceWidth')?.value || 6;
    
    // Generate random alphanumeric codes
    const codesToShow = Math.min(10, quantity);
    this.previewCodes = [];
    
    for (let i = 0; i < codesToShow; i++) {
      const randomSuffix = this.generateRandomAlphanumeric(sequenceWidth);
      const couponCode = `${prefix}${period}${randomSuffix}`;
      this.previewCodes.push(couponCode);
    }
    
    // Set preview range examples (showing format, not actual range since codes are random)
    const exampleSuffix1 = this.generateRandomAlphanumeric(sequenceWidth);
    const exampleSuffix2 = this.generateRandomAlphanumeric(sequenceWidth);
    this.previewFrom = `${prefix}${period}${exampleSuffix1}`;
    this.previewTo = `${prefix}${period}${exampleSuffix2}`;
    
    this.showPreview = true;
  }

  onGenerate(): void {
    if (this.couponForm.invalid) {
      this.markFormGroupTouched();
      this.toastr.error('Please fill all required fields correctly', 'Validation Error');
      return;
    }

    const quantity = this.couponForm.get('quantity')?.value;
    if (quantity > 2000) {
      const confirmGenerate = confirm('Generating more than 2000 coupons may take some time. Do you want to continue?');
      if (!confirmGenerate) {
        return;
      }
    }

    this.isGenerating = true;
    const request = {
      prefix: 'CES',
      period: this.couponForm.get('period')?.value, // Already in MMYY format (e.g., "1225")
      sequenceWidth: this.couponForm.get('sequenceWidth')?.value || 6,
      quantity: this.couponForm.get('quantity')?.value,
      batchName: this.couponForm.get('batchName')?.value,
      notes: this.couponForm.get('notes')?.value
    };

    this.couponService.generateCoupons(request).subscribe({
      next: (response) => {
        console.log('Generate coupons response:', response);
        this.generatedBatch = response;
        this.isGenerating = false;
        this.showPreview = false;
        this.toastr.success('Coupons generated successfully!', 'Success');
        // Don't reset form here - let user download/copy codes first
        // Form will be reset when they close the batch summary
      },
      error: (error) => {
        console.error('Error generating coupons:', error);
        this.toastr.error(error.message || 'Error generating coupons', 'Error');
        this.isGenerating = false;
      }
    });
  }

  onDownloadCSV(): void {
    console.log('onDownloadCSV called');
    console.log('generatedBatch:', this.generatedBatch);
    
    if (!this.generatedBatch) {
      console.log('No generated batch available');
      return;
    }

    const csvContent = this.generateCSVContent();
    console.log('CSV Content generated, length:', csvContent.length);
    console.log('CSV Content:', csvContent);
    
    if (!csvContent) {
      console.log('CSV content is empty');
      this.toastr.warning('No coupon codes available to download', 'Warning');
      return;
    }

    console.log('Creating blob and downloading file...');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `coupons_batch_${this.generatedBatch.printBatchId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('Download initiated successfully');

    // Update batch status to 1 (Exported)
    this.updateBatchStatus(1);
  }

  onDownloadExcel(): void {
    console.log('onDownloadExcel called');
    console.log('generatedBatch:', this.generatedBatch);
    
    if (!this.generatedBatch) {
      console.log('No generated batch available');
      return;
    }

    // Excel can open CSV files directly
    // For true .xlsx format, consider using a library like xlsx or exceljs
    const csvContent = this.generateCSVContent();
    console.log('CSV Content generated, length:', csvContent.length);
    console.log('CSV Content:', csvContent);
    
    if (!csvContent) {
      console.log('CSV content is empty');
      this.toastr.warning('No coupon codes available to download', 'Warning');
      return;
    }

    console.log('Creating blob and downloading file...');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `coupons_batch_${this.generatedBatch.printBatchId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('Download initiated successfully');

    // Update batch status to 1 (Exported)
    this.updateBatchStatus(1);
  }

  private generateCSVContent(): string {
    console.log('generateCSVContent called');
    console.log('generatedBatch in generateCSVContent:', this.generatedBatch);
    
    if (!this.generatedBatch) {
      console.log('No generatedBatch, returning empty string');
      return '';
    }
    
    console.log('generatedBatch.coupons:', this.generatedBatch.coupons);
    console.log('Is coupons an array?', Array.isArray(this.generatedBatch.coupons));
    
    // Check if coupons array exists
    if (!this.generatedBatch.coupons || !Array.isArray(this.generatedBatch.coupons)) {
      console.error('Generated batch does not contain coupons array:', this.generatedBatch);
      console.error('coupons value:', this.generatedBatch.coupons);
      console.error('typeof coupons:', typeof this.generatedBatch.coupons);
      return '';
    }

    if (this.generatedBatch.coupons.length === 0) {
      console.warn('Coupons array is empty');
      return '';
    }

    console.log('Number of coupons:', this.generatedBatch.coupons.length);
    
    // Calculate range from first and last coupon
    const firstCoupon = this.generatedBatch.coupons[0].couponCode;
    const lastCoupon = this.generatedBatch.coupons[this.generatedBatch.coupons.length - 1].couponCode;
    const range = `${firstCoupon} - ${lastCoupon}`;
    
    // Get timestamp from first coupon or use current time
    const exportedAt = this.generatedBatch.coupons[0].createdAt || new Date().toISOString();
    const exportedBy = 'Admin'; // You can get this from auth service if available
    
    let csv = 'Batch ID,Coupon Code,Quantity,Created At\n';
    this.generatedBatch.coupons.forEach((coupon, index) => {
      console.log(`Processing coupon ${index + 1}:`, coupon);
      csv += `${this.generatedBatch!.printBatchId},${coupon.couponCode},${this.generatedBatch!.quantity},${coupon.createdAt}\n`;
    });
    console.log('CSV generation complete');
    return csv;
  }

  onCopyCodes(): void {
    if (!this.generatedBatch) return;

    // Check if coupons array exists
    if (!this.generatedBatch.coupons || !Array.isArray(this.generatedBatch.coupons)) {
      console.error('Generated batch does not contain coupons array:', this.generatedBatch);
      this.toastr.warning('No coupon codes available to copy', 'Warning');
      return;
    }

    // Extract coupon codes from coupon objects
    const codesText = this.generatedBatch.coupons.map(c => c.couponCode).join('\n');
    navigator.clipboard.writeText(codesText).then(() => {
      this.toastr.success(`${this.generatedBatch!.coupons.length} coupon codes copied to clipboard!`, 'Success');

      // Update batch status to 1 (Exported)
      this.updateBatchStatus(1);
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
      this.toastr.error('Error copying to clipboard', 'Error');
    });
  }

  closePreview(): void {
    this.showPreview = false;
    this.previewCodes = [];
    this.previewFrom = '';
    this.previewTo = '';
  }

  closeBatchSummary(): void {
    this.generatedBatch = null;
    this.isPrintedMarked = false;
    // Reset form for next generation
    this.initializeForm();
  }

  // Helper methods for displaying batch summary
  getBatchRange(): string {
    if (!this.generatedBatch || !this.generatedBatch.coupons || this.generatedBatch.coupons.length === 0) {
      return 'N/A';
    }
    const firstCoupon = this.generatedBatch.coupons[0].couponCode;
    const lastCoupon = this.generatedBatch.coupons[this.generatedBatch.coupons.length - 1].couponCode;
    return `${firstCoupon} - ${lastCoupon}`;
  }

  getBatchCreatedAt(): string {
    if (!this.generatedBatch || !this.generatedBatch.coupons || this.generatedBatch.coupons.length === 0) {
      return 'N/A';
    }
    return this.generatedBatch.coupons[0].createdAt || new Date().toISOString();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.couponForm.controls).forEach(key => {
      const control = this.couponForm.get(key);
      control?.markAsTouched();
    });
  }

  private updateBatchStatus(status: number): void {
    if (!this.generatedBatch || !this.generatedBatch.printBatchId) {
      this.toastr.error('No batch ID available to update status', 'Error');
      return;
    }

    // Only update if not already marked
    if (this.isPrintedMarked) {
      return;
    }

    this.batchService.updateBatchStatus(this.generatedBatch.printBatchId, status).subscribe({
      next: () => {
        this.isPrintedMarked = true;
      },
      error: (error) => {
        this.toastr.error(
          error?.error?.message || error?.message || 'Failed to update batch status',
          'Error'
        );
      }
    });
  }
}


