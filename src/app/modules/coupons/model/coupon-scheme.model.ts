export interface CouponSchemeProduct {
  id?: number;
  schemeId?: number;
  name: string;
  description: string;
  icon: string | null;
  displayOrder: number;
  isActive?: boolean;
}

export interface CouponScheme {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  products: CouponSchemeProduct[];
}

export interface CouponSchemeCreateRequest {
  name: string;
  description: string;
  price: number;
  products: CouponSchemeProductCreateRequest[];
}

export interface CouponSchemeProductCreateRequest {
  id?: number;
  name: string;
  description: string;
  icon: string | null;
  displayOrder: number;
}

export interface CouponSchemeUpdateRequest {
  id?: number;
  name: string;
  description: string;
  price: number;
  products: CouponSchemeProductCreateRequest[];
}

