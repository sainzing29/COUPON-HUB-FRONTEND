export interface CouponGenerationReportItem {
  couponId: number;
  couponCode: string;
  batchId: number;
  batchNumber: string;
  printBatchName: string;
  schemeName: string | null;
  createdDate: string;
  status: string;
  assignedToCustomer: boolean;
  activationDate: string | null;
  expiryDate: string | null;
  customerName: string | null;
  customerId: number | null;
}

export interface CouponGenerationReportResponse {
  items: CouponGenerationReportItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CouponGenerationReportFilters {
  pageNumber?: number;
  pageSize?: number;
  status?: number; // 0 = Unassigned, 1 = Active, 2 = Completed, 3 = Expired
  prefix?: string;
  period?: string;
  batchId?: number;
  schemeId?: number;
  couponCreatedDateFrom?: string; // Format: YYYY-MM-DD
  couponCreatedDateTo?: string; // Format: YYYY-MM-DD
}

