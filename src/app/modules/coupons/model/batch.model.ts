export interface Batch {
  id: number;
  prefix: string;
  period: string;
  quantity: number;
  printerName?: string;
  notes?: string;
  status: BatchStatus;
}

export interface CouponItem {
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

export interface BatchDetails {
  id: number;
  prefix: string;
  period: string;
  quantity: number;
  status: BatchStatus;
  exportedAt?: string;
  printerName?: string | null;
  notes?: string | null;
  coupons: CouponItem[];
}

// Batch status enum values matching backend PrintBatchStatus
export enum BatchStatus {
  Generated = 0,
  Exported = 1,
  Printed = 2,
  Cancelled = 3
}

export const BATCH_STATUS_COLORS: Record<BatchStatus, string> = {
  [BatchStatus.Generated]: 'bg-amber-100 text-amber-800',
  [BatchStatus.Exported]: 'bg-blue-100 text-blue-800',
  [BatchStatus.Printed]: 'bg-purple-100 text-purple-800',
  [BatchStatus.Cancelled]: 'bg-red-100 text-red-800'
};

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  [BatchStatus.Generated]: 'Generated',
  [BatchStatus.Exported]: 'Exported',
  [BatchStatus.Printed]: 'Printed',
  [BatchStatus.Cancelled]: 'Cancelled'
};

