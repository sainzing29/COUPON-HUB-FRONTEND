import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CouponRedemptionService } from '../../services/coupon-redemption.service';
import { VerifyCustomerRequest, VerifyCustomerResponse, VerifyOtpRequest, VerifyOtpResponse } from '../../models/coupon-redemption.model';
import { ToastrService } from 'ngx-toastr';
import { CountryCodeSelectorComponent } from '../../../organization/components/country-code-selector/country-code-selector.component';

@Component({
  selector: 'app-verify-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CountryCodeSelectorComponent],
  templateUrl: './verify-customer.component.html',
  styleUrls: ['./verify-customer.component.scss']
})
export class VerifyCustomerComponent implements OnInit, OnDestroy {
  @Output() customerVerified = new EventEmitter<VerifyOtpResponse>();
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  verifyForm: FormGroup;
  otpForm: FormGroup;
  otpSent = false;
  isSendingOtp = false;
  isVerifyingOtp = false;
  isResendingOtp = false;
  verifyCustomerResponse: VerifyCustomerResponse | null = null;
  otpDigits: number[] = [0, 1, 2, 3, 4, 5];
  resendTimer: number = 0; // in seconds
  resendTimerInterval: any;
  canResend = false;
  selectedCountryCode = '+971'; // Default to UAE

  get otpSendOption(): 'email' | 'phone' {
    return this.verifyForm.get('otpSendOption')?.value || 'email';
  }

  constructor(
    private fb: FormBuilder,
    private couponRedemptionService: CouponRedemptionService,
    private toastr: ToastrService
  ) {
    // Initialize verify form
    this.verifyForm = this.fb.group({
      couponNumber: [''],
      email: ['', [Validators.email]],
      phone: [''],
      countryCode: ['+971'],
      otpSendOption: ['email']
    }, { validators: this.atLeastOneRequired });

    // Initialize OTP form
    this.otpForm = this.fb.group({
      digit0: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit1: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit2: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit3: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit4: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit5: ['', [Validators.required, Validators.pattern(/[0-9]/)]]
    });
  }

