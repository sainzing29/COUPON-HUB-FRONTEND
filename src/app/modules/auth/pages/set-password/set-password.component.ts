import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class SetPasswordComponent implements OnInit {
  token: string = '';
  password: string = '';
  confirmPassword: string = '';
  user: any = null;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  setPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.setPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Get token from URL query params
    this.token = this.route.snapshot.queryParams['token'];
    
    if (this.token) {
      this.validateToken();
    } else {
      this.errorMessage = 'Invalid or missing token. Please check your email link.';
    }
  }

  validateToken() {
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.validateSetupToken(this.token).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.user = response.user;
          this.successMessage = `Welcome. Please set your password to continue.`;
        } else {
          this.errorMessage = 'Invalid or expired token. Please request a new password setup link.';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Token validation error:', error);
        this.errorMessage = error.message || 'Failed to validate token. Please try again.';
        this.loading = false;
      }
    });
  }

  setPassword() {
    if (this.setPasswordForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      const passwordData = {
        token: this.token,
        password: this.setPasswordForm.value.password
      };

      this.authService.setPassword(passwordData).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Password set successfully! Redirecting to login...';
          
          // Redirect to login page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/sign-in']);
          }, 2000);
        },
        error: (error) => {
          console.error('Set password error:', error);
          this.errorMessage = error.message || 'Failed to set password. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.setPasswordForm.controls).forEach(key => {
      const control = this.setPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.setPasswordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      password: 'Password',
      confirmPassword: 'Confirm Password'
    };
    return labels[fieldName] || fieldName;
  }
}

