import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CustomerAuthService } from '../services/customer-auth.service';

interface Service {
  id: number;
  name: string;
  description: string;
  value: string;
  isSelected: boolean;
  redemptionStatus: 'available' | 'redeemed';
  redeemedDate?: string;
}

interface Coupon {
  id: number;
  couponNumber: string;
  isActive: boolean;
  expirationDate: string;
  services: Service[];
}

@Component({
  selector: 'app-service-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-selection.html',
  styleUrls: ['./service-selection.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        height: '*',
        opacity: 1,
        transform: 'translateY(0)'
      })),
      state('out', style({
        height: '0px',
        opacity: 0,
        transform: 'translateY(-10px)'
      })),
      transition('in => out', animate('300ms ease-in-out')),
      transition('out => in', animate('300ms ease-in-out'))
    ]),
    trigger('fadeInUp', [
      state('in', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      state('out', style({
        opacity: 0,
        transform: 'translateY(20px)'
      })),
      transition('out => in', animate('400ms ease-out'))
    ])
  ]
})
export class ServiceSelectionComponent implements OnInit {
  customerName: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  customerAddress: string = '';
  isLoginFlow: boolean = false;
  selectedCouponId: number = 1;
  showServices: boolean = false;

  coupons: Coupon[] = [
    {
      id: 1,
      couponNumber: '1234567890',
      isActive: true,
      expirationDate: '2025-12-31',
      services: [
        {
          id: 1,
          name: 'Screen Protector Installation',
          description: 'High-quality screen protector installation with warranty',
          value: 'AED 50',
          isSelected: false,
          redemptionStatus: 'redeemed',
          redeemedDate: '2024-01-15'
        },
        {
          id: 2,
          name: 'One Time Service Charge Waiver',
          description: 'Waive service charges for one-time repairs and maintenance',
          value: 'AED 100',
          isSelected: false,
          redemptionStatus: 'available'
        },
        {
          id: 3,
          name: 'CES 5000mAh Power Bank',
          description: 'Portable power bank with 5000mAh capacity and fast charging',
          value: 'AED 80',
          isSelected: false,
          redemptionStatus: 'redeemed',
          redeemedDate: '2024-01-20'
        },
        {
          id: 4,
          name: 'Free Diagnostic Checkup',
          description: 'Complimentary device diagnostic service and health check',
          value: 'AED 30',
          isSelected: false,
          redemptionStatus: 'available'
        },
        {
          id: 5,
          name: '10% Off Mobile Outlets Product',
          description: 'Get 10% discount on any mobile outlet product purchase',
          value: 'Up to AED 200',
          isSelected: false,
          redemptionStatus: 'redeemed',
          redeemedDate: '2024-01-18'
        }
      ]
    },
    {
      id: 2,
      couponNumber: '0987654321',
      isActive: true,
      expirationDate: '2026-03-20',
      services: [
        {
          id: 6,
          name: 'Premium Screen Repair',
          description: 'Professional screen repair service with premium materials',
          value: 'AED 150',
          isSelected: false,
          redemptionStatus: 'available'
        },
        {
          id: 7,
          name: 'Battery Replacement',
          description: 'High-quality battery replacement with warranty',
          value: 'AED 80',
          isSelected: false,
          redemptionStatus: 'redeemed',
          redeemedDate: '2024-01-25'
        }
      ]
    },
    {
      id: 3,
      couponNumber: '5555555555',
      isActive: true,
      expirationDate: '2025-02-15',
      services: [
        {
          id: 8,
          name: 'Quick Service',
          description: 'Fast service for urgent repairs',
          value: 'AED 60',
          isSelected: false,
          redemptionStatus: 'available'
        }
      ]
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private customerAuthService: CustomerAuthService
  ) { }

  ngOnInit(): void {
    // Get customer data from route parameters
    this.route.queryParams.subscribe(params => {
      this.customerName = params['customerName'] || 'Customer';
      this.customerEmail = params['email'] || '';
      this.customerPhone = params['phone'] || '';
      this.customerAddress = params['address'] || '';
      this.isLoginFlow = params['isLogin'] === 'true';
    });
  }

  get selectedCoupon(): Coupon | undefined {
    return this.coupons.find(coupon => coupon.id === this.selectedCouponId);
  }

  get services(): Service[] {
    return this.selectedCoupon?.services || [];
  }

  toggleCoupon(couponId: number): void {
    if (this.selectedCouponId === couponId) {
      this.showServices = !this.showServices;
    } else {
      this.selectedCouponId = couponId;
      this.showServices = true;
    }
  }

  goBack(): void {
    if (this.isLoginFlow) {
      this.router.navigate(['/customer/login']);
    } else {
      this.router.navigate(['/customer/register']);
    }
  }


  viewInvoice(): void {
    // Navigate to customer invoice page with coupon details
    this.router.navigate(['/customer/invoice'], {
      queryParams: {
        couponNumber: this.selectedCoupon?.couponNumber,
        customerName: this.customerName,
        customerEmail: this.customerEmail,
        customerPhone: this.customerPhone,
        customerAddress: this.customerAddress
      }
    });
  }

  getServiceCardClass(index: number): string {
    return `service-${index + 1}`;
  }

  getRedemptionStatusClass(status: string): string {
    return `status-${status}`;
  }

  getRedemptionStatusIcon(status: string): string {
    switch (status) {
      case 'available':
        return 'check_circle';
      case 'redeemed':
        return 'check_circle';
      default:
        return 'help';
    }
  }

  getRedemptionStatusText(status: string): string {
    switch (status) {
      case 'available':
        return 'Available';
      case 'redeemed':
        return 'Redeemed';
      default:
        return 'Unknown';
    }
  }

  getServicesByStatus(status: string): Service[] {
    return this.services.filter(service => service.redemptionStatus === status);
  }

  getAnimationState(couponId: number): string {
    return this.selectedCouponId === couponId && this.showServices ? 'in' : 'out';
  }

  getRemainingDays(expirationDate: string): number {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, daysDiff);
  }
}