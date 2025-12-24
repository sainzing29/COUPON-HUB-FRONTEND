export interface Coupon {
  id: number;
  couponCode: string;
  prefix: string;
  period: string;
  sequenceNumber: number;
  totalServices: number;
  usedServices: number;
  printed: boolean;
  status: string;
  createdAt: string;
  printBatchId: number | null;
}

export interface CouponsResponse {
  items: Coupon[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CouponsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
  status?: number;
  period?: string;
}

