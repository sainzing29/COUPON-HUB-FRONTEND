import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { 
  CouponScheme, 
  CouponSchemeCreateRequest, 
  CouponSchemeUpdateRequest 
} from '../model/coupon-scheme.model';

@Injectable({
  providedIn: 'root'
})
export class CouponSchemeService {
  constructor(private apiService: ApiService) { }

  getCouponSchemes(): Observable<CouponScheme[]> {
    return this.apiService.get<CouponScheme[]>('/coupons/schemes');
  }

  getCouponSchemeById(id: number): Observable<CouponScheme> {
    return this.apiService.get<CouponScheme>(`/coupons/schemes/${id}`);
  }

  createCouponScheme(request: CouponSchemeCreateRequest): Observable<CouponScheme> {
    return this.apiService.post<CouponScheme>('/coupons/schemes', request);
  }

  updateCouponScheme(id: number, request: CouponSchemeUpdateRequest): Observable<CouponScheme> {
    return this.apiService.put<CouponScheme>(`/coupons/schemes/${id}`, request);
  }

  deleteCouponScheme(id: number): Observable<void> {
    return this.apiService.delete<void>(`/coupons/schemes/${id}`);
  }

  toggleCouponSchemeActive(id: number): Observable<CouponScheme> {
    return this.apiService.patch<CouponScheme>(`/coupons/schemes/${id}/toggle-active`, {});
  }
}

