import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
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
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  
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
    
    // Focus on first input after component loads
    setTimeout(() => {
      if (this.otpInputs && this.otpInputs.length > 0) {
        this.otpInputs.first.nativeElement.focus();
      }
    }, 100);
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
    
    console.log(`Input ${index}: "${value}"`); // Debug log
    
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
    this.otpForm.get(`digit${index}`)?.setValue(value);
    
    // Move to next input if current is filled
    if (value && index < 5) {
      console.log(`Moving to next input: ${index + 1}`); // Debug log
      setTimeout(() => {
        // Try ViewChildren first
        if (this.otpInputs && this.otpInputs.length > index + 1) {
          const nextInput = this.otpInputs.toArray()[index + 1];
          if (nextInput) {
            console.log('Using ViewChildren to focus'); // Debug log
            nextInput.nativeElement.focus();
            nextInput.nativeElement.select();
            return;
          }
        }
        
        // Fallback to DOM query
        const nextInput = document.querySelector(`input[formControlName="digit${index + 1}"]`) as HTMLInputElement;
        if (nextInput) {
          console.log('Using DOM query to focus'); // Debug log
          nextInput.focus();
          nextInput.select();
        } else {
          console.log('Next input not found'); // Debug log
        }
      }, 10);
    }
    
    // Auto-verify when all digits are filled
    if (this.isAllDigitsFilled()) {
      setTimeout(() => {
        this.verifyOTP();
      }, 200);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    
    // Handle backspace
    if (event.key === 'Backspace') {
      const currentValue = input.value;
      if (!currentValue && index > 0) {
        // Move to previous input if current is empty
        const prevInput = this.otpInputs.toArray()[index - 1];
        if (prevInput) {
          prevInput.nativeElement.focus();
        }
      }
    }
    
    // Handle arrow keys
    if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = this.otpInputs.toArray()[index - 1];
      if (prevInput) {
        prevInput.nativeElement.focus();
      }
    }
    
    if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = this.otpInputs.toArray()[index + 1];
      if (nextInput) {
        nextInput.nativeElement.focus();
      }
    }
    
    // Handle Enter key - verify OTP
    if (event.key === 'Enter') {
      if (this.isAllDigitsFilled()) {
        this.verifyOTP();
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    // Clear all inputs first
    for (let i = 0; i < 6; i++) {
      this.otpForm.get(`digit${i}`)?.setValue('');
    }
    
    // Fill inputs with pasted digits
    for (let i = 0; i < digits.length && i < 6; i++) {
      this.otpForm.get(`digit${i}`)?.setValue(digits[i]);
    }
    
    // Focus on the next empty input or last input
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    setTimeout(() => {
      if (this.otpInputs && this.otpInputs.length > nextEmptyIndex) {
        this.otpInputs.toArray()[nextEmptyIndex].nativeElement.focus();
      }
      
      // Auto-verify if all digits are filled
      if (this.isAllDigitsFilled()) {
        setTimeout(() => {
          this.verifyOTP();
        }, 100);
      }
    }, 0);
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
      if (this.otpInputs && this.otpInputs.length > 0) {
        this.otpInputs.first.nativeElement.focus();
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