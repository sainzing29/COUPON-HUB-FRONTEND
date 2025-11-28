import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// Phone OTP Interfaces
export interface SendPhoneOtpRequest {
  phoneNumber: string;
  customerName?: string;
}

export interface SendPhoneOtpResponse {
  success: boolean;
  message: string;
  phoneNumber: string;
}

export interface VerifyPhoneOtpRequest {
  phoneNumber: string;
  otpCode: string;
}

export interface VerifyPhoneOtpResponse {
  success: boolean;
  verified: boolean;
  message: string;
  phoneNumber: string;
}

export interface ResendPhoneOtpRequest {
  phoneNumber: string;
  customerName?: string;
}

export interface ResendPhoneOtpResponse {
  success: boolean;
  message: string;
  phoneNumber: string;
}

// Email OTP Interfaces
export interface SendEmailOtpRequest {
  email: string;
  customerName?: string;
}

export interface SendEmailOtpResponse {
  success: boolean;
  message: string;
  email: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  otpCode: string;
}

export interface VerifyEmailOtpResponse {
  success: boolean;
  verified: boolean;
  message: string;
  email: string;
}

export interface ResendEmailOtpRequest {
  email: string;
  otpCode: string;
}

export interface ResendEmailOtpResponse {
  success: boolean;
  message: string;
  email: string;
}

// Customer by Mobile Interface
export interface CustomerByMobileResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  googleId: string | null;
  createdAt: string;
  isActive: boolean;
  couponCount: number;
  invoiceCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerVerifyService {
  constructor(private apiService: ApiService) {}

  /**
   * Send OTP to phone number
   */
  sendPhoneOtp(request: SendPhoneOtpRequest): Observable<SendPhoneOtpResponse> {
    return this.apiService.post<SendPhoneOtpResponse>('/customer-phone/send-otp', request);
  }

  /**
   * Verify phone OTP
   */
  verifyPhoneOtp(request: VerifyPhoneOtpRequest): Observable<VerifyPhoneOtpResponse> {
    return this.apiService.post<VerifyPhoneOtpResponse>('/customer-phone/verify-otp', request);
  }

  /**
   * Resend phone OTP
   */
  resendPhoneOtp(request: ResendPhoneOtpRequest): Observable<ResendPhoneOtpResponse> {
    return this.apiService.post<ResendPhoneOtpResponse>('/customer-phone/resend-otp', request);
  }

  /**
   * Send OTP to email
   */
  sendEmailOtp(request: SendEmailOtpRequest): Observable<SendEmailOtpResponse> {
    return this.apiService.post<SendEmailOtpResponse>('/customer-email/send-otp', request);
  }

  /**
   * Verify email OTP
   */
  verifyEmailOtp(request: VerifyEmailOtpRequest): Observable<VerifyEmailOtpResponse> {
    return this.apiService.post<VerifyEmailOtpResponse>('/customer-email/verify-otp', request);
  }

  /**
   * Resend email OTP
   */
  resendEmailOtp(request: ResendEmailOtpRequest): Observable<ResendEmailOtpResponse> {
    return this.apiService.post<ResendEmailOtpResponse>('/customer-email/resend-otp', request);
  }

  /**
   * Get customer by mobile number
   */
  getCustomerByMobile(mobileNumber: string): Observable<CustomerByMobileResponse> {
    return this.apiService.get<CustomerByMobileResponse>(`/customers/mobile/${mobileNumber}`);
  }
}

