export interface CouponStatusExpiryReportItem {
  couponId: number;
  couponCode: string;
  status: string;
  customerName: string | null;
  customerMobile: string | null;
  customerMobileWithCountryCode: string | null;
  activationDate: string | null;
  expiryDate: string | null;
  servicesUsed: number;
  servicesTotal: number;
  remainingServices: number;
  schemeName: string | null;
  daysUntilExpiry: number | null;
  isExpired: boolean;
}

export interface CouponStatusExpiryReportResponse {
  items: CouponStatusExpiryReportItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CouponStatusExpiryReportFilters {
  pageNumber?: number;
  pageSize?: number;
  status?: number; // 0 = Unassigned, 1 = Active, 2 = Completed, 3 = Expired
  expiryDateFrom?: string; // Format: YYYY-MM-DD
  expiryDateTo?: string; // Format: YYYY-MM-DD
  schemeId?: number;
}

export interface ExpiringSoonFilters {
  days?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface ExpiredWithServicesLeftFilters {
  pageNumber?: number;
  pageSize?: number;
}


