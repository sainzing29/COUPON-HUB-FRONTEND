import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface CustomerData {
  customerName: string;
  email: string;
  phone: string;
  couponNumber: string;
  address: string;
  isLoggedIn: boolean;
}

export interface CustomerLoginRequest {
  email?: string;
  mobileNumber?: string;
  pin: string;
}

export interface CustomerLoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerAuthService {
  private customerSubject = new BehaviorSubject<CustomerData | null>(null);
  public customer$ = this.customerSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Check for existing session on service initialization
    this.loadCustomerFromStorage();
  }

  /**
   * Customer login with email/phone and PIN
   */
  customerLogin(request: CustomerLoginRequest): Observable<CustomerLoginResponse> {
    return this.apiService.post<CustomerLoginResponse>('/Auth/customer-login', request);
  }

  // Login customer with email/phone and password
  login(emailOrPhone: string, password: string): Observable<{ success: boolean; customerData?: CustomerData; message: string }> {
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        // Dummy login credentials
        const dummyCredentials = {
          email: 'customer@ces.com',
          password: '12345678'
        };
        
        // Mock validation - check against dummy credentials
        if (emailOrPhone === dummyCredentials.email && password === dummyCredentials.password) {
          // Mock customer data for dummy login
          const customerData: CustomerData = {
            customerName: 'Test Customer',
            email: dummyCredentials.email,
            phone: '+971501234567',
            couponNumber: '4565123212',
            address: 'Dubai, UAE',
            isLoggedIn: true
          };
          
          this.setCustomer(customerData);
          observer.next({ success: true, customerData, message: 'Login successful' });
        } else {
          observer.next({ success: false, message: 'Invalid credentials. Use email: customer@ces.com, password: 12345678' });
        }
        observer.complete();
      }, 1000);
    });
  }

  // Complete login with phone and OTP
  completeLogin(phone: string, otp: string): Observable<{ success: boolean; customerData?: CustomerData; message: string }> {
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        // Mock verification - accept any 6-digit code for demo
        if (phone && otp && otp.length === 6) {
          const customerData: CustomerData = {
            customerName: 'Customer', // This would come from API
            email: 'customer@example.com', // This would come from API
            phone: phone,
            couponNumber: '1234567890', // This would come from API
            address: 'Customer Address', // This would come from API
            isLoggedIn: true
          };
          
          this.setCustomer(customerData);
          observer.next({ success: true, customerData, message: 'Login successful' });
        } else {
          observer.next({ success: false, message: 'Invalid OTP' });
        }
        observer.complete();
      }, 1000);
    });
  }

  // Register new customer
  register(customerData: Partial<CustomerData>): Observable<boolean> {
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        const newCustomer: CustomerData = {
          customerName: customerData.customerName || 'Customer',
          email: customerData.email || '',
          phone: customerData.phone || '',
          couponNumber: customerData.couponNumber || '',
          address: customerData.address || '',
          isLoggedIn: true
        };
        
        this.setCustomer(newCustomer);
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  // Set customer data and save to storage
  private setCustomer(customer: CustomerData): void {
    this.customerSubject.next(customer);
    localStorage.setItem('customerData', JSON.stringify(customer));
  }

  // Load customer from storage
  private loadCustomerFromStorage(): void {
    const stored = localStorage.getItem('customerData');
    if (stored) {
      try {
        const customerData = JSON.parse(stored);
        this.customerSubject.next(customerData);
      } catch (error) {
        console.error('Error loading customer data from storage:', error);
        this.clearCustomer();
      }
    }
  }

  // Get current customer
  getCurrentCustomer(): CustomerData | null {
    return this.customerSubject.value;
  }

  // Check if customer is logged in
  isLoggedIn(): boolean {
    const customer = this.getCurrentCustomer();
    return customer ? customer.isLoggedIn : false;
  }

  // Logout customer
  logout(): void {
    this.clearCustomer();
  }

  // Clear customer data
  private clearCustomer(): void {
    this.customerSubject.next(null);
    localStorage.removeItem('customerData');
  }

  // Send OTP
  sendOTP(phone: string): Observable<boolean> {
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        console.log(`OTP sent to ${phone}`);
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  // Verify OTP
  verifyOTP(phone: string, otp: string): Observable<boolean> {
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        // Mock verification - accept any 6-digit code for demo
        const isValid = otp.length === 6 && /^\d{6}$/.test(otp);
        observer.next(isValid);
        observer.complete();
      }, 1000);
    });
  }
}












