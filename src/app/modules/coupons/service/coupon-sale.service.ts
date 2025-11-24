import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CreateInvoiceRequest, CreateInvoiceResponse, InvoiceDetailResponse } from '../model/coupon-sale.model';

export interface SendOtpRequest {
  email?: string;
  phone?: string;
  customerName?: string;
}

export interface SendOtpResponse {
  success: boolean;
  message?: string;
}

export interface VerifyOtpRequest {
  email?: string;
  phone?: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  customerId?: number;
}

export interface CreateCouponSaleRequest {
  customerEmail?: string;
  customerPhone?: string;
  customerName: string;
  couponSchemeId: number;
}

export interface CreateCouponSaleResponse {
  success: boolean;
  invoiceId?: number;
  couponCode?: string;
  message?: string;
}

export interface InvoiceDetails {
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  couponCode: string;
  couponScheme: {
    id: number;
    name: string;
    description: string;
    price: number;
    products: Array<{
      id: number;
      name: string;
      description: string;
      icon: string | null;
    }>;
  };
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CouponSaleService {
  constructor(private apiService: ApiService) {}

  /**
   * Send OTP to customer email
   */
  sendOtpToEmail(email: string): Observable<SendOtpResponse> {
    return this.apiService.post<SendOtpResponse>('/customer-email/send-otp', { email });
  }

  /**
   * Send OTP to customer phone
   */
  sendOtpToPhone(phone: string): Observable<SendOtpResponse> {
    return this.apiService.post<SendOtpResponse>('/customer-phone/send-otp', { email: phone });
  }

  /**
   * Verify OTP for email
   */
  verifyEmailOtp(email: string, otpCode: string): Observable<VerifyOtpResponse> {
    return this.apiService.post<VerifyOtpResponse>('/customer-email/verify-otp', { email, otpCode });
  }

  /**
   * Verify OTP for phone
   */
  verifyPhoneOtp(phone: string, otp: string): Observable<VerifyOtpResponse> {
    return this.apiService.post<VerifyOtpResponse>('/customer-phone/verify-otp', { email: phone, otp });
  }

  /**
   * Create coupon sale
   */
  createCouponSale(request: CreateCouponSaleRequest): Observable<CreateCouponSaleResponse> {
    return this.apiService.post<CreateCouponSaleResponse>('/coupons/sale', request);
  }

  /**
   * Get invoice details by invoice ID
   */
  getInvoiceDetails(invoiceId: number): Observable<InvoiceDetails> {
    return this.apiService.get<InvoiceDetails>(`/invoices/${invoiceId}`);
  }

  /**
   * Create invoice with customer details
   */
  createInvoiceWithCustomer(request: CreateInvoiceRequest): Observable<CreateInvoiceResponse> {
    return this.apiService.post<CreateInvoiceResponse>('/invoices/with-customer', request);
  }

  /**
   * Get invoice details by invoice number
   */
  getInvoiceDetailsByNumber(invoiceNumber: string): Observable<InvoiceDetailResponse> {
    return this.apiService.get<InvoiceDetailResponse>(`/invoices/number/${invoiceNumber}/detail`);
  }

  /**
   * Get invoice details by coupon code
   */
  getInvoiceDetailsByCouponCode(couponCode: string): Observable<InvoiceDetailResponse> {
    return this.apiService.get<InvoiceDetailResponse>(`/invoices/coupon/${couponCode}/detail`);
  }
}

