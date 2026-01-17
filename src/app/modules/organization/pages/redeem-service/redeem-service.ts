import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface Service {
  id: number;
  name: string;
  description: string;
  isRedeeming: boolean;
  status: 'available' | 'redeemed' | 'processing';
}

@Component({
  selector: 'app-redeem-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './redeem-service.html',
  styleUrls: ['./redeem-service.scss']
})
export class RedeemServiceComponent implements OnInit {
  couponCode: string = '';
  customerName: string = '';
  showConfirmationDialog = false;
  showToast = false;
  selectedService: Service | null = null;
  selectedServiceIndex: number = -1;

  services: Service[] = [
    {
      id: 1,
      name: 'Screen protector',
      description: 'High-quality screen protector installation',
      isRedeeming: false,
      status: 'available'
    },
    {
      id: 2,
      name: 'One time service charge waiver',
      description: 'Waive service charges for one-time repairs',
      isRedeeming: false,
      status: 'available'
    },
    {
      id: 3,
      name: 'CES 5000mah power bank',
      description: 'Portable power bank with 5000mAh capacity',
      isRedeeming: false,
      status: 'available'
    },
    {
      id: 4,
      name: 'Free diagnostic checkup',
      description: 'Complimentary device diagnostic service',
      isRedeeming: false,
      status: 'available'
    },
    {
      id: 5,
      name: '10% off mobile outlets product',
      description: 'Get 10% discount on mobile outlet products',
      isRedeeming: false,
      status: 'available'
    }
  ];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Get coupon code and customer name from route parameters
    this.route.queryParams.subscribe(params => {
      this.couponCode = params['couponCode'] || 'N/A';
      this.customerName = params['customerName'] || 'N/A';
    });
  }

  confirmRedeem(service: Service, index: number): void {
    // Only allow redemption for available services
    if (service.status === 'available') {
      this.selectedService = service;
      this.selectedServiceIndex = index;
      this.showConfirmationDialog = true;
    }
  }

  closeConfirmationDialog(): void {
    this.showConfirmationDialog = false;
    this.selectedService = null;
    this.selectedServiceIndex = -1;
  }

  processRedemption(): void {
    if (this.selectedService && this.selectedServiceIndex !== -1) {
      // Validate that the service exists at the index
      if (this.services[this.selectedServiceIndex]) {
        // Store the index before closing dialog
        const serviceIndex = this.selectedServiceIndex;
        
        // Close confirmation dialog
        this.closeConfirmationDialog();
        
        // Set processing state using stored index
        this.services[serviceIndex].isRedeeming = true;
        this.services[serviceIndex].status = 'processing';
        
        // Force change detection
        this.cdr.detectChanges();
        
        // Simulate API call with 2-second delay
        setTimeout(() => {
          // Update service status to redeemed
          this.services[serviceIndex].isRedeeming = false;
          this.services[serviceIndex].status = 'redeemed';
          
          // Force change detection
          this.cdr.detectChanges();
          
          // Show success toast
          this.showSuccessToast();
        }, 2000);
      }
    }
  }

  private showSuccessToast(): void {
    this.showToast = true;
    
    // Hide toast after 3 seconds and navigate back
    setTimeout(() => {
      this.showToast = false;
      // Navigate back after toast is shown
      setTimeout(() => {
        this.goBack();
      }, 500);
    }, 3000);
  }

  goBack(): void {
    this.location.back();
  }

  getServiceCardClass(index: number): string {
    return `service-${index + 1}`;
  }

  getConfirmButtonClass(index: number): string {
    return `service-${index + 1}`;
  }

  // Debug method to check service statuses
  checkServiceStatuses(): void {
    // Service statuses check method
  }
}