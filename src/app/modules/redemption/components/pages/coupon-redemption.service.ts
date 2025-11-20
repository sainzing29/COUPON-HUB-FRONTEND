import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import {
  VerifyCustomerRequest,
  VerifyCustomerResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  Product,
  CreateRedemptionRequest,
  RedemptionResponse
} from './coupon-redemption.model';

@Injectable({
  providedIn: 'root'
})
export class CouponRedemptionService {
  constructor(private apiService: ApiService) {}

  /**
   * Verify customer and send OTP
   */
  verifyCustomer(request: VerifyCustomerRequest): Observable<VerifyCustomerResponse> {
    return this.apiService.post<VerifyCustomerResponse>('/serviceredemptions/verify-customer', request);
  }

  /**
   * Verify OTP and get coupons
   */
  verifyOtpAndGetCoupons(request: VerifyOtpRequest): Observable<VerifyOtpResponse> {
    return this.apiService.post<VerifyOtpResponse>('/serviceredemptions/verify-otp-and-get-coupons', request);
  }

  /**
   * Get products for a coupon
   */
  getCouponProducts(couponId: number): Observable<Product[]> {
    return this.apiService.get<Product[]>(`/serviceredemptions/coupon/${couponId}/products`);
  }

  /**
   * Create redemption
   */
  createRedemption(request: CreateRedemptionRequest): Observable<RedemptionResponse> {
    return this.apiService.post<RedemptionResponse>('/serviceredemptions', request);
  }
}

