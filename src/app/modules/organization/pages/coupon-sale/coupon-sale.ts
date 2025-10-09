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
  otpForm: FormGroup;
  couponCode: string = '';
  isSubmitting = false;
  showToast = false;
  currentStep: 'otp' | 'sale' = 'otp';
  otpSent = false;
  otpVerified = false;
  mobileNumber: string = '';

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private route: ActivatedRoute
  ) {
    this.otpForm = this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });

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

  // OTP Verification Methods
  sendOtp(): void {
    if (this.otpForm.get('mobile')?.valid) {
      this.mobileNumber = this.otpForm.get('mobile')?.value;
      this.otpSent = true;
      
      // Simulate OTP sending
      console.log(`OTP sent to ${this.mobileNumber}`);
    } else {
      this.otpForm.get('mobile')?.markAsTouched();
    }
  }

  verifyOtp(): void {
    if (this.otpForm.get('otp')?.valid) {
      // Accept any 6-digit number for verification
      this.otpVerified = true;
      this.currentStep = 'sale';
      
      // Pre-fill mobile number in sale form
      this.saleForm.patchValue({
        mobile: this.mobileNumber
      });
    } else {
      this.otpForm.get('otp')?.markAsTouched();
    }
  }

  resendOtp(): void {
    this.otpForm.get('otp')?.setValue('');
    
    // Simulate OTP resending
    console.log(`OTP resent to ${this.mobileNumber}`);
  }

  goBackToOtp(): void {
    this.currentStep = 'otp';
    this.otpSent = false;
    this.otpVerified = false;
    this.otpForm.get('otp')?.setValue('');
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

  // OTP Form Controls
  get otpMobileControl() {
    return this.otpForm.get('mobile');
  }

  get otpCodeControl() {
    return this.otpForm.get('otp');
  }
}