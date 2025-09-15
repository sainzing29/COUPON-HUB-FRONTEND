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
  registrationForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      couponNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['']
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  submitRegistration(): void {
    if (this.registrationForm.valid) {
      this.isSubmitting = true;
      
      // Simulate API call with 2-second delay
      setTimeout(() => {
        this.isSubmitting = false;
        
        // Get form data
        const formData = this.registrationForm.value;
        
        // Navigate to OTP verification page with customer data
        this.router.navigate(['/customer/otp-verification'], {
          queryParams: {
            customerName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            couponNumber: formData.couponNumber,
            address: formData.address
          }
        });
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for form validation
  get fullNameControl() {
    return this.registrationForm.get('fullName');
  }

  get emailControl() {
    return this.registrationForm.get('email');
  }

  get phoneControl() {
    return this.registrationForm.get('phone');
  }

  get couponNumberControl() {
    return this.registrationForm.get('couponNumber');
  }
}