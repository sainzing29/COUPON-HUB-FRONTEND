import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChildren, QueryList, ElementRef, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerVerifyService, SendPhoneOtpRequest, VerifyPhoneOtpRequest, ResendPhoneOtpRequest, SendEmailOtpRequest, VerifyEmailOtpRequest, ResendEmailOtpRequest, CustomerByMobileResponse } from '../../services/customer-verify.service';
import { ToastrService } from 'ngx-toastr';
import { CountryCodeSelectorComponent, COUNTRY_CODES } from '../../../../modules/organization/components/country-code-selector/country-code-selector.component';

export type VerificationType = 'phone' | 'email';
export type VerificationStep = 'phone' | 'email' | 'customer-found' | 'customer-form';

@Component({
  selector: 'app-contact-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CountryCodeSelectorComponent],
  templateUrl: './contact-verification.component.html',
  styleUrls: ['./contact-verification.component.scss']
})
export class ContactVerificationComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChildren('phoneOtpInput') phoneOtpInputs!: QueryList<ElementRef>;
  @ViewChildren('emailOtpInput') emailOtpInputs!: QueryList<ElementRef>;
  
  @Input() couponCode: string = '';
  @Input() showCustomerForm: boolean = false; // Input to force show customer form
  @Input() verifiedEmailInput: string = ''; // Verified email to populate customer form
  @Input() verifiedPhoneInput: string = ''; // Verified phone to populate customer form
  @Input() verifiedCountryCodeInput: string = '+971'; // Verified country code to populate customer form
  @Output() phoneVerified = new EventEmitter<{ phoneNumber: string; customer: CustomerByMobileResponse | null }>();
  @Output() emailVerified = new EventEmitter<{ email: string; phoneNumber?: string; countryCode?: string }>();
  @Output() customerFormSubmit = new EventEmitter<any>();
  @Output() customerFormError = new EventEmitter<void>();
  @Output() customerFormShown = new EventEmitter<void>();
  
  currentStep: VerificationStep = 'phone';
  verificationType: VerificationType = 'phone';
  
  // Phone verification
  phoneForm: FormGroup;
  phoneOtpForm: FormGroup;
  isSendingPhoneOtp = false;
  isVerifyingPhoneOtp = false;
  phoneOtpSent = false;
  phoneOtpVerified = false;
  phoneDigits: number[] = [0, 1, 2, 3, 4, 5];
  selectedCountryCode = '+971';
  resendPhoneTimer: number = 0;
  resendPhoneTimerInterval: any;
  canResendPhone = false;
  verifiedPhoneNumber: string = '';
  customerData: CustomerByMobileResponse | null = null;
  
  // Email verification
  emailForm: FormGroup;
  emailOtpForm: FormGroup;
  isSendingEmailOtp = false;
  isVerifyingEmailOtp = false;
  emailOtpSent = false;
  emailOtpVerified = false;
  emailDigits: number[] = [0, 1, 2, 3, 4, 5];
  resendEmailTimer: number = 0;
  resendEmailTimerInterval: any;
  canResendEmail = false;
  verifiedEmail: string = '';
  
  // Customer form
  customerForm: FormGroup;
  isSubmittingCustomerForm = false;

  constructor(
    private fb: FormBuilder,
    private customerVerifyService: CustomerVerifyService,
    private toastr: ToastrService
  ) {
    // Phone form
    this.phoneForm = this.fb.group({
      countryCode: ['+971', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]]
    });

    // Phone OTP form
    this.phoneOtpForm = this.fb.group({
      digit0: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit1: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit2: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit3: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit4: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit5: ['', [Validators.required, Validators.pattern(/[0-9]/)]]
    });

    // Email form
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Email OTP form
    this.emailOtpForm = this.fb.group({
      digit0: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit1: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit2: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit3: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit4: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit5: ['', [Validators.required, Validators.pattern(/[0-9]/)]]
    });

    // Customer form
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+971', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]]
    });
  }

  ngOnInit(): void {
    // Initialize timers
    if (this.showCustomerForm) {
      this.currentStep = 'customer-form';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showCustomerForm'] && changes['showCustomerForm'].currentValue === true) {
      this.currentStep = 'customer-form';
      this.populateCustomerForm();
    }
    // Also populate if verified inputs change
    if ((changes['verifiedEmailInput'] || changes['verifiedPhoneInput'] || changes['verifiedCountryCodeInput']) && this.showCustomerForm) {
      this.populateCustomerForm();
    }
  }

  private populateCustomerForm(): void {
    if (this.showCustomerForm && this.verifiedEmailInput && this.verifiedPhoneInput) {
      // Extract phone number from verifiedPhoneInput (remove country code if present)
      let phoneNumber = this.verifiedPhoneInput;
      let countryCode = this.verifiedCountryCodeInput || '+971';
      
      // If phone number includes country code, extract it
      const countryCodes = COUNTRY_CODES.map(cc => cc.code).sort((a, b) => b.length - a.length);
      for (const code of countryCodes) {
        if (phoneNumber.startsWith(code)) {
          countryCode = code;
          phoneNumber = phoneNumber.substring(code.length);
          break;
        }
      }
      
      this.customerForm.patchValue({
        email: this.verifiedEmailInput,
        countryCode: countryCode,
        phone: phoneNumber
      });
      this.selectedCountryCode = countryCode;
      this.verifiedEmail = this.verifiedEmailInput;
      this.verifiedPhoneNumber = this.verifiedPhoneInput;
    }
  }

  ngOnDestroy(): void {
    if (this.resendPhoneTimerInterval) {
      clearInterval(this.resendPhoneTimerInterval);
    }
    if (this.resendEmailTimerInterval) {
      clearInterval(this.resendEmailTimerInterval);
    }
  }

  // Phone OTP Methods
  sendPhoneOtp(): void {
    if (this.phoneForm.invalid) {
      this.markFormGroupTouched(this.phoneForm);
      return;
    }

    this.isSendingPhoneOtp = true;
    const formData = this.phoneForm.value;
    const fullPhoneNumber = `${formData.countryCode}${formData.phone}`;

    const request: SendPhoneOtpRequest = {
      phoneNumber: fullPhoneNumber
    };

    this.customerVerifyService.sendPhoneOtp(request).subscribe({
      next: (response) => {
        this.isSendingPhoneOtp = false;
        this.phoneOtpSent = true;
        this.verifiedPhoneNumber = fullPhoneNumber;
        this.startResendPhoneTimer();
        this.toastr.success(response.message || 'OTP sent successfully', 'Success');
        setTimeout(() => {
          if (this.phoneOtpInputs && this.phoneOtpInputs.length > 0) {
            this.phoneOtpInputs.first.nativeElement.focus();
          }
        }, 100);
      },
      error: (error) => {
        this.isSendingPhoneOtp = false;
        console.error('Error sending phone OTP:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Failed to send OTP. Please try again.';
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  onPhoneOtpDigitInput(event: any, index: number): void {
    const value = event.target.value;
    
    if (value.length > 1) {
      event.target.value = value.slice(-1);
    }
    
    if (value && !/^[0-9]$/.test(value)) {
      event.target.value = '';
      return;
    }
    
    this.phoneOtpForm.get(`digit${index}`)?.setValue(value);
    
    if (value && index < 5) {
      setTimeout(() => {
        if (this.phoneOtpInputs && this.phoneOtpInputs.length > index + 1) {
          const nextInput = this.phoneOtpInputs.toArray()[index + 1];
          if (nextInput) {
            nextInput.nativeElement.focus();
            nextInput.nativeElement.select();
          }
        }
      }, 10);
    }
  }

  onPhoneOtpKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const input = event.target as HTMLInputElement;
      if (!input.value && index > 0) {
        if (this.phoneOtpInputs && this.phoneOtpInputs.length > index) {
          const prevInput = this.phoneOtpInputs.toArray()[index - 1];
          if (prevInput) {
            prevInput.nativeElement.focus();
          }
        }
      }
    }
  }

  onPhoneOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    for (let i = 0; i < 6; i++) {
      this.phoneOtpForm.get(`digit${i}`)?.setValue('');
    }
    
    for (let i = 0; i < digits.length && i < 6; i++) {
      this.phoneOtpForm.get(`digit${i}`)?.setValue(digits[i]);
    }
    
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    setTimeout(() => {
      if (this.phoneOtpInputs && this.phoneOtpInputs.length > nextEmptyIndex) {
        this.phoneOtpInputs.toArray()[nextEmptyIndex].nativeElement.focus();
      }
    }, 0);
  }

  verifyPhoneOtp(): void {
    if (this.phoneOtpForm.invalid) {
      this.markFormGroupTouched(this.phoneOtpForm);
      return;
    }

    this.isVerifyingPhoneOtp = true;
    const otpCode = this.phoneDigits.map(index => 
      this.phoneOtpForm.get(`digit${index}`)?.value
    ).join('');

    const request: VerifyPhoneOtpRequest = {
      phoneNumber: this.verifiedPhoneNumber,
      otpCode: otpCode
    };

    this.customerVerifyService.verifyPhoneOtp(request).subscribe({
      next: (response) => {
        this.isVerifyingPhoneOtp = false;
        if (response.success && response.verified) {
          this.phoneOtpVerified = true;
          this.toastr.success(response.message || 'Phone verified successfully', 'Success');
          
          // Check if customer exists
          this.checkCustomerByMobile(this.verifiedPhoneNumber);
        } else {
          this.toastr.error(response.message || 'Invalid OTP', 'Error');
          this.clearPhoneOtp();
        }
      },
      error: (error) => {
        this.isVerifyingPhoneOtp = false;
        console.error('Error verifying phone OTP:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Invalid OTP. Please try again.';
        this.toastr.error(errorMessage, 'Error');
        this.clearPhoneOtp();
      }
    });
  }

  checkCustomerByMobile(mobileNumber: string): void {
    this.customerVerifyService.getCustomerByMobile(mobileNumber).subscribe({
      next: (customer) => {
        this.customerData = customer;
        this.currentStep = 'customer-found';
        this.phoneVerified.emit({ phoneNumber: mobileNumber, customer: customer });
      },
      error: (error) => {
        // Customer not found, proceed to email verification
        if (error.status === 404) {
          this.customerData = null;
          this.currentStep = 'email';
          this.phoneVerified.emit({ phoneNumber: mobileNumber, customer: null });
        } else {
          console.error('Error checking customer:', error);
          this.toastr.error('Error checking customer', 'Error');
        }
      }
    });
  }

  resendPhoneOtp(): void {
    if (!this.canResendPhone) {
      return;
    }

    const request: ResendPhoneOtpRequest = {
      phoneNumber: this.verifiedPhoneNumber
    };

    this.customerVerifyService.resendPhoneOtp(request).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'OTP resent successfully', 'Success');
        this.clearPhoneOtp();
        this.startResendPhoneTimer();
        setTimeout(() => {
          if (this.phoneOtpInputs && this.phoneOtpInputs.length > 0) {
            this.phoneOtpInputs.first.nativeElement.focus();
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error resending phone OTP:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Failed to resend OTP. Please try again.';
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  startResendPhoneTimer(): void {
    this.resendPhoneTimer = 60; // 1 minute
    this.canResendPhone = false;

    if (this.resendPhoneTimerInterval) {
      clearInterval(this.resendPhoneTimerInterval);
    }

    this.resendPhoneTimerInterval = setInterval(() => {
      this.resendPhoneTimer--;
      if (this.resendPhoneTimer <= 0) {
        this.canResendPhone = true;
        clearInterval(this.resendPhoneTimerInterval);
      }
    }, 1000);
  }

  getResendPhoneTimerText(): string {
    const minutes = Math.floor(this.resendPhoneTimer / 60);
    const seconds = this.resendPhoneTimer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  clearPhoneOtp(): void {
    for (let i = 0; i < 6; i++) {
      this.phoneOtpForm.get(`digit${i}`)?.setValue('');
    }
  }

  changePhoneNumber(): void {
    // Reset phone OTP state
    this.phoneOtpSent = false;
    this.phoneOtpVerified = false;
    this.verifiedPhoneNumber = '';
    this.clearPhoneOtp();
    
    // Clear timer
    if (this.resendPhoneTimerInterval) {
      clearInterval(this.resendPhoneTimerInterval);
      this.resendPhoneTimer = 0;
      this.canResendPhone = false;
    }
    
    // Reset phone form to allow editing
    this.phoneForm.patchValue({
      phone: ''
    });
  }

  // Email OTP Methods
  sendEmailOtp(): void {
    if (this.emailForm.invalid) {
      this.markFormGroupTouched(this.emailForm);
      return;
    }

    this.isSendingEmailOtp = true;
    const formData = this.emailForm.value;

    const request: SendEmailOtpRequest = {
      email: formData.email
    };

    this.customerVerifyService.sendEmailOtp(request).subscribe({
      next: (response) => {
        this.isSendingEmailOtp = false;
        this.emailOtpSent = true;
        this.verifiedEmail = formData.email;
        this.startResendEmailTimer();
        this.toastr.success(response.message || 'OTP sent successfully', 'Success');
        setTimeout(() => {
          if (this.emailOtpInputs && this.emailOtpInputs.length > 0) {
            this.emailOtpInputs.first.nativeElement.focus();
          }
        }, 100);
      },
      error: (error) => {
        this.isSendingEmailOtp = false;
        console.error('Error sending email OTP:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Failed to send OTP. Please try again.';
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  onEmailOtpDigitInput(event: any, index: number): void {
    const value = event.target.value;
    
    if (value.length > 1) {
      event.target.value = value.slice(-1);
    }
    
    if (value && !/^[0-9]$/.test(value)) {
      event.target.value = '';
      return;
    }
    
    this.emailOtpForm.get(`digit${index}`)?.setValue(value);
    
    if (value && index < 5) {
      setTimeout(() => {
        if (this.emailOtpInputs && this.emailOtpInputs.length > index + 1) {
          const nextInput = this.emailOtpInputs.toArray()[index + 1];
          if (nextInput) {
            nextInput.nativeElement.focus();
            nextInput.nativeElement.select();
          }
        }
      }, 10);
    }
  }

  onEmailOtpKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const input = event.target as HTMLInputElement;
      if (!input.value && index > 0) {
        if (this.emailOtpInputs && this.emailOtpInputs.length > index) {
          const prevInput = this.emailOtpInputs.toArray()[index - 1];
          if (prevInput) {
            prevInput.nativeElement.focus();
          }
        }
      }
    }
  }

  onEmailOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    for (let i = 0; i < 6; i++) {
      this.emailOtpForm.get(`digit${i}`)?.setValue('');
    }
    
    for (let i = 0; i < digits.length && i < 6; i++) {
      this.emailOtpForm.get(`digit${i}`)?.setValue(digits[i]);
    }
    
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    setTimeout(() => {
      if (this.emailOtpInputs && this.emailOtpInputs.length > nextEmptyIndex) {
        this.emailOtpInputs.toArray()[nextEmptyIndex].nativeElement.focus();
      }
    }, 0);
  }

  verifyEmailOtp(): void {
    if (this.emailOtpForm.invalid) {
      this.markFormGroupTouched(this.emailOtpForm);
      return;
    }

    this.isVerifyingEmailOtp = true;
    const otpCode = this.emailDigits.map(index => 
      this.emailOtpForm.get(`digit${index}`)?.value
    ).join('');

    const request: VerifyEmailOtpRequest = {
      email: this.verifiedEmail,
      otpCode: otpCode
    };

    this.customerVerifyService.verifyEmailOtp(request).subscribe({
      next: (response) => {
        this.isVerifyingEmailOtp = false;
        if (response.success && response.verified) {
          this.emailOtpVerified = true;
          this.toastr.success(response.message || 'Email verified successfully', 'Success');
          
          // Populate customer form and show it
          // Extract country code and phone number from verifiedPhoneNumber
          let phoneNumber = this.verifiedPhoneNumber;
          let countryCode = '+971'; // Default
          
          // Extract country codes from COUNTRY_CODES and sort by length (longest first) to match correctly
          const countryCodes = COUNTRY_CODES.map(cc => cc.code).sort((a, b) => b.length - a.length);
          
          // Try to match country code (check longest codes first to avoid partial matches)
          for (const code of countryCodes) {
            if (phoneNumber.startsWith(code)) {
              countryCode = code;
              phoneNumber = phoneNumber.substring(code.length);
              break;
            }
          }
          
          this.customerForm.patchValue({
            email: this.verifiedEmail,
            countryCode: countryCode,
            phone: phoneNumber
          });
          this.selectedCountryCode = countryCode;
          this.currentStep = 'customer-form';
          // Emit customerFormShown first to update parent step, then emailVerified
          this.customerFormShown.emit();
          // Emit email, phone, and country code for parent to store
          this.emailVerified.emit({ 
            email: this.verifiedEmail,
            phoneNumber: this.verifiedPhoneNumber, // Full phone number with country code
            countryCode: countryCode
          });
        } else {
          this.toastr.error(response.message || 'Invalid OTP', 'Error');
          this.clearEmailOtp();
        }
      },
      error: (error) => {
        this.isVerifyingEmailOtp = false;
        console.error('Error verifying email OTP:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Invalid OTP. Please try again.';
        this.toastr.error(errorMessage, 'Error');
        this.clearEmailOtp();
      }
    });
  }

  resendEmailOtp(): void {
    if (!this.canResendEmail) {
      return;
    }

    const otpCode = this.emailDigits.map(index => 
      this.emailOtpForm.get(`digit${index}`)?.value
    ).join('') || '000000'; // Default if empty

    const request: ResendEmailOtpRequest = {
      email: this.verifiedEmail,
      otpCode: otpCode
    };

    this.customerVerifyService.resendEmailOtp(request).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'OTP resent successfully', 'Success');
        this.clearEmailOtp();
        this.startResendEmailTimer();
        setTimeout(() => {
          if (this.emailOtpInputs && this.emailOtpInputs.length > 0) {
            this.emailOtpInputs.first.nativeElement.focus();
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error resending email OTP:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Failed to resend OTP. Please try again.';
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  startResendEmailTimer(): void {
    this.resendEmailTimer = 60; // 1 minute
    this.canResendEmail = false;

    if (this.resendEmailTimerInterval) {
      clearInterval(this.resendEmailTimerInterval);
    }

    this.resendEmailTimerInterval = setInterval(() => {
      this.resendEmailTimer--;
      if (this.resendEmailTimer <= 0) {
        this.canResendEmail = true;
        clearInterval(this.resendEmailTimerInterval);
      }
    }, 1000);
  }

  getResendEmailTimerText(): string {
    const minutes = Math.floor(this.resendEmailTimer / 60);
    const seconds = this.resendEmailTimer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  clearEmailOtp(): void {
    for (let i = 0; i < 6; i++) {
      this.emailOtpForm.get(`digit${i}`)?.setValue('');
    }
  }

  changeEmailAddress(): void {
    // Reset email OTP state
    this.emailOtpSent = false;
    this.emailOtpVerified = false;
    this.verifiedEmail = '';
    this.clearEmailOtp();
    
    // Clear timer
    if (this.resendEmailTimerInterval) {
      clearInterval(this.resendEmailTimerInterval);
      this.resendEmailTimer = 0;
      this.canResendEmail = false;
    }
    
    // Reset email form to allow editing
    this.emailForm.patchValue({
      email: ''
    });
  }

  // Customer Form Methods
  submitCustomerForm(): void {
    if (this.customerForm.invalid) {
      this.markFormGroupTouched(this.customerForm);
      return;
    }

    this.isSubmittingCustomerForm = true;
    const formData = this.customerForm.value;
    // Send countryCode and mobileNumber as separate fields
    const customerData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobileNumber: formData.phone,
      countryCode: formData.countryCode
    };
    this.customerFormSubmit.emit(customerData);
  }

  resetCustomerFormSubmission(): void {
    this.isSubmittingCustomerForm = false;
  }

  addCouponToExistingCustomer(): void {
    if (this.customerData) {
      // Extract countryCode and mobileNumber if mobileNumber includes country code
      let mobileNumber = this.customerData.mobileNumber;
      let countryCode = this.customerData.countryCode || this.selectedCountryCode;
      
      // If countryCode is not available and mobileNumber starts with +, try to extract it
      if (!this.customerData.countryCode && mobileNumber.startsWith('+')) {
        // Try to extract country code (common patterns: +971, +1, etc.)
        const match = mobileNumber.match(/^(\+\d{1,3})/);
        if (match) {
          countryCode = match[1];
          mobileNumber = mobileNumber.substring(match[1].length);
        }
      }
      
      this.customerFormSubmit.emit({
        firstName: this.customerData.firstName,
        lastName: this.customerData.lastName,
        email: this.customerData.email,
        mobileNumber: mobileNumber,
        countryCode: countryCode
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get phoneControl() {
    return this.phoneForm.get('phone');
  }

  get emailControl() {
    return this.emailForm.get('email');
  }
}

