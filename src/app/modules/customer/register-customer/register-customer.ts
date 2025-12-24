import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterCustomerService } from './register-customer.service';
import { VerifyCouponResponse } from './register-customer.model';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from '../../../core/services/token.service';
import { ContactVerificationComponent } from '../components/contact-verification/contact-verification.component';
import { CouponSaleService } from '../../coupons/service/coupon-sale.service';
import { CreateInvoiceRequest, CreateInvoiceResponse } from '../../coupons/model/coupon-sale.model';
import { CustomerByMobileResponse } from '../services/customer-verify.service';
import { CustomerRegisterService, RegisterCustomerRequest } from '../services/customer-register.service';

@Component({
  selector: 'app-register-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ContactVerificationComponent],
  templateUrl: './register-customer.html',
  styleUrls: ['./register-customer.scss']
})
export class RegisterCustomerComponent implements OnInit, OnDestroy {
  @ViewChildren('pinInput') pinInputs!: QueryList<ElementRef>;
  @ViewChildren('confirmPinInput') confirmPinInputs!: QueryList<ElementRef>;
  @ViewChild(ContactVerificationComponent) contactVerificationComponent!: ContactVerificationComponent;
  
  currentStep: 'coupon-verification' | 'phone-verification' | 'email-verification' | 'customer-details-add' | 'pin-creation' = 'coupon-verification';
  verificationType: 'phone' | 'email' = 'phone'; // Track verification type for header display
  verifiedEmailForForm: string = ''; // Store verified email for customer form
  verifiedPhoneForForm: string = ''; // Store verified phone for customer form
  verifiedCountryCodeForForm: string = '+971'; // Store verified country code for customer form
  couponVerificationForm: FormGroup;
  pinForm: FormGroup;
  isSubmitting = false;
  isCreatingPin = false;
  verifiedCouponNumber: string = '';
  couponCode1: string = '';
  couponCode2: string = '';
  couponCode3: string = '';
  verifyCouponResponse: VerifyCouponResponse | null = null;
  couponId: number | null = null;
  customerId: number | null = null;
  pinDigits: number[] = [0, 1, 2, 3];
  