  ngOnInit(): void {
    // Set coupon number as default focus
    setTimeout(() => {
      const couponInput = document.querySelector('input[formControlName="couponNumber"]') as HTMLInputElement;
      if (couponInput) {
        couponInput.focus();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.resendTimerInterval) {
      clearInterval(this.resendTimerInterval);
    }
  }

  // Custom validator to ensure at least one field is filled
  atLeastOneRequired(control: AbstractControl): ValidationErrors | null {
    const couponNumber = control.get('couponNumber')?.value;
    const email = control.get('email')?.value;
    const phone = control.get('phone')?.value;

    if (!couponNumber && !email && !phone) {
      return { atLeastOneRequired: true };
    }
    return null;
  }

  onOtpSendOptionChange(): void {
    // Radio button change is handled by form control
  }

  sendOtp(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      if (this.verifyForm.errors?.['atLeastOneRequired']) {
        this.toastr.error('Please provide at least one identifier (Coupon Number, Email, or Phone)', 'Validation Error');
      }
      return;
    }

    const formValue = this.verifyForm.value;

    const request: VerifyCustomerRequest = {
      otpSendOption: this.otpSendOption
    };

    // Determine identifier based on which field is filled
    if (formValue.couponNumber) {
      request.identifier = formValue.couponNumber;
    } else if (formValue.email) {
      request.email = formValue.email;
    } else if (formValue.phone) {
      request.phone = formValue.phone.trim();
      request.countryCode = formValue.countryCode || '+971';
    }

    this.isSendingOtp = true;
    this.couponRedemptionService.verifyCustomer(request).subscribe({
      next: (response) => {
        this.verifyCustomerResponse = response;
        this.otpSent = true;
        this.isSendingOtp = false;
        this.startResendTimer();
        this.toastr.success(response.message, 'OTP Sent');
      },
      error: (error) => {
        this.isSendingOtp = false;
        // Extract error message from various possible locations
        let errorMessage = 'Failed to send OTP';
        
        // Log error for debugging
        console.error('Verify customer error:', error);
     
       if (error?.message) {
          errorMessage = error.message;
        }
        
        console.log('Displaying error message:', errorMessage);
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  // Resend OTP
  resendOtp(): void {
    if (!this.canResend) {
      return;
    }

    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      if (this.verifyForm.errors?.['atLeastOneRequired']) {
        this.toastr.error('Please provide at least one identifier (Coupon Number, Email, or Phone)', 'Validation Error');
      }
      return;
    }

    const formValue = this.verifyForm.value;

    const request: VerifyCustomerRequest = {
      otpSendOption: this.otpSendOption
    };

    // Determine identifier based on which field is filled
    if (formValue.couponNumber) {
      request.identifier = formValue.couponNumber;
    } else if (formValue.email) {
      request.email = formValue.email;
    } else if (formValue.phone) {
      request.phone = formValue.phone.trim();
      request.countryCode = formValue.countryCode || '+971';
    }

    this.isResendingOtp = true;
    this.couponRedemptionService.verifyCustomer(request).subscribe({
      next: (response) => {
        this.verifyCustomerResponse = response;
        this.isResendingOtp = false;
        this.startResendTimer();
        this.toastr.success(response.message, 'OTP Resent');
        // Clear OTP form
        for (let i = 0; i < 6; i++) {
          this.otpForm.get(`digit${i}`)?.setValue('');
        }
        // Focus first input
        setTimeout(() => {
          if (this.otpInputs && this.otpInputs.length > 0) {
            this.otpInputs.toArray()[0].nativeElement.focus();
          }
        }, 100);
      },
      error: (error) => {
        this.isResendingOtp = false;
        // Extract error message from various possible locations
        let errorMessage = 'Failed to resend OTP';
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.error?.error) {
          errorMessage = error.error.error;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  // Resend timer (1 minute = 60 seconds)
  startResendTimer(): void {
    this.resendTimer = 60; // 1 minute
    this.canResend = false;

    // Clear existing interval if any
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

  onDigitInput(event: any, index: number): void {
    const value = event.target.value;
    
    // Only allow single digit
    if (value.length > 1) {
      event.target.value = value.slice(-1);
    }
    
    // Only allow numeric input
    if (value && !/^[0-9]$/.test(value)) {
      event.target.value = '';
      return;
    }
    
    // Update form control value
    this.otpForm.get(`digit${index}`)?.setValue(value);
    
    // Move to next input if current is filled
    if (value && index < 5) {
      setTimeout(() => {
        if (this.otpInputs && this.otpInputs.length > index + 1) {
          const nextInput = this.otpInputs.toArray()[index + 1];
          if (nextInput) {
            nextInput.nativeElement.focus();
            nextInput.nativeElement.select();
            return;
          }
        }
        
        const nextInput = document.querySelector(`input[formControlName="digit${index + 1}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 10);
    }
    
    // Auto-verify when all digits are filled
    if (this.isAllDigitsFilled()) {
      setTimeout(() => {
        this.verifyOtp();
      }, 200);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    
    // Handle backspace
    if (event.key === 'Backspace') {
      const currentValue = input.value;
      if (!currentValue && index > 0) {
        const prevInput = this.otpInputs.toArray()[index - 1];
        if (prevInput) {
          prevInput.nativeElement.focus();
        }
      }
    }
    
    // Handle arrow keys
    if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = this.otpInputs.toArray()[index - 1];
      if (prevInput) {
        prevInput.nativeElement.focus();
      }
    }
    
    if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = this.otpInputs.toArray()[index + 1];
      if (nextInput) {
        nextInput.nativeElement.focus();
      }
    }
    
    // Handle Enter key
    if (event.key === 'Enter') {
      if (this.isAllDigitsFilled()) {
        this.verifyOtp();
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    // Clear all inputs first
    for (let i = 0; i < 6; i++) {
      this.otpForm.get(`digit${i}`)?.setValue('');
    }
    
    // Fill inputs with pasted digits
    for (let i = 0; i < digits.length; i++) {
      this.otpForm.get(`digit${i}`)?.setValue(digits[i]);
    }
    
    // Focus on the last filled input or first empty input
    const focusIndex = Math.min(digits.length, 5);
    setTimeout(() => {
      if (this.otpInputs && this.otpInputs.length > focusIndex) {
        this.otpInputs.toArray()[focusIndex].nativeElement.focus();
      }
    }, 10);
    
    // Auto-verify if all 6 digits are pasted
    if (digits.length === 6) {
      setTimeout(() => {
        this.verifyOtp();
      }, 200);
    }
  }

  isAllDigitsFilled(): boolean {
    for (let i = 0; i < 6; i++) {
      const value = this.otpForm.get(`digit${i}`)?.value;
      if (!value || value === '') {
        return false;
      }
    }
    return true;
  }

  verifyOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    // Build OTP code from individual digits
    let otpCode = '';
    for (let i = 0; i < 6; i++) {
      otpCode += this.otpForm.get(`digit${i}`)?.value || '';
    }

    if (!this.verifyCustomerResponse) {
      this.toastr.error('Please send OTP first', 'Error');
      return;
    }

    const request: VerifyOtpRequest = {
      otpCode: otpCode
    };

    // Add email or phone based on otpSendOption
    if (this.otpSendOption === 'email') {
      request.email = this.verifyCustomerResponse.email;
    } else {
      // For phone, use the phone number from response and countryCode from form
      request.phone = this.verifyCustomerResponse.mobileNumber;
      // Get countryCode from form (user's input) or from response as fallback
      const formValue = this.verifyForm.value;
      request.countryCode = formValue.countryCode || this.verifyCustomerResponse.countryCode || '+971';
    }

    this.isVerifyingOtp = true;
    this.couponRedemptionService.verifyOtpAndGetCoupons(request).subscribe({
      next: (response) => {
        this.isVerifyingOtp = false;
        this.toastr.success('OTP verified successfully', 'Success');
        this.customerVerified.emit(response);
      },
      error: (error) => {
        this.isVerifyingOtp = false;
        this.toastr.error(error.error?.message || 'Invalid OTP', 'Error');
        // Clear OTP form on error
        for (let i = 0; i < 6; i++) {
          this.otpForm.get(`digit${i}`)?.setValue('');
        }
        // Focus first input
        setTimeout(() => {
          if (this.otpInputs && this.otpInputs.length > 0) {
            this.otpInputs.toArray()[0].nativeElement.focus();
          }
        }, 100);
      }
    });
  }

  get verifyFormError(): string | null {
    if (this.verifyForm.errors?.['atLeastOneRequired'] && this.verifyForm.touched) {
      return 'Please provide at least one identifier';
    }
    return null;
  }
}

