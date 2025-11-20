import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerifyCustomerComponent } from '../verify-customer/verify-customer.component';
import { CustomerCouponsComponent } from '../customer-coupons/customer-coupons.component';
import { VerifyOtpResponse, RedemptionResponse } from './coupon-redemption.model';

type Step = 'verify' | 'chooseCoupon' | 'redeem';

@Component({
  selector: 'app-coupon-redemption',
  standalone: true,
  imports: [CommonModule, VerifyCustomerComponent, CustomerCouponsComponent],
  templateUrl: './coupon-redemption.component.html',
  styleUrls: ['./coupon-redemption.component.scss']
})
export class CouponRedemptionComponent implements OnInit {
  currentStep: Step = 'verify';
  customerData: VerifyOtpResponse | null = null;

  ngOnInit(): void {
    // Component initialized
  }

  onCustomerVerified(response: VerifyOtpResponse): void {
    this.customerData = response;
    this.currentStep = 'chooseCoupon';
  }

  onCouponSelected(): void {
    this.currentStep = 'redeem';
  }

  onCouponDeselected(): void {
    this.currentStep = 'chooseCoupon';
  }

  onRedemptionComplete(response: RedemptionResponse): void {
    // Handle redemption completion if needed
    console.log('Redemption completed:', response);
  }
}

