import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CustomerAuthService } from '../services/customer-auth.service';
import { TokenService } from '../../../core/services/token.service';
import { CustomerCouponsService } from '../services/customer-coupons.service';
import { CustomerCoupon, Product } from './customer-coupons.models';
import { ToastrService } from 'ngx-toastr';

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
  products?: Product[];
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
  customerId: number | null = null;
  isLoginFlow: boolean = false;
  selectedCouponId: number | null = null;
  showServices: boolean = false;
  isLoadingCoupons: boolean = false;

  coupons: Coupon[] = [];
  apiCoupons: CustomerCoupon[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private customerAuthService: CustomerAuthService,
    private tokenService: TokenService,
    private customerCouponsService: CustomerCouponsService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Load customer data from localStorage (from token)
    const userData = this.tokenService.getUser();
    if (userData) {
      // Get customer name - try multiple fields
      const firstName = userData.firstName || '';
      const lastName = userData.lastName || '';
      const fullName = userData.name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || 'Customer');
      this.customerName = fullName;
      this.customerEmail = userData.email || '';
      this.customerPhone = userData.mobileNumber || '';
      this.customerId = userData.id ? parseInt(userData.id.toString()) : null;
    }

    // Fallback to route parameters if localStorage doesn't have data
    this.route.queryParams.subscribe(params => {
      if (!this.customerName || this.customerName === 'Customer') {
        this.customerName = params['customerName'] || this.customerName || 'Customer';
      }
      if (!this.customerEmail) {
        this.customerEmail = params['email'] || this.customerEmail;
      }
      if (!this.customerPhone) {
        this.customerPhone = params['phone'] || this.customerPhone;
      }
      if (!this.customerAddress) {
        this.customerAddress = params['address'] || this.customerAddress;
      }
      this.isLoginFlow = params['isLogin'] === 'true';
    });

    // Load customer coupons if customerId is available
    if (this.customerId) {
      this.loadCustomerCoupons();
    } else {
      console.warn('Customer ID not found. Cannot load coupons.');
    }
  }

  loadCustomerCoupons(): void {
    if (!this.customerId) {
      return;
    }

    this.isLoadingCoupons = true;
    this.customerCouponsService.getCustomerCoupons(this.customerId).subscribe({
      next: (coupons) => {
        this.isLoadingCoupons = false;
        this.apiCoupons = coupons;
        // Map API coupons to component coupons structure
        this.coupons = coupons.map(coupon => ({
          id: coupon.couponId,
          couponNumber: coupon.couponCode,
          isActive: coupon.status === 'Active',
          expirationDate: coupon.expiryDate,
          services: [], // Will be populated from products
          products: coupon.scheme?.products || []
        }));
      },
      error: (error) => {
        this.isLoadingCoupons = false;
        console.error('Error loading customer coupons:', error);
        this.toastr.error('Failed to load coupons', 'Error');
      }
    });
  }

  get selectedCoupon(): Coupon | undefined {
    return this.coupons.find(coupon => coupon.id === this.selectedCouponId);
  }

  get services(): Service[] {
    return this.selectedCoupon?.services || [];
  }

  get products(): Product[] {
    return this.selectedCoupon?.products || [];
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


  viewInvoice(coupon?: Coupon): void {
    // Use provided coupon or fallback to selectedCoupon
    const targetCoupon = coupon || this.selectedCoupon;
    
    if (!targetCoupon) {
      this.toastr.error('Coupon not found', 'Error');
      return;
    }
    
    // Navigate to customer invoice page with coupon code
    this.router.navigate(['/customer/invoice'], {
      queryParams: {
        couponCode: targetCoupon.couponNumber
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

  getRemainingServices(coupon: Coupon): number {
    const apiCoupon = this.apiCoupons.find(c => c.couponId === coupon.id);
    if (apiCoupon) {
      return apiCoupon.totalServices - apiCoupon.usedServices;
    }
    return 0;
  }

  getRemainingDays(expirationDate: string): number {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, daysDiff);
  }
}