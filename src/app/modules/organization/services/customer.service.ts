import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  isActive: boolean;
  createdAt: string;
  couponCount: number;
  invoiceCount: number;
  googleId?: string | null;
}

export interface CustomerCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
}

export interface CustomerUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
}

export interface CustomerCoupon {
  couponId: number;
  couponCode: string;
  price: number;
  status: string;
  purchaseDate: string;
  expiryDate: string;
}

export interface CustomerService {
  serviceName: string;
  redemptionDate: string;
  serviceCenter: string;
  status: string;
}

export interface CustomerInvoice {
  invoiceNumber: string;
  serviceCenter: string;
  createdAt: string;
  amount: number;
  paymentStatus: string;
}

export interface CustomerDetailResponse {
  customer: Customer;
  coupons: CustomerCoupon[];
  services: CustomerService[];
  invoices: CustomerInvoice[];
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private apiService: ApiService) { }

  // Get all customers
  getCustomers(): Observable<Customer[]> {
    return this.apiService.get<Customer[]>('/customers');
  }

  // Get customer by ID
  getCustomerById(id: number): Observable<Customer> {
    return this.apiService.get<Customer>(`/customers/${id}`);
  }

  // Get customer details with coupons, services, and invoices
  getCustomerDetails(id: number): Observable<CustomerDetailResponse> {
    return this.apiService.get<CustomerDetailResponse>(`/customers/${id}`);
  }

  // Create new customer
  createCustomer(customer: CustomerCreateRequest): Observable<Customer> {
    return this.apiService.post<Customer>('/customers', customer);
  }

  // Update customer
  updateCustomer(id: number, customer: CustomerUpdateRequest): Observable<Customer> {
    return this.apiService.put<Customer>(`/customers/${id}`, customer);
  }

  // Delete customer
  deleteCustomer(id: number): Observable<void> {
    return this.apiService.delete<void>(`/customers/${id}`);
  }

  // Toggle customer status
  toggleCustomerStatus(id: number, isActive: boolean): Observable<Customer> {
    return this.apiService.patch<Customer>(`/customers/${id}/status`, { isActive });
  }

  // Search customers
  searchCustomers(query: string): Observable<Customer[]> {
    return this.apiService.get<Customer[]>(`/customers/search?q=${query}`);
  }

  // Get customers by service center
  getCustomersByServiceCenter(serviceCenterId: number): Observable<Customer[]> {
    return this.apiService.get<Customer[]>(`/customers?serviceCenterId=${serviceCenterId}`);
  }

  // Get customer statistics
  getCustomerStats(): Observable<{ total: number; active: number; inactive: number }> {
    return this.apiService.get<{ total: number; active: number; inactive: number }>('/customers/stats');
  }
}
