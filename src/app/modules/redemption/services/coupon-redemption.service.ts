import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  VerifyCustomerRequest,
  VerifyCustomerResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  Product,
  CreateRedemptionRequest,
  RedemptionResponse,
  RedemptionHistory
} from '../models/coupon-redemption.model';

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

  /**
   * Get redemption history list
   */
  getRedemptionHistory(): Observable<RedemptionHistory[]> {
    return this.apiService.get<RedemptionHistory[]>('/serviceredemptions');
  }

  /**
   * Get redemption by ID
   */
  getRedemptionById(id: number): Observable<RedemptionHistory> {
    return this.apiService.get<RedemptionHistory>(`/serviceredemptions/${id}`);
  }

  /**
   * Cancel redemption
   */
  cancelRedemption(id: number, cancellationReason: string, cancelledByUserId?: number): Observable<{ message: string }> {
    const payload: { cancellationReason: string; cancelledByUserId?: number } = {
      cancellationReason: cancellationReason
    };
    
    if (cancelledByUserId !== undefined && cancelledByUserId !== null) {
      payload.cancelledByUserId = cancelledByUserId;
    }
    
    return this.apiService.post<{ message: string }>(`/serviceredemptions/${id}/cancel`, payload);
  }
}

