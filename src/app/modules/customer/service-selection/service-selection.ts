import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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

@Component({
  selector: 'app-service-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-selection.html',
  styleUrls: ['./service-selection.scss']
})
export class ServiceSelectionComponent implements OnInit {
  customerName: string = '';
  couponNumber: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  customerAddress: string = '';
  isLoginFlow: boolean = false;

  services: Service[] = [
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
      this.couponNumber = params['couponNumber'] || 'N/A';
      this.customerEmail = params['email'] || '';
      this.customerPhone = params['phone'] || '';
      this.customerAddress = params['address'] || '';
      this.isLoginFlow = params['isLogin'] === 'true';
    });
  }

  // Removed toggle functionality as we're now showing redemption status only

  goBack(): void {
    if (this.isLoginFlow) {
      this.router.navigate(['/customer/login']);
    } else {
      this.router.navigate(['/customer/register']);
    }
  }

  logout(): void {
    this.customerAuthService.logout();
    this.router.navigate(['/customer/login']);
  }

  viewInvoice(): void {
    // Navigate to customer invoice page with coupon details
    this.router.navigate(['/customer/invoice'], {
      queryParams: {
        couponNumber: this.couponNumber,
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
        return 'fas fa-check-circle';
      case 'redeemed':
        return 'fas fa-check-double';
      default:
        return 'fas fa-question-circle';
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
}