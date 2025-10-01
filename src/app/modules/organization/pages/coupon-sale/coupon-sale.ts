import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-coupon-sale',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './coupon-sale.html',
  styleUrls: ['./coupon-sale.scss']
})
export class CouponSaleComponent implements OnInit {
  saleForm: FormGroup;
  couponCode: string = '';
  isSubmitting = false;
  showToast = false;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private route: ActivatedRoute
  ) {
    this.saleForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerEmail: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      amount: ['99 AED']
    });
  }

  ngOnInit(): void {
    // Get coupon code from route parameters or query params
    this.route.queryParams.subscribe(params => {
      this.couponCode = params['couponCode'] || 'COUPON001';
    });
  }

  submitSale(): void {
    if (this.saleForm.valid) {
      this.isSubmitting = true;
      
      // Simulate API call with 2-second delay
      setTimeout(() => {
        this.isSubmitting = false;
        this.showSuccessToast();
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.saleForm.controls).forEach(key => {
      const control = this.saleForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccessToast(): void {
    this.showToast = true;
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      this.showToast = false;
      // Navigate back after toast is shown
      setTimeout(() => {
        this.goBack();
      }, 500);
    }, 3000);
  }

  goBack(): void {
    this.location.back();
  }

  // Getter for form validation
  get customerNameControl() {
    return this.saleForm.get('customerName');
  }

  get customerEmailControl() {
    return this.saleForm.get('customerEmail');
  }

  get mobileControl() {
    return this.saleForm.get('mobile');
  }
}