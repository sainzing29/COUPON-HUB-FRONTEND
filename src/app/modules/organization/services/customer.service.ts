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
  countryCode?: string;
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
  countryCode?: string;
}

export interface CustomerUpdateRequest {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  countryCode?: string;
}

export interface CustomerDeleteRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  countryCode: string;
  googleId: string | null;
}

export interface CouponSchemeProduct {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  isRedeemed: boolean;
  redemptionDate: string | null;
  redemptionStatus: number;
}

export interface CouponScheme {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  products: CouponSchemeProduct[];
}

export interface CustomerCoupon {
  remainingDays?: number;
  couponId: number;
  couponCode: string;
  price: number;
  status: string;
  activationDate: string;
  expiryDate: string;
  totalServices?: number;
  usedServices?: number;
  scheme?: CouponScheme;
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

export interface CustomersResponse {
  items: Customer[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CustomersQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private apiService: ApiService) { }

  // Get all customers with pagination and search
  getCustomers(params?: CustomersQueryParams): Observable<CustomersResponse> {
    return this.apiService.getWithParams<CustomersResponse>('/customers', params || {});
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
  deleteCustomer(id: number, customer: CustomerDeleteRequest): Observable<void> {
    return this.apiService.deleteWithBody<void>(`/customers/${id}`, customer);
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
