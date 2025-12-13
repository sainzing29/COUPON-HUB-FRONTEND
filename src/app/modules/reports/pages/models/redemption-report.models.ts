export interface RedemptionReportItem {
  redemptionId: number;
  redemptionDateTime: string;
  serviceCenterName: string | null;
  couponCode: string;
  customerName: string | null;
  customerMobile: string | null;
  customerMobileWithCountryCode: string | null;
  serviceType: string | null;
  notes: string | null;
  remainingServicesAfterRedeem: number;
  couponStatus: string;
  schemeName: string | null;
}

export interface RedemptionReportResponse {
  items: RedemptionReportItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface RedemptionReportFilters {
  pageNumber?: number;
  pageSize?: number;
  redemptionDateFrom?: string; // ISO 8601 date string
  redemptionDateTo?: string; // ISO 8601 date string
  couponStatus?: number; // 0 = Unassigned, 1 = Active, 2 = Completed, 3 = Expired
  serviceCenterId?: number;
}

