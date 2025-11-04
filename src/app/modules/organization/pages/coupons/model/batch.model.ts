export interface Batch {
  id: number;
  prefix: string;
  period: string;
  quantity: number;
  printerName?: string;
  notes?: string;
  status: BatchStatus;
}

// Batch status enum values matching backend PrintBatchStatus
export enum BatchStatus {
  Generated = 0,
  Exported = 1,
  Delivered = 2,
  Cancelled = 3
}

export const BATCH_STATUS_COLORS: Record<BatchStatus, string> = {
  [BatchStatus.Generated]: 'bg-amber-100 text-amber-800',
  [BatchStatus.Exported]: 'bg-blue-100 text-blue-800',
  [BatchStatus.Delivered]: 'bg-purple-100 text-purple-800',
  [BatchStatus.Cancelled]: 'bg-red-100 text-red-800'
};

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  [BatchStatus.Generated]: 'Generated',
  [BatchStatus.Exported]: 'Exported',
  [BatchStatus.Delivered]: 'Delivered',
  [BatchStatus.Cancelled]: 'Cancelled'
};

