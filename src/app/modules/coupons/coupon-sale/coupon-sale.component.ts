import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CouponSaleService, InvoiceDetails } from '../service/coupon-sale.service';
import { CouponSchemeService } from '../service/coupon-scheme.service';
import { CouponService } from '../service/coupon.service';
import { CouponScheme } from '../model/coupon-scheme.model';
import { CouponValidationResponse, CreateInvoiceResponse } from '../model/coupon-sale.model';
import { ToastrService } from 'ngx-toastr';
import { CountryCodeSelectorComponent } from '../../organization/components/country-code-selector/country-code-selector.component';

type Step = 'verify' | 'otp' | 'coupon' | 'details' | 'verify-details' | 'invoice';
type VerificationMethod = 'email' | 'phone';
type PaymentMethod = 'Cash' | 'Card' | 'UPI';

@Component({
  selector: 'app-coupon-sale',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CountryCodeSelectorComponent],
  templateUrl: './coupon-sale.component.html',
  styleUrls: ['./coupon-sale.component.scss']
})
export class CouponSaleComponent implements OnInit, OnDestroy {
  currentStep: Step = 'verify';
  verificationMethod: VerificationMethod = 'email';
  
  // Step 1: Verify Form
  verifyForm: FormGroup;
  isSendingOtp = false;
  
  // Step 2: OTP Form
  otpForm: FormGroup;
  otpSent = false;
  otpVerified = false;
  resendTimer: number = 0; // in seconds
  resendTimerInterval: any;
  canResend = false;
  
  // Step 3: Coupon Code Form
  couponForm: FormGroup;
  couponCode1: string = '';
  couponCode2: string = '';
  couponCode3: string = '';
  couponValidationResponse: CouponValidationResponse | null = null;
  isValidatingCoupon = false;
  
  // Step 4: Customer Details Form
  customerDetailsForm: FormGroup;
  couponSchemes: CouponScheme[] = [];
  selectedScheme: CouponScheme | null = null;
  isSubmitting = false;
  selectedCountryCode: string = '+971'; // Default to UAE
  
  // Step 5: Verify Details Form
  verifyDetailsForm: FormGroup;
  
  // Step 6: Invoice
  invoiceDetails: InvoiceDetails | null = null;
  
