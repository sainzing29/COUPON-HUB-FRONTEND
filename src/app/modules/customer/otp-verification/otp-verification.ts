import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { CustomerAuthService } from '../services/customer-auth.service';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './otp-verification.html',
  styleUrls: ['./otp-verification.scss']
})
export class OtpVerificationComponent implements OnInit, OnDestroy {
  otpForm: FormGroup;
  otpDigits: number[] = [0, 1, 2, 3, 4, 5];
  maskedPhoneNumber: string = '';
  timeLeft: number = 300; // 5 minutes in seconds
  isVerifying = false;
  isResending = false;
  showSuccessToast = false;
  showErrorToast = false;
  errorMessage = '';
  
  private timerSubscription?: Subscription;
  private customerData: any = {};
  private isLoginFlow = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private customerAuthService: CustomerAuthService
  ) {
    this.otpForm = this.fb.group({
      digit0: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit1: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit2: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit3: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit4: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit5: ['', [Validators.required, Validators.pattern(/[0-9]/)]]
    });
  }

  ngOnInit(): void {
    // Get customer data from route parameters
    this.route.queryParams.subscribe(params => {
      this.customerData = {
        customerName: params['customerName'] || 'Customer',
        email: params['email'] || 'customer@example.com',
        phone: params['phone'],
        couponNumber: params['couponNumber'] || '1234567890',
        address: params['address'] || 'Customer Address'
      };
      
      // Check if this is a login flow
      this.isLoginFlow = params['isLogin'] === 'true';
      
      // Mask phone number for display
      this.maskedPhoneNumber = this.maskPhoneNumber(params['phone'] || '');
    });

    // Start timer
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timerSubscription?.unsubscribe();
      }
    });
  }

  private maskPhoneNumber(phone: string): string {
    if (phone.length < 4) return phone;
    const visible = phone.slice(-4);
    const masked = '*'.repeat(phone.length - 4);
    return masked + visible;
  }

  onDigitInput(event: any, index: number): void {
    const value = event.target.value;
    
    // Only allow single digit
    if (value.length > 1) {
      event.target.value = value.slice(-1);
    }
    
    // Move to next input if current is filled
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[formControlName="digit${index + 1}"]`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
    
    // Auto-verify when all digits are filled
    if (this.isAllDigitsFilled()) {
      this.verifyOTP();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    // Handle backspace
    if (event.key === 'Backspace') {
      const currentValue = (event.target as HTMLInputElement).value;
      if (!currentValue && index > 0) {
        const prevInput = document.querySelector(`input[formControlName="digit${index - 1}"]`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    for (let i = 0; i < digits.length && i < 6; i++) {
      this.otpForm.get(`digit${i}`)?.setValue(digits[i]);
    }
    
    // Focus on the next empty input or last input
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    const nextInput = document.querySelector(`input[formControlName="digit${nextEmptyIndex}"]`) as HTMLInputElement;
    if (nextInput) {
      nextInput.focus();
    }
  }

  private isAllDigitsFilled(): boolean {
    return this.otpDigits.every(index => {
      const value = this.otpForm.get(`digit${index}`)?.value;
      return value && value.length === 1;
    });
  }

  verifyOTP(): void {
    if (this.otpForm.valid && this.timeLeft > 0) {
      this.isVerifying = true;
      
      // Get the entered OTP
      const enteredOTP = this.otpDigits.map(index => 
        this.otpForm.get(`digit${index}`)?.value
      ).join('');
      
      // Use auth service to complete login
      this.customerAuthService.completeLogin(this.customerData.phone, enteredOTP).subscribe({
        next: (response) => {
          this.isVerifying = false;
          
          if (response.success && response.customerData) {
            this.showSuccessToast = true;
            
            // Hide success toast and navigate after 2 seconds
            setTimeout(() => {
              this.showSuccessToast = false;
              this.navigateToServiceSelection(response.customerData);
            }, 2000);
          } else {
            this.showError(response.message || 'Invalid OTP. Please try again.');
          }
        },
        error: (error) => {
          this.isVerifying = false;
          this.showError('Verification failed. Please try again.');
        }
      });
    } else if (this.timeLeft === 0) {
      this.showError('OTP has expired. Please request a new one.');
    }
  }

  resendOTP(): void {
    this.isResending = true;
    
    // Simulate API call with 2-second delay
    setTimeout(() => {
      this.isResending = false;
      
      // Reset timer
      this.timeLeft = 300;
      this.startTimer();
      
      // Clear form
      this.otpForm.reset();
      
      // Focus on first input
      const firstInput = document.querySelector('input[formControlName="digit0"]') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
      
      this.showSuccessToast = true;
      setTimeout(() => {
        this.showSuccessToast = false;
      }, 2000);
    }, 2000);
  }

  private navigateToServiceSelection(customerData?: any): void {
    const dataToPass = customerData || this.customerData;
    this.router.navigate(['/customer/service-selection'], {
      queryParams: {
        customerName: dataToPass.customerName,
        email: dataToPass.email,
        phone: dataToPass.phone,
        couponNumber: dataToPass.couponNumber,
        address: dataToPass.address,
        isLogin: this.isLoginFlow ? 'true' : 'false'
      }
    });
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.showErrorToast = true;
    
    setTimeout(() => {
      this.showErrorToast = false;
    }, 3000);
  }

  goBack(): void {
    if (this.isLoginFlow) {
      this.router.navigate(['/customer/login']);
    } else {
      this.router.navigate(['/customer/register'], {
        queryParams: this.customerData
      });
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}