import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterCustomerService } from './register-customer.service';
import { CustomerByCouponResponse } from './register-customer.model';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-register-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register-customer.html',
  styleUrls: ['./register-customer.scss']
})
export class RegisterCustomerComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  @ViewChildren('pinInput') pinInputs!: QueryList<ElementRef>;
  @ViewChildren('confirmPinInput') confirmPinInputs!: QueryList<ElementRef>;
  
  currentStep: 'coupon-verification' | 'otp-verification' | 'pin-creation' | 'registration' = 'coupon-verification';
  couponVerificationForm: FormGroup;
  otpForm: FormGroup;
  pinForm: FormGroup;
  registrationForm: FormGroup;
  isSubmitting = false;
  isVerifyingOtp = false;
  isCreatingPin = false;
  verifiedCouponNumber: string = '';
  couponCode1: string = '';
  couponCode2: string = '';
  couponCode3: string = '';
  customerData: CustomerByCouponResponse | null = null;
  otpMethod: 'email' | 'phone' = 'email';
  otpDigits: number[] = [0, 1, 2, 3, 4, 5];
  pinDigits: number[] = [0, 1, 2, 3, 4, 5];
  
  // Resend OTP timer
  resendTimer: number = 0;
  resendTimerInterval: any;
  canResend = false;
  
  // Country code options
  countryCodes = [
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' }
  ];
  
  selectedCountryCode = '+971'; // Default to UAE

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registerCustomerService: RegisterCustomerService,
    private toastr: ToastrService,
    private tokenService: TokenService
  ) {
    // Coupon verification form with separate inputs (4-4-5 format)
    this.couponVerificationForm = this.fb.group({
      couponCode1: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{4}$/)]],
      couponCode2: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{4}$/)]],
      couponCode3: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{5}$/)]]
    });

    // OTP form with 6 separate inputs
    this.otpForm = this.fb.group({
      digit0: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit1: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit2: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit3: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit4: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit5: ['', [Validators.required, Validators.pattern(/[0-9]/)]]
    });

    // PIN form with 6 separate inputs for PIN and Confirm PIN
    this.pinForm = this.fb.group({
      pin0: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin1: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin2: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin3: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin4: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin5: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin0: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin1: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin2: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin3: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin4: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin5: ['', [Validators.required, Validators.pattern(/[0-9]/)]]
    }, { validators: this.pinMatchValidator });

    // Registration form (without coupon number)
    this.registrationForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+971', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      address: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Focus on first OTP input when OTP step is shown
    // This will be handled when step changes
  }

  ngOnDestroy(): void {
    if (this.resendTimerInterval) {
      clearInterval(this.resendTimerInterval);
    }
  }

  // Password match validator
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  // PIN match validator
  pinMatchValidator(form: FormGroup) {
    // Combine PIN digits
    const pin = [0, 1, 2, 3, 4, 5].map(i => form.get(`pin${i}`)?.value).join('');
    const confirmPin = [0, 1, 2, 3, 4, 5].map(i => form.get(`confirmPin${i}`)?.value).join('');
    
    if (pin && confirmPin && pin.length === 6 && confirmPin.length === 6 && pin !== confirmPin) {
      // Set error on all confirmPin fields
      for (let i = 0; i < 6; i++) {
        form.get(`confirmPin${i}`)?.setErrors({ pinMismatch: true });
      }
      return { pinMismatch: true };
    }
    
    // Clear errors if PINs match
    if (pin === confirmPin && pin.length === 6) {
      for (let i = 0; i < 6; i++) {
        const control = form.get(`confirmPin${i}`);
        if (control?.hasError('pinMismatch')) {
          const errors = { ...control.errors };
          delete errors['pinMismatch'];
          control.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
      }
    }
    
    return null;
  }

  // Coupon Code Input Handlers
  onCouponCodeInput(event: any, part: number): void {
    // Allow alphanumeric characters and convert to uppercase
    const value = event.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const maxLength = part === 3 ? 5 : 4;
    const trimmedValue = value.substring(0, maxLength);
    
    // Update form control
    if (part === 1) {
      this.couponVerificationForm.patchValue({ couponCode1: trimmedValue }, { emitEvent: false });
      this.couponCode1 = trimmedValue;
      if (trimmedValue.length === 4) {
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-part="2"]`) as HTMLInputElement;
          nextInput?.focus();
        }, 0);
      }
    } else if (part === 2) {
      this.couponVerificationForm.patchValue({ couponCode2: trimmedValue }, { emitEvent: false });
      this.couponCode2 = trimmedValue;
      if (trimmedValue.length === 4) {
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-part="3"]`) as HTMLInputElement;
          nextInput?.focus();
        }, 0);
      }
    } else if (part === 3) {
      this.couponVerificationForm.patchValue({ couponCode3: trimmedValue }, { emitEvent: false });
      this.couponCode3 = trimmedValue;
    }
  }

  // Handle paste event for coupon code inputs
  onCouponCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    
    // Remove dashes, spaces, and convert to uppercase
    const cleanedData = pastedData.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // If the pasted data is 13 characters (full coupon code), split it
    if (cleanedData.length === 13) {
      const part1 = cleanedData.substring(0, 4);
      const part2 = cleanedData.substring(4, 8);
      const part3 = cleanedData.substring(8, 13);
      
      // Update form controls
      this.couponVerificationForm.patchValue({
        couponCode1: part1,
        couponCode2: part2,
        couponCode3: part3
      }, { emitEvent: false });
      
      // Update component properties
      this.couponCode1 = part1;
      this.couponCode2 = part2;
      this.couponCode3 = part3;
      
      // Focus on the last input
      setTimeout(() => {
        const lastInput = document.querySelector(`input[data-part="3"]`) as HTMLInputElement;
        lastInput?.focus();
        lastInput?.select();
      }, 0);
    } else if (cleanedData.length > 0) {
      // If it's not exactly 13 characters, try to fill what we can
      const part1 = cleanedData.substring(0, 4);
      const part2 = cleanedData.substring(4, 8);
      const part3 = cleanedData.substring(8, 13);
      
      this.couponVerificationForm.patchValue({
        couponCode1: part1 || '',
        couponCode2: part2 || '',
        couponCode3: part3 || ''
      }, { emitEvent: false });
      
      this.couponCode1 = part1 || '';
      this.couponCode2 = part2 || '';
      this.couponCode3 = part3 || '';
      
      // Focus on the appropriate input
      setTimeout(() => {
        let focusPart = 1;
        if (cleanedData.length > 4) focusPart = 2;
        if (cleanedData.length > 8) focusPart = 3;
        const focusInput = document.querySelector(`input[data-part="${focusPart}"]`) as HTMLInputElement;
        focusInput?.focus();
      }, 0);
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

  verifyCoupon(): void {
    if (this.couponVerificationForm.valid) {
      this.isSubmitting = true;
      
      // Combine the three parts
      const fullCouponCode = `${this.couponCode1}${this.couponCode2}${this.couponCode3}`;
      
      // Call API to get customer by coupon
      this.registerCustomerService.getCustomerByCoupon(fullCouponCode, this.otpMethod).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.customerData = response;
          this.verifiedCouponNumber = fullCouponCode;
          this.currentStep = 'otp-verification';
          this.startResendTimer();
          this.toastr.success('OTP sent successfully', 'Success');
          // Focus on first OTP input when step changes
          setTimeout(() => {
            if (this.otpInputs && this.otpInputs.length > 0) {
              this.otpInputs.first.nativeElement.focus();
            }
          }, 100);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error verifying coupon:', error);
          const errorMessage = error.error?.message || error.error?.error || 'Invalid coupon code. Please check and try again.';
          this.toastr.error(errorMessage, 'Error');
          // Show error message on form
          this.couponVerificationForm.get('couponCode1')?.setErrors({ invalidCoupon: true });
          this.couponVerificationForm.get('couponCode2')?.setErrors({ invalidCoupon: true });
          this.couponVerificationForm.get('couponCode3')?.setErrors({ invalidCoupon: true });
        }
      });
    } else {
      this.markCouponFormTouched();
    }
  }

  // OTP Input Handlers
  onOtpDigitInput(event: any, index: number): void {
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
        // Try ViewChildren first
        if (this.otpInputs && this.otpInputs.length > index + 1) {
          const nextInput = this.otpInputs.toArray()[index + 1];
          if (nextInput) {
            nextInput.nativeElement.focus();
            nextInput.nativeElement.select();
            return;
          }
        }
        
        // Fallback to DOM query
        const nextInput = document.querySelector(`input[formControlName="digit${index + 1}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 10);
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    
    // Handle backspace
    if (event.key === 'Backspace') {
      const currentValue = input.value;
      if (!currentValue && index > 0) {
        // Move to previous input if current is empty
        if (this.otpInputs && this.otpInputs.length > index) {
          const prevInput = this.otpInputs.toArray()[index - 1];
          if (prevInput) {
            prevInput.nativeElement.focus();
          }
        }
      }
    }
    
    // Handle arrow keys
    if (event.key === 'ArrowLeft' && index > 0) {
      if (this.otpInputs && this.otpInputs.length > index) {
        const prevInput = this.otpInputs.toArray()[index - 1];
        if (prevInput) {
          prevInput.nativeElement.focus();
        }
      }
    }
    
    if (event.key === 'ArrowRight' && index < 5) {
      if (this.otpInputs && this.otpInputs.length > index + 1) {
        const nextInput = this.otpInputs.toArray()[index + 1];
        if (nextInput) {
          nextInput.nativeElement.focus();
        }
      }
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    // Clear all inputs first
    for (let i = 0; i < 6; i++) {
      this.otpForm.get(`digit${i}`)?.setValue('');
    }
    
    // Fill inputs with pasted digits
    for (let i = 0; i < digits.length && i < 6; i++) {
      this.otpForm.get(`digit${i}`)?.setValue(digits[i]);
    }
    
    // Focus on the next empty input or last input
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    setTimeout(() => {
      if (this.otpInputs && this.otpInputs.length > nextEmptyIndex) {
        this.otpInputs.toArray()[nextEmptyIndex].nativeElement.focus();
      }
    }, 0);
  }

  private isAllOtpDigitsFilled(): boolean {
    return this.otpDigits.every(index => {
      const value = this.otpForm.get(`digit${index}`)?.value;
      return value && value.length === 1;
    });
  }

  // Verify OTP
  verifyOtp(): void {
    if (this.otpForm.invalid || !this.customerData) {
      this.markFormGroupTouched(this.otpForm);
      return;
    }

    this.isVerifyingOtp = true;
    // Combine all 6 digits into a single OTP code
    const otpCode = this.otpDigits.map(index => 
      this.otpForm.get(`digit${index}`)?.value
    ).join('');

    this.registerCustomerService.verifyEmailOtp({
      email: this.customerData.customer.email,
      otpCode: otpCode
    }).subscribe({
      next: (response) => {
        this.isVerifyingOtp = false;
        if (response.success) {
          this.toastr.success('OTP verified successfully', 'Success');
          this.currentStep = 'pin-creation';
          // Focus on first PIN input when step changes
          setTimeout(() => {
            if (this.pinInputs && this.pinInputs.length > 0) {
              this.pinInputs.first.nativeElement.focus();
            }
          }, 100);
        } else {
          this.toastr.error(response.message || 'Invalid OTP', 'Error');
        }
      },
      error: (error) => {
        this.isVerifyingOtp = false;
        console.error('Error verifying OTP:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Invalid OTP. Please try again.';
        this.toastr.error(errorMessage, 'Error');
        // Clear OTP form on error
        for (let i = 0; i < 6; i++) {
          this.otpForm.get(`digit${i}`)?.setValue('');
        }
        // Focus on first input
        setTimeout(() => {
          if (this.otpInputs && this.otpInputs.length > 0) {
            this.otpInputs.first.nativeElement.focus();
          }
        }, 100);
      }
    });
  }

  // Resend OTP
  resendOtp(): void {
    if (!this.canResend || !this.customerData) {
      return;
    }

    // Note: The API doesn't have a resend endpoint, so we'll just reset the timer
    // In a real scenario, you might need to call the coupon verification API again
    // Clear all OTP inputs
    for (let i = 0; i < 6; i++) {
      this.otpForm.get(`digit${i}`)?.setValue('');
    }
    this.startResendTimer();
    this.toastr.info('Please request OTP again by verifying coupon', 'Info');
    // Focus on first input
    setTimeout(() => {
      if (this.otpInputs && this.otpInputs.length > 0) {
        this.otpInputs.first.nativeElement.focus();
      }
    }, 100);
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

  // PIN Input Handlers
  onPinDigitInput(event: any, index: number): void {
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
    this.pinForm.get(`pin${index}`)?.setValue(value);
    
    // Move to next input if current is filled
    if (value && index < 5) {
      setTimeout(() => {
        if (this.pinInputs && this.pinInputs.length > index + 1) {
          const nextInput = this.pinInputs.toArray()[index + 1];
          if (nextInput) {
            nextInput.nativeElement.focus();
            nextInput.nativeElement.select();
            return;
          }
        }
        
        const nextInput = document.querySelector(`input[formControlName="pin${index + 1}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 10);
    } else if (value && index === 5) {
      // Move to first confirm PIN input when PIN is complete
      setTimeout(() => {
        if (this.confirmPinInputs && this.confirmPinInputs.length > 0) {
          this.confirmPinInputs.first.nativeElement.focus();
        }
      }, 10);
    }
  }

  onConfirmPinDigitInput(event: any, index: number): void {
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
    this.pinForm.get(`confirmPin${index}`)?.setValue(value);
    
    // Move to next input if current is filled
    if (value && index < 5) {
      setTimeout(() => {
        if (this.confirmPinInputs && this.confirmPinInputs.length > index + 1) {
          const nextInput = this.confirmPinInputs.toArray()[index + 1];
          if (nextInput) {
            nextInput.nativeElement.focus();
            nextInput.nativeElement.select();
            return;
          }
        }
        
        const nextInput = document.querySelector(`input[formControlName="confirmPin${index + 1}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 10);
    }
    
    // Trigger validation check
    this.pinForm.updateValueAndValidity();
  }

  onPinKeyDown(event: KeyboardEvent, index: number, isConfirm: boolean = false): void {
    const input = event.target as HTMLInputElement;
    const inputs = isConfirm ? this.confirmPinInputs : this.pinInputs;
    const prefix = isConfirm ? 'confirmPin' : 'pin';
    
    // Handle backspace
    if (event.key === 'Backspace') {
      const currentValue = input.value;
      if (!currentValue && index > 0) {
        // Move to previous input if current is empty
        if (inputs && inputs.length > index) {
          const prevInput = inputs.toArray()[index - 1];
          if (prevInput) {
            prevInput.nativeElement.focus();
          }
        }
      } else if (!currentValue && index === 0 && isConfirm) {
        // Move to last PIN input if at first confirm PIN input
        setTimeout(() => {
          if (this.pinInputs && this.pinInputs.length > 0) {
            this.pinInputs.last.nativeElement.focus();
          }
        }, 10);
      }
    }
    
    // Handle arrow keys
    if (event.key === 'ArrowLeft' && index > 0) {
      if (inputs && inputs.length > index) {
        const prevInput = inputs.toArray()[index - 1];
        if (prevInput) {
          prevInput.nativeElement.focus();
        }
      }
    }
    
    if (event.key === 'ArrowRight' && index < 5) {
      if (inputs && inputs.length > index + 1) {
        const nextInput = inputs.toArray()[index + 1];
        if (nextInput) {
          nextInput.nativeElement.focus();
        }
      }
    }
  }

  onPinPaste(event: ClipboardEvent, isConfirm: boolean = false): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    const prefix = isConfirm ? 'confirmPin' : 'pin';
    const inputs = isConfirm ? this.confirmPinInputs : this.pinInputs;
    
    // Clear all inputs first
    for (let i = 0; i < 6; i++) {
      this.pinForm.get(`${prefix}${i}`)?.setValue('');
    }
    
    // Fill inputs with pasted digits
    for (let i = 0; i < digits.length && i < 6; i++) {
      this.pinForm.get(`${prefix}${i}`)?.setValue(digits[i]);
    }
    
    // Focus on the next empty input or last input
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    setTimeout(() => {
      if (inputs && inputs.length > nextEmptyIndex) {
        inputs.toArray()[nextEmptyIndex].nativeElement.focus();
      }
      
      // Trigger validation
      this.pinForm.updateValueAndValidity();
    }, 0);
  }

  // Create PIN
  createPin(): void {
    if (this.pinForm.invalid || !this.customerData) {
      this.markFormGroupTouched(this.pinForm);
      return;
    }

    this.isCreatingPin = true;
    // Combine all 6 PIN digits into a single PIN string
    const pin = this.pinDigits.map(index => 
      this.pinForm.get(`pin${index}`)?.value
    ).join('');

    this.registerCustomerService.createPin(this.customerData.customer.id, pin).subscribe({
      next: (response) => {
        this.isCreatingPin = false;
        if (response.success && response.token) {
          // Store token
          this.tokenService.setToken(response.token);
          
          // Decode and store user data from token
          try {
            const base64Url = response.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const userData = JSON.parse(jsonPayload);
            this.tokenService.setUser(userData);
          } catch (error) {
            console.error('Error decoding token:', error);
          }

          this.toastr.success(response.message || 'PIN created successfully', 'Success');
          
          // Navigate to service selection page
          this.router.navigate(['/customer/service-selection']);
        } else {
          this.toastr.error(response.message || 'Failed to create PIN', 'Error');
        }
      },
      error: (error) => {
        this.isCreatingPin = false;
        console.error('Error creating PIN:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Failed to create PIN. Please try again.';
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  submitRegistration(): void {
    if (this.registrationForm.valid) {
      this.isSubmitting = true;
      
      // Simulate API call with 2-second delay
      setTimeout(() => {
        this.isSubmitting = false;
        
        // Get form data
        const formData = this.registrationForm.value;
        
        // Navigate to customer login page after successful registration
        this.router.navigate(['/customer/login'], {
          queryParams: {
            message: 'Registration successful! Please login with your credentials.',
            email: formData.email
          }
        });
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.registrationForm);
    }
  }

  goBackToCouponVerification(): void {
    this.currentStep = 'coupon-verification';
    this.couponVerificationForm.reset();
    this.verifiedCouponNumber = '';
    this.couponCode1 = '';
    this.couponCode2 = '';
    this.couponCode3 = '';
    this.customerData = null;
    // Clear all OTP inputs
    for (let i = 0; i < 6; i++) {
      this.otpForm.get(`digit${i}`)?.setValue('');
    }
    this.pinForm.reset();
    if (this.resendTimerInterval) {
      clearInterval(this.resendTimerInterval);
      this.resendTimer = 0;
      this.canResend = false;
    }
  }

  goBackToOtpVerification(): void {
    this.currentStep = 'otp-verification';
    // Clear all OTP inputs
    for (let i = 0; i < 6; i++) {
      this.otpForm.get(`digit${i}`)?.setValue('');
    }
    // Clear all PIN inputs
    for (let i = 0; i < 6; i++) {
      this.pinForm.get(`pin${i}`)?.setValue('');
      this.pinForm.get(`confirmPin${i}`)?.setValue('');
    }
    // Focus on first input when returning to OTP step
    setTimeout(() => {
      if (this.otpInputs && this.otpInputs.length > 0) {
        this.otpInputs.first.nativeElement.focus();
      }
    }, 100);
  }

  goToSignIn(): void {
    this.router.navigate(['/customer/login']);
  }

  private markCouponFormTouched(): void {
    Object.keys(this.couponVerificationForm.controls).forEach(key => {
      const control = this.couponVerificationForm.get(key);
      control?.markAsTouched();
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for form validation
  get couponCode1Control() {
    return this.couponVerificationForm.get('couponCode1');
  }

  get couponCode2Control() {
    return this.couponVerificationForm.get('couponCode2');
  }

  get couponCode3Control() {
    return this.couponVerificationForm.get('couponCode3');
  }

  get fullNameControl() {
    return this.registrationForm.get('fullName');
  }

  get emailControl() {
    return this.registrationForm.get('email');
  }

  get countryCodeControl() {
    return this.registrationForm.get('countryCode');
  }

  get phoneControl() {
    return this.registrationForm.get('phone');
  }

  get passwordControl() {
    return this.registrationForm.get('password');
  }

  get confirmPasswordControl() {
    return this.registrationForm.get('confirmPassword');
  }

  get otpControl() {
    // Return the first digit control for validation display purposes
    return this.otpForm.get('digit0');
  }

  get pinControl() {
    // Return the first PIN digit control for validation display purposes
    return this.pinForm.get('pin0');
  }

  get confirmPinControl() {
    // Return the first confirm PIN digit control for validation display purposes
    return this.pinForm.get('confirmPin0');
  }
}