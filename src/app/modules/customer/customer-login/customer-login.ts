import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerAuthService } from '../services/customer-auth.service';
import { TokenService } from '../../../core/services/token.service';
import { ToastrService } from 'ngx-toastr';
import { CountryCodeSelectorComponent } from '../../../modules/organization/components/country-code-selector/country-code-selector.component';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CountryCodeSelectorComponent],
  templateUrl: './customer-login.html',
  styleUrls: ['./customer-login.scss']
})
export class CustomerLoginComponent implements OnInit {
  @ViewChildren('pinInput') pinInputs!: QueryList<ElementRef>;
  
  loginForm: FormGroup;
  isSubmitting = false;
  showError = false;
  errorMessage = '';
  successMessage = '';
  showSuccess = false;
  pinDigits: number[] = [0, 1, 2, 3];
  pinInputsReadonly: boolean[] = [true, true, true, true]; // Start as readonly to prevent autofill
  loginMethod: 'email' | 'phone' = 'phone'; // Default to phone
  selectedCountryCode: string = '+971'; // Default to UAE

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private customerAuthService: CustomerAuthService,
    private tokenService: TokenService,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      loginMethod: ['phone', [Validators.required]], // Default to phone
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]+$/)]],
      countryCode: ['+971', [Validators.required]], // Default to UAE
      pin0: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin1: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin2: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin3: ['', [Validators.required, Validators.pattern(/[0-9]/)]]
    });

    // Ensure all PIN fields start empty
    for (let i = 0; i < 4; i++) {
      this.loginForm.get(`pin${i}`)?.setValue('', { emitEvent: false });
    }

    // Update validators based on login method
    this.updateValidators();
  }

  ngOnInit(): void {
    // Check for registration success message
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.successMessage = params['message'];
        this.showSuccess = true;
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          this.showSuccess = false;
        }, 5000);
      }
      
      // Pre-fill email if provided
      if (params['email']) {
        this.loginForm.patchValue({
          loginMethod: 'email',
          email: params['email']
        });
        this.loginMethod = 'email';
        this.updateValidators();
      }
    });
    
    // Focus on first PIN input after component loads (removed to prevent visual artifact)
    // setTimeout(() => {
    //   if (this.pinInputs && this.pinInputs.length > 0) {
    //     this.pinInputs.first.nativeElement.focus();
    //   }
    // }, 100);
  }

  onLoginMethodChange(): void {
    this.loginMethod = this.loginForm.get('loginMethod')?.value;
    this.updateValidators();
    
    // Clear the other field when switching methods and mark as untouched to prevent validation errors
    if (this.loginMethod === 'email') {
      this.loginForm.patchValue({ phone: '', countryCode: '+971' });
      this.loginForm.get('phone')?.markAsUntouched();
      this.loginForm.get('countryCode')?.markAsUntouched();
    } else {
      this.loginForm.patchValue({ email: '' });
      this.loginForm.get('email')?.markAsUntouched();
    }
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, ''); // Remove all non-digit characters
    if (input.value !== value) {
      input.value = value;
      this.loginForm.get('phone')?.setValue(value, { emitEvent: false });
    }
  }

  private updateValidators(): void {
    const emailControl = this.loginForm.get('email');
    const phoneControl = this.loginForm.get('phone');
    
    if (this.loginMethod === 'email') {
      emailControl?.setValidators([Validators.required, Validators.email]);
      phoneControl?.clearValidators();
    } else {
      emailControl?.clearValidators();
      phoneControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]+$/)]);
    }
    
    emailControl?.updateValueAndValidity();
    phoneControl?.updateValueAndValidity();
  }

  // PIN Input Handlers
  onPinDigitInput(event: any, index: number): void {
    // Remove readonly on first interaction
    if (this.pinInputsReadonly[index]) {
      this.pinInputsReadonly[index] = false;
    }
    
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
    this.loginForm.get(`pin${index}`)?.setValue(value);
    
    // Move to next input if current is filled
    if (value && index < 3) {
      // Use requestAnimationFrame for better mobile keyboard compatibility
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (this.pinInputs && this.pinInputs.length > index + 1) {
            const nextInput = this.pinInputs.toArray()[index + 1];
            if (nextInput) {
              nextInput.nativeElement.focus();
              // Don't select on mobile as it can close the keyboard
              return;
            }
          }
          
          const nextInput = document.querySelector(`input[formControlName="pin${index + 1}"]`) as HTMLInputElement;
          if (nextInput) {
            nextInput.focus();
          }
        });
      });
    }
  }

  onPinKeyDown(event: KeyboardEvent, index: number): void {
    // Remove readonly on first interaction
    if (this.pinInputsReadonly[index]) {
      this.pinInputsReadonly[index] = false;
    }
    
    const input = event.target as HTMLInputElement;
    
    // Handle backspace
    if (event.key === 'Backspace') {
      const currentValue = input.value;
      if (!currentValue && index > 0) {
        // Move to previous input if current is empty
        if (this.pinInputs && this.pinInputs.length > index) {
          const prevInput = this.pinInputs.toArray()[index - 1];
          if (prevInput) {
            prevInput.nativeElement.focus();
          }
        }
      }
    }
    
    // Handle arrow keys
    if (event.key === 'ArrowLeft' && index > 0) {
      if (this.pinInputs && this.pinInputs.length > index) {
        const prevInput = this.pinInputs.toArray()[index - 1];
        if (prevInput) {
          prevInput.nativeElement.focus();
      }
      }
    }
    
    if (event.key === 'ArrowRight' && index < 3) {
      if (this.pinInputs && this.pinInputs.length > index + 1) {
        const nextInput = this.pinInputs.toArray()[index + 1];
        if (nextInput) {
          nextInput.nativeElement.focus();
        }
      }
    }
  }

  onPinPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 4);
    
    // Remove readonly from all inputs
    for (let i = 0; i < 4; i++) {
      this.pinInputsReadonly[i] = false;
    }
    
    // Clear all inputs first
    for (let i = 0; i < 4; i++) {
      this.loginForm.get(`pin${i}`)?.setValue('');
    }
    
    // Fill inputs with pasted digits
    for (let i = 0; i < digits.length && i < 4; i++) {
      this.loginForm.get(`pin${i}`)?.setValue(digits[i]);
    }
    
    // Focus on the next empty input or last input
    const nextEmptyIndex = digits.length < 4 ? digits.length : 3;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.pinInputs && this.pinInputs.length > nextEmptyIndex) {
          this.pinInputs.toArray()[nextEmptyIndex].nativeElement.focus();
        }
      });
    });
  }

  onPinFocus(index: number): void {
    // Remove readonly on focus
    if (this.pinInputsReadonly[index]) {
      this.pinInputsReadonly[index] = false;
    }
  }

  submitLogin(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.showError = false;
      
      // Get form data
      const formData = this.loginForm.value;
      
      // Combine all 4 PIN digits into a single PIN string
      const pin = this.pinDigits.map(index => 
        this.loginForm.get(`pin${index}`)?.value
      ).join('');
      
      // Prepare request payload based on selected login method
      const loginRequest: any = {
        pin: pin
      };
      
      if (this.loginMethod === 'email') {
        loginRequest.email = formData.email.trim();
      } else {
        // Send countryCode and mobileNumber separately
        const countryCode = formData.countryCode || '+971';
        const phoneNumber = formData.phone.trim();
        loginRequest.mobileNumber = phoneNumber;
        loginRequest.countryCode = countryCode;
      }
      
      // Call customer login API
      this.customerAuthService.customerLogin(loginRequest).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.token) {
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

            this.toastr.success('Login successful', 'Success');
            
            // Navigate to service selection page
            this.router.navigate(['/customer/service-selection']);
          } else {
            this.showErrorMessage('Login failed. Please check your credentials.');
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error during login:', error);
          const errorMessage = error.error?.message || error.error?.error || 'Login failed. Please check your credentials and try again.';
          this.showErrorMessage(errorMessage);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;
    
    setTimeout(() => {
      this.showError = false;
    }, 3000);
  }

  goToRegister(): void {
    this.router.navigate(['/customer/register']);
  }

  goToForgotPin(): void {
    // Pre-fill email if available
    const email = this.loginForm.get('email')?.value;
    if (email && this.loginMethod === 'email') {
      this.router.navigate(['/customer/forgot-pin'], {
        queryParams: { email: email }
      });
    } else {
      this.router.navigate(['/customer/forgot-pin']);
    }
  }

  // Getters for form validation
  get emailControl() {
    return this.loginForm.get('email');
  }

  get phoneControl() {
    return this.loginForm.get('phone');
  }

  get countryCodeControl() {
    return this.loginForm.get('countryCode');
  }

  get pinControl() {
    // Return the first PIN digit control for validation display purposes
    return this.loginForm.get('pin0');
  }
}
