export interface CouponActivationReportItem {
  couponId: number;
  couponCode: string;
  activationDate: string;
  customerName: string | null;
  customerMobile: string | null;
  customerMobileWithCountryCode: string | null;
  customerEmail: string | null;
  schemeName: string | null;
  status: string;
  servicesTotal: number;
  servicesRemaining: number;
  expiryDate: string | null;
}

export interface CouponActivationReportResponse {
  items: CouponActivationReportItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CouponActivationReportFilters {
  pageNumber?: number;
  pageSize?: number;
  activationDateFrom?: string; // Format: YYYY-MM-DD
  activationDateTo?: string; // Format: YYYY-MM-DD
  schemeId?: number;
  status?: number; // 0 = Unassigned, 1 = Active, 2 = Completed, 3 = Expired
  customerPhone?: string;
  customerEmail?: string;
}

export interface ActivationKPIFilters {
  activationDateFrom?: string; // Format: YYYY-MM-DD
  activationDateTo?: string; // Format: YYYY-MM-DD
}

export interface SchemeActivationCount {
  schemeId: number;
  schemeName: string;
  activationCount: number;
}

export interface ServiceCenterActivationCount {
  serviceCenterId: number;
  serviceCenterName: string;
  activationCount: number;
}

export interface CouponActivationKPIResponse {
  totalActivations: number;
  activationsPerScheme: SchemeActivationCount[];
  activationsPerServiceCenter: ServiceCenterActivationCount[];
}

