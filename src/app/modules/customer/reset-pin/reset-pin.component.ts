import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerAuthService } from '../services/customer-auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-pin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reset-pin.component.html',
  styleUrls: ['./reset-pin.component.scss']
})
export class ResetPinComponent implements OnInit {
  @ViewChildren('pinInput') pinInputs!: QueryList<ElementRef>;
  @ViewChildren('confirmPinInput') confirmPinInputs!: QueryList<ElementRef>;
  
  resetPinForm: FormGroup;
  isSubmitting = false;
  isValidating = false;
  showError = false;
  showSuccess = false;
  errorMessage = '';
  successMessage = '';
  token: string | null = null;
  customer: any = null;
  pinDigits: number[] = [0, 1, 2, 3];
  pinInputsReadonly: boolean[] = [true, true, true, true];
  confirmPinDigits: number[] = [0, 1, 2, 3];
  confirmPinInputsReadonly: boolean[] = [true, true, true, true];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private customerAuthService: CustomerAuthService,
    private toastr: ToastrService
  ) {
    this.resetPinForm = this.fb.group({
      pin0: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin1: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin2: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      pin3: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin0: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin1: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin2: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      confirmPin3: ['', [Validators.required, Validators.pattern(/[0-9]/)]]
    });

    // Ensure all PIN fields start empty
    for (let i = 0; i < 4; i++) {
      this.resetPinForm.get(`pin${i}`)?.setValue('', { emitEvent: false });
      this.resetPinForm.get(`confirmPin${i}`)?.setValue('', { emitEvent: false });
    }
  }

  ngOnInit(): void {
    // Get token from query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || null;
      
      if (this.token) {
        this.validateToken();
      } else {
        this.showErrorMessage('Invalid reset link. Please request a new PIN reset.');
      }
    });
  }

  validateToken(): void {
    if (!this.token) {
      this.showErrorMessage('Invalid reset token');
      return;
    }

    this.isValidating = true;
    this.showError = false;

    this.customerAuthService.validatePinResetToken(this.token).subscribe({
      next: (response) => {
        this.isValidating = false;
        if (response.isValid && response.customer) {
          this.customer = response.customer;
        } else {
          this.showErrorMessage('Invalid or expired token. Please request a new PIN reset.');
        }
      },
      error: (error) => {
        this.isValidating = false;
        console.error('Error validating token:', error);
        const errorMsg = error.error?.message || error.error?.error || 'Invalid or expired token. Please request a new PIN reset.';
        this.showErrorMessage(errorMsg);
      }
    });
  }

  // PIN Input Handlers
  onPinDigitInput(event: any, index: number, isConfirm: boolean = false): void {
    const prefix = isConfirm ? 'confirmPin' : 'pin';
    const readonlyArray = isConfirm ? this.confirmPinInputsReadonly : this.pinInputsReadonly;
    const inputsList = isConfirm ? this.confirmPinInputs : this.pinInputs;
    
    // Remove readonly on first interaction
    if (readonlyArray[index]) {
      readonlyArray[index] = false;
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
    this.resetPinForm.get(`${prefix}${index}`)?.setValue(value);
    
    // Move to next input if current is filled
    if (value && index < 3) {
      setTimeout(() => {
        if (inputsList && inputsList.length > index + 1) {
          const nextInput = inputsList.toArray()[index + 1];
          if (nextInput) {
            nextInput.nativeElement.focus();
            nextInput.nativeElement.select();
            return;
          }
        }
        
        const nextInput = document.querySelector(`input[formControlName="${prefix}${index + 1}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 10);
    }
  }

  onPinKeyDown(event: KeyboardEvent, index: number, isConfirm: boolean = false): void {
    const prefix = isConfirm ? 'confirmPin' : 'pin';
    const readonlyArray = isConfirm ? this.confirmPinInputsReadonly : this.pinInputsReadonly;
    const inputsList = isConfirm ? this.confirmPinInputs : this.pinInputs;
    
    // Remove readonly on first interaction
    if (readonlyArray[index]) {
      readonlyArray[index] = false;
    }
    
    const input = event.target as HTMLInputElement;
    
    // Handle backspace
    if (event.key === 'Backspace') {
      const currentValue = input.value;
      if (!currentValue && index > 0) {
        // Move to previous input if current is empty
        if (inputsList && inputsList.length > index) {
          const prevInput = inputsList.toArray()[index - 1];
          if (prevInput) {
            prevInput.nativeElement.focus();
          }
        }
      }
    }
    
    // Handle arrow keys
    if (event.key === 'ArrowLeft' && index > 0) {
      if (inputsList && inputsList.length > index) {
        const prevInput = inputsList.toArray()[index - 1];
        if (prevInput) {
          prevInput.nativeElement.focus();
        }
      }
    }
    
    if (event.key === 'ArrowRight' && index < 3) {
      if (inputsList && inputsList.length > index + 1) {
        const nextInput = inputsList.toArray()[index + 1];
        if (nextInput) {
          nextInput.nativeElement.focus();
        }
      }
    }
  }

  onPinPaste(event: ClipboardEvent, isConfirm: boolean = false): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 4);
    
    const prefix = isConfirm ? 'confirmPin' : 'pin';
    const readonlyArray = isConfirm ? this.confirmPinInputsReadonly : this.pinInputsReadonly;
    const inputsList = isConfirm ? this.confirmPinInputs : this.pinInputs;
    
    // Remove readonly from all inputs
    for (let i = 0; i < 4; i++) {
      readonlyArray[i] = false;
    }
    
    // Clear all inputs first
    for (let i = 0; i < 4; i++) {
      this.resetPinForm.get(`${prefix}${i}`)?.setValue('');
    }
    
    // Fill inputs with pasted digits
    for (let i = 0; i < digits.length && i < 4; i++) {
      this.resetPinForm.get(`${prefix}${i}`)?.setValue(digits[i]);
    }
    
    // Focus on the next empty input or last input
    const nextEmptyIndex = digits.length < 4 ? digits.length : 3;
    setTimeout(() => {
      if (inputsList && inputsList.length > nextEmptyIndex) {
        const nextInput = inputsList.toArray()[nextEmptyIndex];
        if (nextInput) {
          nextInput.nativeElement.focus();
        }
      }
    }, 0);
  }

  onPinFocus(index: number, isConfirm: boolean = false): void {
    const readonlyArray = isConfirm ? this.confirmPinInputsReadonly : this.pinInputsReadonly;
    // Remove readonly on focus
    if (readonlyArray[index]) {
      readonlyArray[index] = false;
    }
  }

  submitReset(): void {
    if (!this.token) {
      this.showErrorMessage('Invalid reset token');
      return;
    }

    // Get PIN values
    const pin = this.pinDigits.map(index => 
      this.resetPinForm.get(`pin${index}`)?.value
    ).join('');

    const confirmPin = this.confirmPinDigits.map(index => 
      this.resetPinForm.get(`confirmPin${index}`)?.value
    ).join('');

    // Client-side validation
    if (pin.length !== 4) {
      this.showErrorMessage('Please enter a valid 4-digit PIN');
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      this.showErrorMessage('PIN must contain only digits');
      return;
    }

    if (pin !== confirmPin) {
      this.showErrorMessage('PINs do not match');
      return;
    }

    if (this.resetPinForm.valid) {
      this.isSubmitting = true;
      this.showError = false;

      this.customerAuthService.resetPin(this.token, pin).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.showSuccess = true;
          this.successMessage = response.message || 'PIN reset successfully!';
          this.toastr.success('PIN reset successfully! Please login with your new PIN.', 'Success');
          
          // Redirect to login page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/customer/login'], {
              queryParams: { message: 'PIN reset successfully! Please login with your new PIN.' }
            });
          }, 2000);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error resetting PIN:', error);
          const errorMsg = error.error?.message || error.error?.error || 'Failed to reset PIN. Please try again.';
          this.showErrorMessage(errorMsg);
          this.toastr.error(errorMsg, 'Error');
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.resetPinForm.controls).forEach(key => {
        const control = this.resetPinForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  goToForgotPin(): void {
    this.router.navigate(['/customer/forgot-pin']);
  }

  goToLogin(): void {
    this.router.navigate(['/customer/login']);
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;
    
    setTimeout(() => {
      this.showError = false;
    }, 5000);
  }
}

