// Customer registration models

export interface VerifyCouponResponse {
  coupon: {
    couponId: number;
    couponCode: string;
    status: string;
    createdAt: string;
    purchaseDate: string;
    expiryDate: string;
    customerId: number;
    isLinkedToCustomer: boolean;
  };
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    googleId: string | null;
    createdAt: string;
    isActive: boolean;
  } | null;
  hasPin: boolean;
}

export interface CustomerByCouponResponse {
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    googleId: string | null;
    createdAt: string;
    isActive: boolean;
  };
  coupons: Array<{
    couponId: number;
    couponCode: string;
    price: number;
    status: string;
    purchaseDate: string;
    expiryDate: string;
  }>;
  services: any[];
  invoices: Array<{
    invoiceNumber: string;
    serviceCenter: string;
    createdAt: string;
    amount: number;
    paymentStatus: string;
  }>;
  totalAmount: number;
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
}

export interface CreatePinRequest {
  pin: string;
}

export interface CreatePinResponse {
  success: boolean;
  message: string;
  token: string;
}

export interface JwtPayload {
  role: string;
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  isActive: string;
  authProvider: string;
  userType: string;
  exp: number;
  iss: string;
  aud: string;
}

