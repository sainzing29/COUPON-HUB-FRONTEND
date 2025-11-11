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