  // Customer data from contact verification
  verifiedCustomerData: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    countryCode?: string;
    captchaToken?: string;
  } | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registerCustomerService: RegisterCustomerService,
    private toastr: ToastrService,
    private tokenService: TokenService,
    private couponSaleService: CouponSaleService,
    private customerRegisterService: CustomerRegisterService
  ) {
    // Coupon verification form with separate inputs (4-5-4 format) and single input for mobile
    this.couponVerificationForm = this.fb.group({
      couponCode1: ['', []],
      couponCode2: ['', []],
      couponCode3: ['', []],
      fullCouponCode: ['', []]
    }, { validators: this.couponCodeValidator });

    // PIN form with 4 separate inputs for PIN and Confirm PIN
    this.pinForm = this.fb.group({
      pin0: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin1: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin2: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin3: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin0: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin1: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin2: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin3: ['', [Validators.required, Validators.pattern(/[0-9]/)]]
    }, { validators: this.pinMatchValidator });
  }

  ngOnInit(): void {
    // Focus on first OTP input when OTP step is shown
    // This will be handled when step changes
  }

  ngOnDestroy(): void {
    // Timers are handled in contact-verification component
  }


  // Coupon code validator - validates either full code or three parts
  couponCodeValidator(form: FormGroup) {
    const fullCode = form.get('fullCouponCode')?.value || '';
    const code1 = form.get('couponCode1')?.value || '';
    const code2 = form.get('couponCode2')?.value || '';
    const code3 = form.get('couponCode3')?.value || '';

    // If full code is provided, validate it (13 characters for 4-5-4 format)
    if (fullCode) {
      const cleaned = fullCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      if (cleaned.length === 13 && /^[A-Z0-9]{13}$/.test(cleaned)) {
        // Valid full code, clear errors on parts
        form.get('couponCode1')?.setErrors(null);
        form.get('couponCode2')?.setErrors(null);
        form.get('couponCode3')?.setErrors(null);
        form.get('fullCouponCode')?.setErrors(null);
        return null;
      } else {
        form.get('fullCouponCode')?.setErrors({ invalidCoupon: true });
        return { invalidCoupon: true };
      }
    }

    // If three parts are provided, validate them (4-5-4 format)
    if (code1 || code2 || code3) {
      const isValid1 = !code1 || /^[A-Z0-9]{4}$/.test(code1);
      const isValid2 = !code2 || /^[A-Z0-9]{5}$/.test(code2);
      const isValid3 = !code3 || /^[A-Z0-9]{4}$/.test(code3);

      if (!isValid1) {
        form.get('couponCode1')?.setErrors({ invalidCoupon: true });
      } else {
        form.get('couponCode1')?.setErrors(null);
      }

      if (!isValid2) {
        form.get('couponCode2')?.setErrors({ invalidCoupon: true });
      } else {
        form.get('couponCode2')?.setErrors(null);
      }

      if (!isValid3) {
        form.get('couponCode3')?.setErrors({ invalidCoupon: true });
      } else {
        form.get('couponCode3')?.setErrors(null);
      }

      // Check if all three parts are complete
      if (code1 && code2 && code3 && isValid1 && isValid2 && isValid3) {
        return null;
      } else if (code1 || code2 || code3) {
        return { incomplete: true };
      }
    }

    // No input provided
    return { required: true };
  }

  // PIN match validator
  pinMatchValidator(form: FormGroup) {
    // Combine PIN digits
    const pin = [0, 1, 2, 3].map(i => form.get(`pin${i}`)?.value).join('');
    const confirmPin = [0, 1, 2, 3].map(i => form.get(`confirmPin${i}`)?.value).join('');
    
    if (pin && confirmPin && pin.length === 4 && confirmPin.length === 4 && pin !== confirmPin) {
      // Set error on all confirmPin fields
      for (let i = 0; i < 4; i++) {
        form.get(`confirmPin${i}`)?.setErrors({ pinMismatch: true });
      }
      return { pinMismatch: true };
    }
    
    // Clear errors if PINs match
    if (pin === confirmPin && pin.length === 4) {
      for (let i = 0; i < 4; i++) {
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

  // Handle full coupon code input (for mobile) - 13 characters (4-5-4 format)
  onFullCouponCodeInput(event: any): void {
    const value = event.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const trimmedValue = value.substring(0, 13);
    
    // Update form control
    this.couponVerificationForm.patchValue({ fullCouponCode: trimmedValue }, { emitEvent: false });
    
    // Also sync to three-part inputs for consistency (4-5-4 format)
    if (trimmedValue.length >= 4) {
      this.couponCode1 = trimmedValue.substring(0, 4);
      this.couponVerificationForm.patchValue({ couponCode1: this.couponCode1 }, { emitEvent: false });
    }
    if (trimmedValue.length >= 9) {
      this.couponCode2 = trimmedValue.substring(4, 9);
      this.couponVerificationForm.patchValue({ couponCode2: this.couponCode2 }, { emitEvent: false });
    }
    if (trimmedValue.length >= 13) {
      this.couponCode3 = trimmedValue.substring(9, 13);
      this.couponVerificationForm.patchValue({ couponCode3: this.couponCode3 }, { emitEvent: false });
    }
    
    // Trigger validation
    this.couponVerificationForm.updateValueAndValidity();
  }

  // Coupon Code Input Handlers (4-5-4 format)
  onCouponCodeInput(event: any, part: number): void {
    // Allow alphanumeric characters and convert to uppercase
    const value = event.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const maxLength = part === 2 ? 5 : 4; // Part 1: 4 chars, Part 2: 5 chars, Part 3: 4 chars
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
      if (trimmedValue.length === 5) {
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-part="3"]`) as HTMLInputElement;
          nextInput?.focus();
        }, 0);
      }
    } else if (part === 3) {
      this.couponVerificationForm.patchValue({ couponCode3: trimmedValue }, { emitEvent: false });
      this.couponCode3 = trimmedValue;
    }
    
    // Sync to full coupon code input
    const fullCode = `${this.couponCode1}${this.couponCode2}${this.couponCode3}`;
    this.couponVerificationForm.patchValue({ fullCouponCode: fullCode }, { emitEvent: false });
    
    // Trigger validation
    this.couponVerificationForm.updateValueAndValidity();
  }

  // Handle paste event for coupon code inputs
  onCouponCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    
    // Remove dashes, spaces, and convert to uppercase
    const cleanedData = pastedData.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Check if pasting into full coupon code input or three-part inputs
    const target = event.target as HTMLInputElement;
    const isFullInput = target.getAttribute('formControlName') === 'fullCouponCode';
    
    if (isFullInput) {
      // Paste into full input (4-5-4 format, 13 characters total)
      const trimmedData = cleanedData.substring(0, 13);
      this.couponVerificationForm.patchValue({ fullCouponCode: trimmedData }, { emitEvent: false });
      
      // Also sync to three-part inputs (4-5-4 format)
      if (trimmedData.length >= 4) {
        this.couponCode1 = trimmedData.substring(0, 4);
        this.couponVerificationForm.patchValue({ couponCode1: this.couponCode1 }, { emitEvent: false });
      }
      if (trimmedData.length >= 9) {
        this.couponCode2 = trimmedData.substring(4, 9);
        this.couponVerificationForm.patchValue({ couponCode2: this.couponCode2 }, { emitEvent: false });
      }
      if (trimmedData.length >= 13) {
        this.couponCode3 = trimmedData.substring(9, 13);
        this.couponVerificationForm.patchValue({ couponCode3: this.couponCode3 }, { emitEvent: false });
      }
      
      this.couponVerificationForm.updateValueAndValidity();
    } else {
      // Paste into three-part inputs (4-5-4 format)
      if (cleanedData.length === 13) {
        const part1 = cleanedData.substring(0, 4);
        const part2 = cleanedData.substring(4, 9);
        const part3 = cleanedData.substring(9, 13);
        
        // Update form controls
        this.couponVerificationForm.patchValue({
          couponCode1: part1,
          couponCode2: part2,
          couponCode3: part3,
          fullCouponCode: cleanedData
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
        // If it's not exactly 13 characters, try to fill what we can (4-5-4 format)
        const part1 = cleanedData.substring(0, 4);
        const part2 = cleanedData.substring(4, 9);
        const part3 = cleanedData.substring(9, 13);
        
        this.couponVerificationForm.patchValue({
          couponCode1: part1 || '',
          couponCode2: part2 || '',
          couponCode3: part3 || '',
          fullCouponCode: cleanedData.substring(0, 13)
        }, { emitEvent: false });
        
        this.couponCode1 = part1 || '';
        this.couponCode2 = part2 || '';
        this.couponCode3 = part3 || '';
        
        // Focus on the appropriate input
        setTimeout(() => {
          let focusPart = 1;
          if (cleanedData.length > 4) focusPart = 2;
          if (cleanedData.length > 9) focusPart = 3;
          const focusInput = document.querySelector(`input[data-part="${focusPart}"]`) as HTMLInputElement;
          focusInput?.focus();
        }, 0);
      }
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
      
      // Get coupon code from either full input or three parts
      let fullCouponCode = '';
      const fullCodeControl = this.couponVerificationForm.get('fullCouponCode');
      const fullCodeValue = fullCodeControl?.value || '';
      
      if (fullCodeValue) {
        // Use full code input (for mobile)
        fullCouponCode = fullCodeValue.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      } else {
        // Combine the three parts (for desktop)
        fullCouponCode = `${this.couponCode1}${this.couponCode2}${this.couponCode3}`;
      }
      
      // Call new verify coupon API
      this.registerCustomerService.verifyCoupon(fullCouponCode).subscribe({
        next: (response: VerifyCouponResponse) => {
          this.isSubmitting = false;
          this.verifyCouponResponse = response;
          this.verifiedCouponNumber = fullCouponCode;
          this.couponId = response.coupon.couponId;
          
          // Handle different scenarios based on response
          if (response.customer !== null) {
            // Customer exists
            this.customerId = response.customer.id;
            
            if (response.hasPin) {
              // Customer has PIN, redirect to login
              this.toastr.info('Customer already registered. Please login.', 'Info');
              this.router.navigate(['/customer/login'], {
                queryParams: {
                  email: response.customer.email
                }
              });
            } else {
              // Customer exists but no PIN, show PIN creation
              this.currentStep = 'pin-creation';
              setTimeout(() => {
                if (this.pinInputs && this.pinInputs.length > 0) {
                  this.pinInputs.first.nativeElement.focus();
                }
              }, 100);
            }
          } else {
            // Customer is null, proceed to phone verification
            this.currentStep = 'phone-verification';
            this.verificationType = 'phone'; // Default to phone verification
          }
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

  // Contact Verification Handlers
  onPhoneVerified(event: { phoneNumber: string; customer: CustomerByMobileResponse | null }): void {
    if (event.customer) {
      // Customer exists, create invoice with existing customer
      this.verificationType = 'phone';
      this.verifiedCustomerData = {
        firstName: event.customer.firstName,
        lastName: event.customer.lastName,
        email: event.customer.email,
        mobileNumber: event.customer.mobileNumber
      };
      this.customerId = event.customer.id;
      this.createInvoice();
    } else {
      // If customer is null, contact verification component will proceed to email verification
      // Update step and verification type to email so header shows correctly
      this.currentStep = 'email-verification';
      this.verificationType = 'email';
      // Store verified phone for customer form
      this.verifiedPhoneForForm = event.phoneNumber;
    }
  }

  onEmailVerified(event: { email: string; phoneNumber?: string; countryCode?: string }): void {
    // Update step to email verification when email verification step is reached
    this.verificationType = 'email';
    // Store verified email, phone, and country code for customer form
    this.verifiedEmailForForm = event.email;
    if (event.phoneNumber) {
      this.verifiedPhoneForForm = event.phoneNumber;
    }
    if (event.countryCode) {
      this.verifiedCountryCodeForForm = event.countryCode;
    }
    // Note: If customer form is shown immediately after, onCustomerFormShown will override this
  }

  onCustomerFormShown(): void {
    // Update step to customer-details-add when customer form is shown
    this.currentStep = 'customer-details-add';
  }

  onCustomerFormSubmit(customerData: any): void {
    this.verifiedCustomerData = {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      mobileNumber: customerData.mobileNumber,
      countryCode: customerData.countryCode,
      captchaToken: customerData.captchaToken
    };
    this.createInvoice();
  }

  createInvoice(): void {
    if (!this.verifiedCustomerData || !this.couponId || !this.verifiedCouponNumber) {
      this.toastr.error('Missing required data', 'Error');
      this.onCustomerFormError();
      return;
    }

    const request: RegisterCustomerRequest = {
      firstName: this.verifiedCustomerData.firstName,
      lastName: this.verifiedCustomerData.lastName,
      email: this.verifiedCustomerData.email,
      mobileNumber: this.verifiedCustomerData.mobileNumber,
      countryCode: this.verifiedCustomerData.countryCode,
      couponId: this.couponId,
      couponCode: this.verifiedCouponNumber,
      paymentMethod: 'Cash', // Default payment method
      captchaToken: this.verifiedCustomerData.captchaToken
    };

    this.customerRegisterService.registerCustomer(request).subscribe({
      next: (response) => {
        this.toastr.success('Customer registered successfully', 'Success');
        // Update customerId from response if available
        if (response.customer?.id) {
          this.customerId = response.customer.id;
        }
        // Proceed to PIN creation
        this.currentStep = 'pin-creation';
        setTimeout(() => {
          if (this.pinInputs && this.pinInputs.length > 0) {
            this.pinInputs.first.nativeElement.focus();
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error registering customer:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Failed to register customer. Please try again.';
        this.toastr.error(errorMessage, 'Error');
        this.onCustomerFormError();
      }
    });
  }

  onCustomerFormError(): void {
    // Reset the submitting state in contact verification component
    if (this.contactVerificationComponent) {
      this.contactVerificationComponent.resetCustomerFormSubmission();
    }
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
    if (value && index < 3) {
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
    } else if (value && index === 3) {
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
    if (value && index < 3) {
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
    
    if (event.key === 'ArrowRight' && index < 3) {
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
    const digits = pastedData.replace(/\D/g, '').slice(0, 4);
    const prefix = isConfirm ? 'confirmPin' : 'pin';
    const inputs = isConfirm ? this.confirmPinInputs : this.pinInputs;
    
    // Clear all inputs first
    for (let i = 0; i < 4; i++) {
      this.pinForm.get(`${prefix}${i}`)?.setValue('');
    }
    
    // Fill inputs with pasted digits
    for (let i = 0; i < digits.length && i < 4; i++) {
      this.pinForm.get(`${prefix}${i}`)?.setValue(digits[i]);
    }
    
    // Focus on the next empty input or last input
    const nextEmptyIndex = digits.length < 4 ? digits.length : 3;
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
    if (this.pinForm.invalid || !this.customerId) {
      this.markFormGroupTouched(this.pinForm);
      return;
    }

    this.isCreatingPin = true;
    // Combine all 4 PIN digits into a single PIN string
    const pin = this.pinDigits.map(index => 
      this.pinForm.get(`pin${index}`)?.value
    ).join('');

    this.registerCustomerService.createPin(this.customerId, pin).subscribe({
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

  goBackToCouponVerification(): void {
    this.currentStep = 'coupon-verification';
    this.couponVerificationForm.reset();
    this.verifiedCouponNumber = '';
    this.couponCode1 = '';
    this.couponCode2 = '';
    this.couponCode3 = '';
    this.verifyCouponResponse = null;
    this.couponId = null;
    this.customerId = null;
    this.verifiedCustomerData = null;
    this.pinForm.reset();
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

  get fullCouponCodeControl() {
    return this.couponVerificationForm.get('fullCouponCode');
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