  // Common
  verifiedEmail: string = '';
  verifiedPhone: string = '';
  validatedCouponId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private couponSaleService: CouponSaleService,
    private couponSchemeService: CouponSchemeService,
    private couponService: CouponService,
    private toastr: ToastrService
  ) {
    // Initialize verify form
    this.verifyForm = this.fb.group({
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]]
    });

    // Initialize OTP form
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });

    // Initialize coupon form
    this.couponForm = this.fb.group({
      couponCode1: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{4}$/)]],
      couponCode2: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{4}$/)]],
      couponCode3: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{5}$/)]]
    });

    // Initialize customer details form
    this.customerDetailsForm = this.fb.group({
      FirstName: ['', [Validators.required, Validators.minLength(2)]],
      LastName: ['', [Validators.required, Validators.minLength(2)]],
      Email: ['', [Validators.required, Validators.email]],
      MobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      countryCode: ['+971', [Validators.required]],
      SchemeId: ['', [Validators.required]]
    });

    // Initialize verify details form
    this.verifyDetailsForm = this.fb.group({
      PaymentMethod: ['', [Validators.required]]
    });

    // Update validators based on verification method
    this.updateVerificationValidators();
  }

  ngOnInit(): void {
    this.loadCouponSchemes();
  }

  ngOnDestroy(): void {
    if (this.resendTimerInterval) {
      clearInterval(this.resendTimerInterval);
    }
  }

  // Load coupon schemes for step 3
  loadCouponSchemes(): void {
    this.couponSchemeService.getCouponSchemes().subscribe({
      next: (schemes) => {
        // Show all schemes (remove filter to show all, or filter only active: schemes.filter(s => s.isActive))
        this.couponSchemes = schemes;
        console.log('Loaded coupon schemes:', this.couponSchemes);
      },
      error: (error) => {
        console.error('Error loading coupon schemes:', error);
        this.toastr.error('Failed to load coupon schemes', 'Error');
      }
    });
  }

  // Step 1: Verification Method Selection
  onVerificationMethodChange(): void {
    this.updateVerificationValidators();
    this.verifyForm.patchValue({
      email: '',
      phone: ''
    });
  }

  updateVerificationValidators(): void {
    const emailControl = this.verifyForm.get('email');
    const phoneControl = this.verifyForm.get('phone');

    if (this.verificationMethod === 'email') {
      emailControl?.setValidators([Validators.required, Validators.email]);
      phoneControl?.clearValidators();
    } else {
      emailControl?.clearValidators();
      phoneControl?.setValidators([Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]);
    }

    emailControl?.updateValueAndValidity();
    phoneControl?.updateValueAndValidity();
  }

  // Step 1: Send OTP
  sendOtp(): void {
    if (this.verifyForm.invalid) {
      this.markFormGroupTouched(this.verifyForm);
      return;
    }

    this.isSendingOtp = true;
    const email = this.verifyForm.get('email')?.value;
    const phone = this.verifyForm.get('phone')?.value;

    const request = this.verificationMethod === 'email' 
      ? this.couponSaleService.sendOtpToEmail(email)
      : this.couponSaleService.sendOtpToPhone(phone);

    request.subscribe({
      next: (response) => {
        this.isSendingOtp = false;
        if (response.success) {
          this.otpSent = true;
          this.currentStep = 'otp';
          if (this.verificationMethod === 'email') {
            this.verifiedEmail = email;
          } else {
            this.verifiedPhone = phone;
          }
          this.startResendTimer();
          this.toastr.success('OTP sent successfully', 'Success');
        } else {
          this.toastr.error(response.message || 'Failed to send OTP', 'Error');
        }
      },
      error: (error) => {
        this.isSendingOtp = false;
        console.error('Error sending OTP:', error);
        if(error.message) {
          this.toastr.error(error.message, 'Error');
        } else {
          this.toastr.error('Failed to send OTP. Please try again.', 'Error');
        }
      }
    });
  }

  // Step 2: Verify OTP
  verifyOtp(): void {
    if (this.otpForm.invalid) {
      this.markFormGroupTouched(this.otpForm);
      return;
    }

    const otp = this.otpForm.get('otp')?.value;
    const request = this.verificationMethod === 'email'
      ? this.couponSaleService.verifyEmailOtp(this.verifiedEmail, otp)
      : this.couponSaleService.verifyPhoneOtp(this.verifiedPhone, otp);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.otpVerified = true;
          this.currentStep = 'coupon';
          this.toastr.success('OTP verified successfully', 'Success');
          // Pre-fill customer details form
          if (this.verificationMethod === 'email') {
            this.customerDetailsForm.patchValue({
              Email: this.verifiedEmail
            });
          } else {
            // Extract country code and phone number
            const phoneWithCode = this.verifiedPhone.trim();
            // Try to match country code (common patterns: +971, +966, etc.)
            const countryCodeMatch = phoneWithCode.match(/^(\+\d{1,4})/);
            if (countryCodeMatch) {
              const countryCode = countryCodeMatch[1];
              const phoneNumber = phoneWithCode.replace(countryCode, '').trim();
              this.customerDetailsForm.patchValue({
                countryCode: countryCode,
                MobileNumber: phoneNumber
              });
              this.selectedCountryCode = countryCode;
            } else {
              // If no country code found, use default and assume full number is mobile
              const phoneNumber = phoneWithCode.replace(/^\+?/, '');
              this.customerDetailsForm.patchValue({
                MobileNumber: phoneNumber
              });
            }
          }
        } else {
          this.toastr.error(response.message || 'Invalid OTP', 'Error');
        }
      },
      error: (error) => {
        console.error('Error verifying OTP:', error);
        this.toastr.error('Failed to verify OTP. Please try again.', 'Error');
      }
    });
  }

  // Step 2: Resend OTP
  resendOtp(): void {
    if (!this.canResend) {
      return;
    }

    const email = this.verifiedEmail;
    const phone = this.verifiedPhone;

    const request = this.verificationMethod === 'email'
      ? this.couponSaleService.sendOtpToEmail(email)
      : this.couponSaleService.sendOtpToPhone(phone);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.otpForm.patchValue({ otp: '' });
          this.startResendTimer();
          this.toastr.success('OTP resent successfully', 'Success');
        } else {
          this.toastr.error(response.message || 'Failed to resend OTP', 'Error');
        }
      },
      error: (error) => {
        console.error('Error resending OTP:', error);
        this.toastr.error('Failed to resend OTP. Please try again.', 'Error');
      }
    });
  }

  // Resend timer (3 minutes = 180 seconds)
  startResendTimer(): void {
    this.resendTimer = 180; // 3 minutes
    this.canResend = false;

    if (this.resendTimerInterval) {
      clearInterval(this.resendTimerInterval);
    }

    this.resendTimerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.canResend = true;
        clearInterval(this.resendTimerInterval);
      }
    }, 1000);
  }

  getResendTimerText(): string {
    const minutes = Math.floor(this.resendTimer / 60);
    const seconds = this.resendTimer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Step 3: Coupon Code Input Handlers
  onCouponCodeInput(event: any, part: number): void {
    // Allow alphanumeric characters and convert to uppercase
    const value = event.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const maxLength = part === 3 ? 5 : 4;
    const trimmedValue = value.substring(0, maxLength);
    
    // Update form control
    if (part === 1) {
      this.couponForm.patchValue({ couponCode1: trimmedValue }, { emitEvent: false });
      this.couponCode1 = trimmedValue;
      if (trimmedValue.length === 4) {
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-part="2"]`) as HTMLInputElement;
          nextInput?.focus();
        }, 0);
      }
    } else if (part === 2) {
      this.couponForm.patchValue({ couponCode2: trimmedValue }, { emitEvent: false });
      this.couponCode2 = trimmedValue;
      if (trimmedValue.length === 4) {
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-part="3"]`) as HTMLInputElement;
          nextInput?.focus();
        }, 0);
      }
    } else if (part === 3) {
      this.couponForm.patchValue({ couponCode3: trimmedValue }, { emitEvent: false });
      this.couponCode3 = trimmedValue;
    }
  }

  // Handle backspace keydown for coupon code inputs
  onCouponCodeKeydown(event: KeyboardEvent, part: number): void {
    if (event.key === 'Backspace') {
      if (part === 1 && this.couponCode1Control?.value === '') {
        event.preventDefault();
      } else if (part === 2 && this.couponCode2Control?.value === '') {
        event.preventDefault();
        // Focus previous input
        const prevInput = document.querySelector(`input[data-part="1"]`) as HTMLInputElement;
        prevInput?.focus();
      } else if (part === 3 && this.couponCode3Control?.value === '') {
        event.preventDefault();
        // Focus previous input
        const prevInput = document.querySelector(`input[data-part="2"]`) as HTMLInputElement;
        prevInput?.focus();
      }
    }
  }

  // Step 3: Verify Coupon Code
  verifyCouponCode(): void {
    if (this.couponForm.invalid) {
      this.markFormGroupTouched(this.couponForm);
      return;
    }

    const fullCouponCode = `${this.couponCode1}${this.couponCode2}${this.couponCode3}`;
    
    if (fullCouponCode.length !== 13) {
      this.toastr.error('Please enter complete 13-character coupon code', 'Error');
      return;
    }

    this.isValidatingCoupon = true;
    this.couponService.validateCoupon({ couponCode: fullCouponCode }).subscribe({
      next: (response) => {
        this.isValidatingCoupon = false;
        if (response.isValid && response.couponId) {
          this.couponValidationResponse = response;
          this.validatedCouponId = response.couponId;
          
          // Pre-fill scheme if available
          if (response.scheme) {
            this.customerDetailsForm.patchValue({
              SchemeId: response.scheme.id
            });
            this.selectedScheme = {
              id: response.scheme.id,
              name: response.scheme.name,
              description: response.scheme.description,
              price: response.scheme.price,
              isActive: true,
              createdAt: '',
              updatedAt: null,
              products: []
            };
          }
          
          this.currentStep = 'details';
          this.toastr.success('Coupon validated successfully', 'Success');
        } else {
          this.couponValidationResponse = null;
          this.validatedCouponId = null;
          this.toastr.error(response.errorMessage || 'Invalid coupon code', 'Error');
        }
      },
      error: (error) => {
        this.isValidatingCoupon = false;
        console.error('Error validating coupon:', error);
        this.toastr.error('Failed to validate coupon. Please try again.', 'Error');
      }
    });
  }

  // Step 4: On scheme selection
  onSchemeChange(): void {
    const schemeId = this.customerDetailsForm.get('SchemeId')?.value;
    this.selectedScheme = this.couponSchemes.find(s => s.id === schemeId) || null;
  }

  // Step 4: Submit customer details (Next button)
  submitCustomerDetails(): void {
    if (this.customerDetailsForm.invalid) {
      this.markFormGroupTouched(this.customerDetailsForm);
      return;
    }

    // Move to verify details step
    this.currentStep = 'verify-details';
  }

  // Step 5: Generate Invoice
  generateInvoice(): void {
    if (this.verifyDetailsForm.invalid) {
      this.markFormGroupTouched(this.verifyDetailsForm);
      return;
    }

    if (!this.validatedCouponId) {
      this.toastr.error('Coupon ID is missing', 'Error');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.customerDetailsForm.value;
    const verifyValue = this.verifyDetailsForm.value;
    
    // Combine country code with mobile number
    const fullMobileNumber = formValue.countryCode 
      ? `${formValue.countryCode}${formValue.MobileNumber}` 
      : formValue.MobileNumber;
    
    const request = {
      firstName: formValue.FirstName,
      lastName: formValue.LastName,
      email: formValue.Email,
      mobileNumber: fullMobileNumber,
      couponId: this.validatedCouponId,
      schemeId: formValue.SchemeId || undefined,
      paymentMethod: verifyValue.PaymentMethod as PaymentMethod
    };

    this.couponSaleService.createInvoiceWithCustomer(request).subscribe({
      next: (response: CreateInvoiceResponse) => {
        this.isSubmitting = false;
        // Navigate to invoice view with invoice number
        this.router.navigate(['/organization/coupons/invoice-view'], {
          queryParams: {
            invoiceNumber: response.invoice.invoiceNumber
          }
        });
      },
      error: (error) => {
        console.error('Error generating invoice:', error);
        this.toastr.error('Failed to generate invoice. Please try again.', 'Error');
        this.isSubmitting = false;
      }
    });
  }

  // Navigation
  goBack(): void {
    if (this.currentStep === 'verify') {
      this.location.back();
    } else if (this.currentStep === 'otp') {
      this.currentStep = 'verify';
      this.otpSent = false;
      this.otpForm.reset();
      if (this.resendTimerInterval) {
        clearInterval(this.resendTimerInterval);
      }
    } else if (this.currentStep === 'coupon') {
      this.currentStep = 'otp';
      this.otpVerified = false;
    } else if (this.currentStep === 'details') {
      this.currentStep = 'coupon';
    } else if (this.currentStep === 'verify-details') {
      this.currentStep = 'details';
    } else if (this.currentStep === 'invoice') {
      this.currentStep = 'verify';
      this.resetAllForms();
    }
  }

  resetAllForms(): void {
    this.verifyForm.reset();
    this.otpForm.reset();
    this.couponForm.reset();
    this.customerDetailsForm.reset();
    this.verifyDetailsForm.reset();
    this.otpSent = false;
    this.otpVerified = false;
    this.selectedScheme = null;
    this.invoiceDetails = null;
    this.verifiedEmail = '';
    this.verifiedPhone = '';
    this.couponCode1 = '';
    this.couponCode2 = '';
    this.couponCode3 = '';
    this.couponValidationResponse = null;
    this.validatedCouponId = null;
    if (this.resendTimerInterval) {
      clearInterval(this.resendTimerInterval);
    }
  }

  // Helper methods
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Form control getters
  get verifyEmailControl() {
    return this.verifyForm.get('email');
  }

  get verifyPhoneControl() {
    return this.verifyForm.get('phone');
  }

  get otpControl() {
    return this.otpForm.get('otp');
  }

  get firstNameControl() {
    return this.customerDetailsForm.get('FirstName');
  }

  get lastNameControl() {
    return this.customerDetailsForm.get('LastName');
  }

  get emailControl() {
    return this.customerDetailsForm.get('Email');
  }

  get mobileNumberControl() {
    return this.customerDetailsForm.get('MobileNumber');
  }

  get schemeIdControl() {
    return this.customerDetailsForm.get('SchemeId');
  }

  get couponCode1Control() {
    return this.couponForm.get('couponCode1');
  }

  get couponCode2Control() {
    return this.couponForm.get('couponCode2');
  }

  get couponCode3Control() {
    return this.couponForm.get('couponCode3');
  }

  get paymentMethodControl() {
    return this.verifyDetailsForm.get('PaymentMethod');
  }

  get fullCouponCode(): string {
    return `${this.couponCode1}${this.couponCode2}${this.couponCode3}`;
  }

  // Invoice helpers
  printInvoice(): void {
    window.print();
  }

  downloadInvoice(): void {
    // TODO: Implement PDF download
    this.toastr.info('PDF download feature coming soon', 'Info');
  }
}

