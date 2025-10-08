import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService, LoginRequest } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
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
export class SignInComponent implements OnInit {
  signInForm: FormGroup;
  isLoading = false;
  showPassword = false;
  rememberMe = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      // DUMMY LOGIN - Commented out backend API integration
      // const loginData: LoginRequest = {
      //   email: this.signInForm.value.email,
      //   password: this.signInForm.value.password
      // };

      // this.authService.login(loginData).subscribe({
      //   next: (response) => {
      //     console.log('Login successful:', response);
      //     this.isLoading = false;
      //     
      //     // Get user role from the current user (decoded from token)
      //     const currentUser = this.authService.getCurrentUser();
      //     if (currentUser) {
      //       this.navigateBasedOnRole(currentUser.role);
      //     } else {
      //       this.errorMessage = 'Failed to get user information after login.';
      //     }
      //   },
      //   error: (error) => {
      //     console.error('Login error:', error);
      //     this.isLoading = false;
      //     this.errorMessage = error.message || 'Login failed. Something went wrong.';
      //   }
      // });

      // DUMMY LOGIN IMPLEMENTATION
      const email = this.signInForm.value.email;
      const password = this.signInForm.value.password;
      
      // Simulate API call delay
      setTimeout(() => {
        this.isLoading = false;
        
        // Test user credentials
        const testUsers = [
          {
            email: 'admin1@ces.com',
            password: '12345678',
            role: 'Admin',
            serviceCenterId: 1,
            name: 'Admin User',
            id: 1
          },
          {
            email: 'superadmin@ces.com',
            password: '12345678',
            role: 'SuperAdmin',
            serviceCenterId: null,
            name: 'Super Admin',
            id: 2
          }
        ];

        // Find matching user
        const user = testUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
          console.log('Dummy login successful:', user);
          
          // Store user data in localStorage (simulating JWT token)
          const dummyToken = this.generateDummyToken(user);
          
          // Use the same keys that TokenService expects
          localStorage.setItem('auth_token', dummyToken);
          localStorage.setItem('user_data', JSON.stringify(user));
          
          // Force AuthService to reload user data from token
          this.authService.reloadUserFromToken();
          
          // Navigate based on role
          this.navigateBasedOnRole(user.role);
        } else {
          this.errorMessage = 'Invalid email or password. Please try again.';
        }
      }, 1000); // 1 second delay to simulate API call
    } else {
      this.markFormGroupTouched();
    }
  }

  private navigateBasedOnRole(role: string): void {
    switch (role) {
      case 'SuperAdmin':
      case 'Admin':
        this.router.navigate(['/dashboard']);
        break;
      case 'User':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signInForm.controls).forEach(key => {
      const control = this.signInForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.signInForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Password'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Generate a dummy JWT-like token for testing purposes
   * This simulates the JWT token that would normally come from the backend
   */
  private generateDummyToken(user: any): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      serviceCenterId: user.serviceCenterId,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // Create a simple base64 encoded token (not a real JWT, just for testing)
    const headerEncoded = btoa(JSON.stringify(header));
    const payloadEncoded = btoa(JSON.stringify(payload));
    const signature = btoa('dummy-signature-for-testing');

    return `${headerEncoded}.${payloadEncoded}.${signature}`;
  }
}
