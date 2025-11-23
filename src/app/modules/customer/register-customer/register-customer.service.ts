import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { 
  CustomerByCouponResponse, 
  VerifyOtpRequest, 
  VerifyOtpResponse, 
  CreatePinRequest, 
  CreatePinResponse 
} from './register-customer.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegisterCustomerService {
  constructor(private apiService: ApiService) {}

  /**
   * Get customer by coupon code
   */
  getCustomerByCoupon(couponCode: string, otpMethod: 'email' | 'phone' = 'email'): Observable<CustomerByCouponResponse> {
    const params = new HttpParams().set('otpMethod', otpMethod);
    return this.apiService.get<CustomerByCouponResponse>(`/customers/getcustomer-bycoupon/${couponCode}`, params);
  }

  /**
   * Verify OTP for email
   */
  verifyEmailOtp(request: VerifyOtpRequest): Observable<VerifyOtpResponse> {
    return this.apiService.post<VerifyOtpResponse>('/customer-email/verify-otp', request);
  }

  /**
   * Create PIN for customer
   */
  createPin(customerId: number, pin: string): Observable<CreatePinResponse> {
    const request: CreatePinRequest = { pin };
    return this.apiService.post<CreatePinResponse>(`/customers/${customerId}/create-pin`, request);
  }
}

