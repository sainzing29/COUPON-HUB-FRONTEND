import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CouponService, GenerateResponse } from './coupon.service';

@Component({
  selector: 'app-generate-coupons',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
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
  isLoadingNextSequence = false;
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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadNextSequence();
    this.setupFormListeners();
  }

  private initializeForm(): void {
    const currentDate = new Date();
    const defaultPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const defaultBatchName = this.generateDefaultBatchName();

    this.couponForm = this.fb.group({
      prefix: [{ value: 'CES', disabled: true }, Validators.required],
      period: [defaultPeriod, Validators.required],
      sequenceWidth: [{ value: 4, disabled: true }, Validators.required],
      quantity: [10, [Validators.required, Validators.min(10), Validators.max(5000)]],
      startFrom: [{ value: '', disabled: true }],
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

  private setupFormListeners(): void {
    // Reload next sequence when period changes
    this.couponForm.get('period')?.valueChanges.subscribe(() => {
      this.loadNextSequence();
    });
  }

  private loadNextSequence(): void {
    const prefix = 'CES';
    const period = this.couponForm.get('period')?.value;

    if (!period) {
      return;
    }

    this.isLoadingNextSequence = true;
    this.couponService.getNextSequence(prefix, period).subscribe({
      next: (response) => {
        this.couponForm.patchValue({
          startFrom: response.nextSequence
        });
        this.isLoadingNextSequence = false;
      },
      error: (error) => {
        console.error('Error loading next sequence:', error);
        this.snackBar.open('Error loading next sequence', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        this.isLoadingNextSequence = false;
      }
    });
  }

  onPreview(): void {
    if (this.couponForm.invalid) {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      return;
    }

    const quantity = this.couponForm.get('quantity')?.value;
    if (quantity > 2000) {
      this.snackBar.open('For quantities > 2000, consider generating in multiple batches for better performance', 'Close', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }

    // Generate preview codes locally
    const prefix = 'CES';
    const period = this.couponForm.get('period')?.value.replace('-', '').substring(2); // Convert "2025-11" to "2511"
    const startFrom = this.couponForm.get('startFrom')?.value;
    
    // Extract the numeric sequence from startFrom (last 4 digits)
    const startSequence = parseInt(startFrom.toString().slice(-4), 10);
    
    // Generate codes
    const codesToShow = Math.min(10, quantity);
    this.previewCodes = [];
    
    for (let i = 0; i < codesToShow; i++) {
      const sequence = (startSequence + i).toString().padStart(4, '0');
      const couponCode = `${prefix}${period}${sequence}`;
      this.previewCodes.push(couponCode);
    }
    
    // Set preview range
    const lastSequence = (startSequence + quantity - 1).toString().padStart(4, '0');
    this.previewFrom = `${prefix}${period}${startSequence.toString().padStart(4, '0')}`;
    this.previewTo = `${prefix}${period}${lastSequence}`;
    
    this.showPreview = true;
  }

  onGenerate(): void {
    if (this.couponForm.invalid) {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
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
      period: this.couponForm.get('period')?.value,
      sequenceWidth: 4,
      quantity: this.couponForm.get('quantity')?.value,
      startFrom: this.couponForm.get('startFrom')?.value,
      batchName: this.couponForm.get('batchName')?.value,
      notes: this.couponForm.get('notes')?.value
    };

    this.couponService.generateCoupons(request).subscribe({
      next: (response) => {
        this.generatedBatch = response;
        this.isGenerating = false;
        this.showPreview = false;
        this.snackBar.open('Coupons generated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        // Reset form for next generation
        this.initializeForm();
        this.loadNextSequence();
      },
      error: (error) => {
        console.error('Error generating coupons:', error);
        this.snackBar.open(error.message || 'Error generating coupons', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        this.isGenerating = false;
      }
    });
  }

  onDownloadCSV(): void {
    if (!this.generatedBatch) return;

    const csvContent = this.generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `coupons_batch_${this.generatedBatch.batchId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onDownloadExcel(): void {
    if (!this.generatedBatch) return;

    // For Excel, we'll use CSV format with .xlsx extension
    // In a real application, you might want to use a library like xlsx
    const csvContent = this.generateCSVContent();
    const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `coupons_batch_${this.generatedBatch.batchId}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private generateCSVContent(): string {
    if (!this.generatedBatch) return '';

    let csv = 'Batch ID,Coupon Code,Range,Quantity,Exported By,Exported At\n';
    this.generatedBatch.codes.forEach(code => {
      csv += `${this.generatedBatch!.batchId},${code},${this.generatedBatch!.range},${this.generatedBatch!.quantity},${this.generatedBatch!.exportedBy},${this.generatedBatch!.exportedAt}\n`;
    });
    return csv;
  }

  onCopyCodes(): void {
    if (!this.generatedBatch) return;

    const codesText = this.generatedBatch.codes.join('\n');
    navigator.clipboard.writeText(codesText).then(() => {
      this.snackBar.open('Coupon codes copied to clipboard!', 'Close', {
        duration: 2000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
      this.snackBar.open('Error copying to clipboard', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    });
  }

  onMarkPrinted(): void {
    if (!this.generatedBatch) return;

    const request = { batchId: this.generatedBatch.batchId };
    this.couponService.markPrinted(request).subscribe({
      next: () => {
        this.isPrintedMarked = true;
        this.snackBar.open('Batch marked as printed successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Error marking as printed:', error);
        this.snackBar.open('Error marking batch as printed', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
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
  }

  private markFormGroupTouched(): void {
    Object.keys(this.couponForm.controls).forEach(key => {
      const control = this.couponForm.get(key);
      control?.markAsTouched();
    });
  }
}

