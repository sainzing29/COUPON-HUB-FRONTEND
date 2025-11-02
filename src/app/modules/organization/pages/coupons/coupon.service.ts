import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { environment } from '../../../../../environments/environment';

export interface NextSequenceResponse {
  prefix: string;
  period: string;
  lastSequence: number;
  nextSequence: number;
  nextCouponCode: string;
}

export interface PreviewRequest {
  prefix: string;
  period: string;
  sequenceWidth: number;
  quantity: number;
  startFrom: number;
}

export interface PreviewResponse {
  firstCodes: string[];
  lastCodes: string[];
  totalQuantity: number;
}

export interface GenerateRequest {
  prefix: string;
  period: string;
  sequenceWidth: number;
  quantity: number;
  startFrom: number;
  batchName?: string;
  notes?: string;
}

export interface GenerateResponse {
  batchId: number;
  codes: string[];
  quantity: number;
  range: string;
  exportedBy: string;
  exportedAt: string;
}

export interface MarkPrintedRequest {
  batchId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) { }

  getNextSequence(prefix: string, period: string): Observable<NextSequenceResponse> {
    return this.http.get<NextSequenceResponse>(
      `${environment.baseUrl}/coupons/next`,
      { params: { prefix, period } }
    );
  }

  previewCoupons(request: PreviewRequest): Observable<PreviewResponse> {
    return this.apiService.post<PreviewResponse>('/coupons/preview', request);
  }

  generateCoupons(request: GenerateRequest): Observable<GenerateResponse> {
    return this.apiService.post<GenerateResponse>('/coupons/generate', request);
  }

  markPrinted(request: MarkPrintedRequest): Observable<void> {
    return this.apiService.post<void>('/coupons/mark-printed', request);
  }
}

