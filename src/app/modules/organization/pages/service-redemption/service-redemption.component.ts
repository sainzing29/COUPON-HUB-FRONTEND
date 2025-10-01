import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';

interface Coupon {
  id: number;
  code: string;
  customer: string;
  servicesUsed: number;
  servicesTotal: number;
  expiryDate: string;
  status: 'Active' | 'Expired';
}

@Component({
  selector: 'app-service-redemption',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-redemption.component.html',
  styleUrls: ['./service-redemption.component.scss'],
  animations: [
    trigger('pageFadeIn', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateY(20px)' 
        }),
        animate('500ms ease-out', style({ 
          opacity: 1, 
          transform: 'translateY(0)' 
        }))
      ])
    ])
  ]
})
export class ServiceRedemptionComponent implements OnInit {
  coupons: Coupon[] = [];
  filteredCoupons: Coupon[] = [];
  
  // Filter properties
  statusFilter: string = 'all';
  couponNumberFilter: string = '';
  
  // OTP popup properties
  showOtpDialog: boolean = false;
  otpCode: string = '';
  selectedCoupon: Coupon | null = null;
  isOtpValidating: boolean = false;
  
  // Mock data
  private mockCoupons: Coupon[] = [
    {
      id: 1,
      code: '1234567890',
      customer: 'Alice',
      servicesUsed: 1,
      servicesTotal: 5,
      expiryDate: '2025-08-01',
      status: 'Active'
    },
    {
      id: 2,
      code: '2345678901',
      customer: 'Bob',
      servicesUsed: 5,
      servicesTotal: 5,
      expiryDate: '2025-07-15',
      status: 'Expired'
    },
    {
      id: 3,
      code: '3456789012',
      customer: 'Charlie',
      servicesUsed: 2,
      servicesTotal: 3,
      expiryDate: '2025-09-20',
      status: 'Active'
    },
    {
      id: 4,
      code: '4567890123',
      customer: 'Diana',
      servicesUsed: 0,
      servicesTotal: 2,
      expiryDate: '2025-06-30',
      status: 'Expired'
    },
    {
      id: 5,
      code: '5678901234',
      customer: 'Eve',
      servicesUsed: 3,
      servicesTotal: 4,
      expiryDate: '2025-10-15',
      status: 'Active'
    },
    {
      id: 6,
      code: '6789012345',
      customer: 'Frank',
      servicesUsed: 2,
      servicesTotal: 6,
      expiryDate: '2025-11-10',
      status: 'Active'
    },
    {
      id: 7,
      code: '7890123456',
      customer: 'Grace',
      servicesUsed: 4,
      servicesTotal: 4,
      expiryDate: '2025-05-25',
      status: 'Expired'
    },
    {
      id: 8,
      code: '8901234567',
      customer: 'Henry',
      servicesUsed: 1,
      servicesTotal: 3,
      expiryDate: '2025-12-05',
      status: 'Active'
    },
    {
      id: 9,
      code: '9012345678',
      customer: 'Ivy',
      servicesUsed: 0,
      servicesTotal: 2,
      expiryDate: '2025-04-18',
      status: 'Expired'
    },
    {
      id: 10,
      code: '0123456789',
      customer: 'Jack',
      servicesUsed: 3,
      servicesTotal: 5,
      expiryDate: '2025-09-30',
      status: 'Active'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.coupons = [...this.mockCoupons];
    this.filteredCoupons = [...this.coupons];
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onCouponNumberFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredCoupons = this.coupons.filter(coupon => {
      const statusMatch = this.statusFilter === 'all' || coupon.status.toLowerCase() === this.statusFilter;
      const couponNumberMatch = !this.couponNumberFilter || 
        coupon.code.toLowerCase().includes(this.couponNumberFilter.toLowerCase());
      
      return statusMatch && couponNumberMatch;
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  redeemService(coupon: Coupon): void {
    // Prevent redemption for expired coupons
    if (coupon.status === 'Expired') {
      return;
    }
    
    // Show OTP dialog for verification
    this.selectedCoupon = coupon;
    this.showOtpDialog = true;
    this.otpCode = '';
  }

  closeOtpDialog(): void {
    this.showOtpDialog = false;
    this.selectedCoupon = null;
    this.otpCode = '';
    this.isOtpValidating = false;
  }

  confirmOtp(): void {
    if (!this.otpCode || this.otpCode.length !== 6) {
      return;
    }

    this.isOtpValidating = true;
    
    // Simulate OTP validation with 1-second delay
    setTimeout(() => {
      this.isOtpValidating = false;
      
      // For demo purposes, accept any 6-digit OTP
      if (this.otpCode.length === 6) {
        this.closeOtpDialog();
        
        // Navigate to redeem service page with coupon code as query parameter
        this.router.navigate(['/organization/service-redemption/redeem-service'], {
          queryParams: { 
            couponCode: this.selectedCoupon?.code, 
            customerName: this.selectedCoupon?.customer 
          }
        });
      }
    }, 1000);
  }

  onOtpInput(event: any): void {
    // Only allow numeric input
    const value = event.target.value.replace(/\D/g, '');
    this.otpCode = value;
    event.target.value = value;
  }
}
