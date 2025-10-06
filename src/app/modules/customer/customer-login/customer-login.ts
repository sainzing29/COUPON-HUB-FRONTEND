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
      emailOrPhone: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|^[0-9+\-\s()]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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
      
      // Use auth service to login with email/phone and password
      this.customerAuthService.login(formData.emailOrPhone, formData.password).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            // Navigate to customer dashboard or service selection
            this.router.navigate(['/customer/service-selection']);
          } else {
            this.showErrorMessage(response.message || 'Login failed. Please check your credentials.');
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
  get emailOrPhoneControl() {
    return this.loginForm.get('emailOrPhone');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }
}
