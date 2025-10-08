import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register-customer.html',
  styleUrls: ['./register-customer.scss']
})
export class RegisterCustomerComponent implements OnInit {
  currentStep: 'coupon-verification' | 'registration' = 'coupon-verification';
  couponVerificationForm: FormGroup;
  registrationForm: FormGroup;
  isSubmitting = false;
  verifiedCouponNumber: string = '';
  
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
    private router: Router
  ) {
    // Coupon verification form
    this.couponVerificationForm = this.fb.group({
      couponNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });

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
    // Component initialization
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

  verifyCoupon(): void {
    if (this.couponVerificationForm.valid) {
      this.isSubmitting = true;
      
      // Simulate API call to verify coupon
      setTimeout(() => {
        this.isSubmitting = false;
        
        const couponNumber = this.couponVerificationForm.get('couponNumber')?.value;
        
        // Mock verification - in real app, this would call an API
        if (this.isValidCoupon(couponNumber)) {
          this.verifiedCouponNumber = couponNumber;
          this.currentStep = 'registration';
        } else {
          // Show error message
          this.couponVerificationForm.get('couponNumber')?.setErrors({ invalidCoupon: true });
        }
      }, 1500);
    } else {
      this.markCouponFormTouched();
    }
  }

  private isValidCoupon(couponNumber: string): boolean {
    // Mock validation - accept any 10-digit number
    return /^[0-9]{10}$/.test(couponNumber);
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
      this.markFormGroupTouched();
    }
  }

  goBackToCouponVerification(): void {
    this.currentStep = 'coupon-verification';
    this.couponVerificationForm.reset();
    this.verifiedCouponNumber = '';
  }

  goToSignIn(): void {
    this.router.navigate(['/customer/login']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  private markCouponFormTouched(): void {
    Object.keys(this.couponVerificationForm.controls).forEach(key => {
      const control = this.couponVerificationForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for form validation
  get couponNumberControl() {
    return this.couponVerificationForm.get('couponNumber');
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
}