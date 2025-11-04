import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../../core/services/api.service';
import { environment } from '../../../../../../environments/environment';

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
  batchName?: string;
  notes?: string;
}

export interface CouponItem {
  id: number;
  couponCode: string;
  prefix: string;
  period: string;
  sequenceNumber: number;
  status: string;
  printBatchId: number;
  createdAt: string;
}

export interface GenerateResponse {
  printBatchId: number;
  quantity: number;
  coupons: CouponItem[];
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

  generateCoupons(request: GenerateRequest): Observable<GenerateResponse> {
    return this.apiService.post<GenerateResponse>('/coupons/generate', request);
  }
}


