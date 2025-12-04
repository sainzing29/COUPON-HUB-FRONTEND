export interface CouponValidationRequest {
  couponCode: string;
}

export interface CouponValidationResponse {
  isValid: boolean;
  couponId: number | null;
  couponCode?: string;
  batchNo?: number;
  createdOn?: string;
  scheme?: {
    id: number;
    name: string;
    description: string;
    price: number;
  };
  status?: string;
  errorMessage?: string | null;
}

export interface CreateInvoiceRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  countryCode?: string;
  couponId: number;
  schemeId?: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI';
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  serviceCenterId: number;
  serviceCenterName: string;
  couponId: number;
  couponCode: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  paidAt: string;
  createdAt: string;
  notes: string;
}

export interface InvoiceCustomer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
}

export interface InvoiceCoupon {
  id: number;
  couponCode: string;
  schemeId: number;
  totalServices: number;
  usedServices: number;
  purchaseDate: string;
  expiryDate: string;
  status: string;
}

export interface CreateInvoiceResponse {
  invoice: Invoice;
  customer: InvoiceCustomer;
  coupon: InvoiceCoupon;
}

export interface InvoiceDetailResponse {
  invoiceId: number;
  invoiceNumber: string;
  subTotal: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  customerId: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerMobileNumber: string;
  couponId: number;
  couponCode: string;
  couponTotalServices: number;
  couponUsedServices: number;
  createdAt?: string;
  scheme: {
    id: number;
    name: string;
    description: string;
    price: number;
    isActive: boolean;
    products: Array<{
      id: number;
      name: string;
      description: string;
      icon: string | null;
      displayOrder: number;
      isActive: boolean;
      isRedeemed: boolean;
    }>;
  };
}

