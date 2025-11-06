import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../../core/services/api.service';
import { Batch, BatchDetails } from '../model/batch.model';

export interface MarkPrintedRequest {
  batchId: number;
}

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) { }

  getBatches(): Observable<Batch[]> {
    return this.apiService.get<Batch[]>('/coupons/batches');
  }

  getBatchById(id: number): Observable<BatchDetails> {
    return this.apiService.get<BatchDetails>(`/coupons/batches/${id}`);
  }

  updateBatchStatus(id: number, status: number): Observable<void> {
    return this.apiService.patch<void>(`/coupons/batches/${id}/status`, { status });
  }

  deleteBatch(id: number): Observable<void> {
    return this.apiService.delete<void>(`/batches/${id}`);
  }

  markPrinted(request: MarkPrintedRequest): Observable<void> {
    return this.apiService.post<void>('/coupons/mark-printed', request);
  }
}

