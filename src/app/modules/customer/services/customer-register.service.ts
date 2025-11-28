import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CreateInvoiceRequest, CreateInvoiceResponse } from '../../coupons/model/coupon-sale.model';

export interface RegisterCustomerRequest extends CreateInvoiceRequest {
  couponCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerRegisterService {
  constructor(private apiService: ApiService) {}

  /**
   * Register customer with coupon
   */
  registerCustomer(request: RegisterCustomerRequest): Observable<CreateInvoiceResponse> {
    return this.apiService.post<CreateInvoiceResponse>('/customers/register', request);
  }
}

