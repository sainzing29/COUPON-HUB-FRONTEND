import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CustomerCoupon } from './customer-coupons.models';

@Injectable({
  providedIn: 'root'
})
export class CustomerCouponsService {
  constructor(private apiService: ApiService) {}

  /**
   * Get customer assigned coupon list
   */
  getCustomerCoupons(customerId: number): Observable<CustomerCoupon[]> {
    return this.apiService.get<CustomerCoupon[]>(`/customers/${customerId}/coupons`);
  }
}

