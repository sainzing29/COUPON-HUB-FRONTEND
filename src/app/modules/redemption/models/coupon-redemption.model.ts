// Models for Service Redemption Flow

export interface VerifyCustomerRequest {
  identifier?: string; // coupon/email
  email?: string;
  phone?: string;
  countryCode?: string;
  otpSendOption: 'email' | 'phone';
}

export interface VerifyCustomerResponse {
  customerId: number;
  customerName: string;
  email: string;
  mobileNumber: string;
  countryCode?: string;
  otpSentTo: 'email' | 'phone';
  message: string;
}

export interface VerifyOtpRequest {
  email?: string;
  phone?: string;
  countryCode?: string;
  otpCode: string;
}

export interface Coupon {
  couponId: number;
  couponCode: string;
  price: number;
  status: string;
  activationDate: string;
  expiryDate: string;
  totalServices: number;
  usedServices: number;
  remainingServices: number;
  schemeName: string;
}

export interface VerifyOtpResponse {
  customerId: number;
  customerName: string;
  email: string;
  mobileNumber: string;
  countryCode?: string;
  coupons: Coupon[];
}

export interface Product {
  productId: number;
  productName: string;
  description: string;
  icon: string | null;
  displayOrder: number;
  isRedeemed: boolean;
  redemptionDate: string | null;
  redemptionId: number | null;
  redemptionStatus: string | null;
}

export interface CreateRedemptionRequest {
  couponId: number;
  serviceCenterId: number;
  customerId: number;
  productId: number;
  notes: string;
}

export interface RedemptionResponse {
  id: number;
  couponId: number;
  couponCode: string;
  serviceCenterId: number;
  serviceCenterName: string;
  customerId: number;
  customerName: string;
  productId: number;
  productName: string;
  redemptionDate: string;
  notes: string;
  status: number;
  cancelledAt: string | null;
  cancellationReason: string | null;
  cancelledByUserId: number | null;
}

export interface RedemptionHistory {
  id: number;
  couponId: number;
  couponCode: string;
  serviceCenterId: number;
  serviceCenterName: string;
  customerId: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  productId: number;
  productName: string;
  redemptionDate: string;
  notes: string;
  status: number; // 0 = Redeemed, 1 = Cancelled
  cancelledAt: string | null;
  cancellationReason: string | null;
  cancelledByUserId: number | null;
}

export interface RedemptionHistoryResponse {
  items: RedemptionHistory[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

