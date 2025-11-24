// Customer coupons models

export interface Product {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  isRedeemed: boolean;
}

export interface Scheme {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  products: Product[];
}

export interface CustomerCoupon {
  couponId: number;
  couponCode: string;
  price: number;
  status: string;
  purchaseDate: string;
  expiryDate: string;
  totalServices: number;
  usedServices: number;
  scheme: Scheme;
}

