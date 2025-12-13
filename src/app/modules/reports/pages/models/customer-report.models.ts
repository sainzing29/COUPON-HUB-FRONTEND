export interface CustomerReportItem {
  customerId: number;
  name: string;
  mobile: string;
  email: string | null;
  createdAt: string;
  numberOfCouponsActivated: number;
  activeCouponsCount: number;
  completedCouponsCount: number;
  totalRedemptions: number;
  lastRedemptionDate: string | null;
  serviceCenterName: string | null;
}

export interface CustomerReportResponse {
  items: CustomerReportItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CustomerReportFilters {
  pageNumber?: number;
  pageSize?: number;
  customerCreatedAtFrom?: string; // ISO 8601 date string
  customerCreatedAtTo?: string; // ISO 8601 date string
  hasActiveCoupons?: boolean;
  totalRedemptionsMin?: number;
}

export interface CustomerKPIResponse {
  totalCustomers: number;
  newCustomersInPeriod: number;
  engagedCustomers: number;
}

export interface CustomerKPIFilters {
  customerCreatedAtFrom?: string; // ISO 8601 date string
  customerCreatedAtTo?: string; // ISO 8601 date string
  engagedCustomerMinRedemptions?: number; // Default: 1
}

