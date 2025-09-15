import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Coupon {
  id: number;
  title: string;
  description: string;
  discount: number;
  code: string;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponCreateRequest {
  title: string;
  description: string;
  discount: number;
  code: string;
  expiryDate: string;
}

export interface CouponUpdateRequest {
  title?: string;
  description?: string;
  discount?: number;
  code?: string;
  expiryDate?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  constructor(private apiService: ApiService) { }

  /**
   * Get all coupons
   */
  getCoupons(): Observable<Coupon[]> {
    return this.apiService.get<Coupon[]>('/coupons');
  }

  /**
   * Get coupons with pagination and filters
   */
  getCouponsWithFilters(page: number = 1, limit: number = 10, filters?: any): Observable<any> {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    };
    return this.apiService.getWithParams<any>('/coupons', params);
  }

  /**
   * Get coupon by ID
   */
  getCouponById(id: number): Observable<Coupon> {
    return this.apiService.get<Coupon>(`/coupons/${id}`);
  }

  /**
   * Create new coupon
   */
  createCoupon(coupon: CouponCreateRequest): Observable<Coupon> {
    return this.apiService.post<Coupon>('/coupons', coupon);
  }

  /**
   * Update coupon
   */
  updateCoupon(id: number, coupon: CouponUpdateRequest): Observable<Coupon> {
    return this.apiService.put<Coupon>(`/coupons/${id}`, coupon);
  }

  /**
   * Partially update coupon
   */
  patchCoupon(id: number, coupon: Partial<CouponUpdateRequest>): Observable<Coupon> {
    return this.apiService.patch<Coupon>(`/coupons/${id}`, coupon);
  }

  /**
   * Delete coupon
   */
  deleteCoupon(id: number): Observable<void> {
    return this.apiService.delete<void>(`/coupons/${id}`);
  }

  /**
   * Search coupons
   */
  searchCoupons(query: string): Observable<Coupon[]> {
    return this.apiService.getWithParams<Coupon[]>('/coupons/search', { q: query });
  }

  /**
   * Get active coupons
   */
  getActiveCoupons(): Observable<Coupon[]> {
    return this.apiService.get<Coupon[]>('/coupons/active');
  }

  /**
   * Get expired coupons
   */
  getExpiredCoupons(): Observable<Coupon[]> {
    return this.apiService.get<Coupon[]>('/coupons/expired');
  }
}








