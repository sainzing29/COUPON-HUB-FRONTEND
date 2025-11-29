import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerAuthService } from '../services/customer-auth.service';
import { ToastrService } from 'ngx-toastr';
import { CountryCodeSelectorComponent } from '../../../modules/organization/components/country-code-selector/country-code-selector.component';

@Component({
  selector: 'app-forgot-pin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CountryCodeSelectorComponent],
  templateUrl: './forgot-pin.component.html',
  styleUrls: ['./forgot-pin.component.scss']
})
export class ForgotPinComponent implements OnInit {
  forgotPinForm: FormGroup;
  isSubmitting = false;
  showError = false;
  showSuccess = false;
  errorMessage = '';
  successMessage = '';
  resetMethod: 'email' | 'phone' = 'phone'; // Default to phone
  selectedCountryCode: string = '+971'; // Default to UAE

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customerAuthService: CustomerAuthService,
    private toastr: ToastrService
  ) {
    this.forgotPinForm = this.fb.group({
      resetMethod: ['phone', [Validators.required]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]+$/)]],
      countryCode: ['+971', [Validators.required]]
    });

    this.updateValidators();
  }

  ngOnInit(): void {
    // Check if email is pre-filled from query params
    this.router.routerState.root.queryParams.subscribe(params => {
      if (params['email']) {
        this.forgotPinForm.patchValue({
          resetMethod: 'email',
          email: params['email']
        });
        this.resetMethod = 'email';
        this.updateValidators();
      }
    });
  }

  onResetMethodChange(): void {
    this.resetMethod = this.forgotPinForm.get('resetMethod')?.value;
    this.updateValidators();
    
    // Clear the other field when switching methods
    if (this.resetMethod === 'email') {
      this.forgotPinForm.patchValue({ phone: '', countryCode: '+971' });
      this.forgotPinForm.get('phone')?.markAsUntouched();
      this.forgotPinForm.get('countryCode')?.markAsUntouched();
    } else {
      this.forgotPinForm.patchValue({ email: '' });
      this.forgotPinForm.get('email')?.markAsUntouched();
    }
  }

  private updateValidators(): void {
    const emailControl = this.forgotPinForm.get('email');
    const phoneControl = this.forgotPinForm.get('phone');
    
    if (this.resetMethod === 'email') {
      emailControl?.setValidators([Validators.required, Validators.email]);
      phoneControl?.clearValidators();
    } else {
      emailControl?.clearValidators();
      phoneControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]+$/)]);
    }
    
    emailControl?.updateValueAndValidity();
    phoneControl?.updateValueAndValidity();
  }

  submitRequest(): void {
    if (this.forgotPinForm.valid) {
      this.isSubmitting = true;
      this.showError = false;
      this.showSuccess = false;
      
      const formData = this.forgotPinForm.value;
      let email: string | undefined;
      let mobileNumber: string | undefined;
      
      if (this.resetMethod === 'email') {
        email = formData.email.trim();
      } else {
        const countryCode = formData.countryCode || '+971';
        const phoneNumber = formData.phone.trim();
        mobileNumber = `${countryCode}${phoneNumber}`;
      }
      
      this.customerAuthService.requestPinReset(email, mobileNumber).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.showSuccess = true;
          this.successMessage = response.message || 'PIN reset link has been sent to your registered contact.';
          this.toastr.success(this.successMessage, 'Success');
          
          // Clear form after success
          this.forgotPinForm.reset({
            resetMethod: this.resetMethod,
            countryCode: '+971'
          });
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error requesting PIN reset:', error);
          const errorMsg = error.error?.message || error.error?.error || 'Failed to request PIN reset. Please try again.';
          this.errorMessage = errorMsg;
          this.showError = true;
          this.toastr.error(errorMsg, 'Error');
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.forgotPinForm.controls).forEach(key => {
        const control = this.forgotPinForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/customer/login']);
  }

  // Getters for form validation
  get emailControl() {
    return this.forgotPinForm.get('email');
  }

  get phoneControl() {
    return this.forgotPinForm.get('phone');
  }

  get countryCodeControl() {
    return this.forgotPinForm.get('countryCode');
  }
}

