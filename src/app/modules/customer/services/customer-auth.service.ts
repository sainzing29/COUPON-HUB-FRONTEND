import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CustomerData {
  customerName: string;
  email: string;
  phone: string;
  couponNumber: string;
  address: string;
  isLoggedIn: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerAuthService {
  private customerSubject = new BehaviorSubject<CustomerData | null>(null);
  public customer$ = this.customerSubject.asObservable();

  constructor() {
    // Check for existing session on service initialization
    this.loadCustomerFromStorage();
  }

  // Login customer with phone number (first step - sends OTP)
  login(phone: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        // Mock validation - in real app, this would call your API
        if (phone && phone.length >= 10) {
          observer.next({ success: true, message: 'OTP sent successfully' });
        } else {
          observer.next({ success: false, message: 'Invalid phone number' });
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












