import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerAuthService } from '../services/customer-auth.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './customer-login.html',
  styleUrls: ['./customer-login.scss']
})
export class CustomerLoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  showError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customerAuthService: CustomerAuthService
  ) {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]]
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  submitLogin(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.showError = false;
      
      // Get form data
      const formData = this.loginForm.value;
      
      // Use auth service to send OTP
      this.customerAuthService.login(formData.phone).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            // Navigate to OTP verification page with phone number
            this.router.navigate(['/customer/otp-verification'], {
              queryParams: {
                phone: formData.phone,
                isLogin: 'true' // Flag to indicate this is a login flow
              }
            });
          } else {
            this.showErrorMessage(response.message || 'Failed to send OTP. Please try again.');
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.showErrorMessage('Login failed. Please try again.');
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

  // Getters for form validation
  get phoneControl() {
    return this.loginForm.get('phone');
  }
}
