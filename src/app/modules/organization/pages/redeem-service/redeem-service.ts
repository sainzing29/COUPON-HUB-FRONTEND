import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface Service {
  id: number;
  name: string;
  description: string;
  isRedeeming: boolean;
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
      isRedeeming: false
    },
    {
      id: 2,
      name: 'One time service charge waiver',
      description: 'Waive service charges for one-time repairs',
      isRedeeming: false
    },
    {
      id: 3,
      name: 'CES 5000mah power bank',
      description: 'Portable power bank with 5000mAh capacity',
      isRedeeming: false
    },
    {
      id: 4,
      name: 'Free diagnostic checkup',
      description: 'Complimentary device diagnostic service',
      isRedeeming: false
    },
    {
      id: 5,
      name: '10% off mobile outlets product',
      description: 'Get 10% discount on mobile outlet products',
      isRedeeming: false
    }
  ];

  constructor(
    private location: Location,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get coupon code and customer name from route parameters
    this.route.queryParams.subscribe(params => {
      this.couponCode = params['couponCode'] || 'N/A';
      this.customerName = params['customerName'] || 'N/A';
    });
  }

  confirmRedeem(service: Service, index: number): void {
    this.selectedService = service;
    this.selectedServiceIndex = index;
    this.showConfirmationDialog = true;
  }

  closeConfirmationDialog(): void {
    this.showConfirmationDialog = false;
    this.selectedService = null;
    this.selectedServiceIndex = -1;
  }

  processRedemption(): void {
    if (this.selectedService && this.selectedServiceIndex !== -1) {
      // Close confirmation dialog
      this.closeConfirmationDialog();
      
      // Set loading state
      this.services[this.selectedServiceIndex].isRedeeming = true;
      
      // Simulate API call with 2-second delay
      setTimeout(() => {
        // Reset loading state
        this.services[this.selectedServiceIndex].isRedeeming = false;
        
        // Show success toast
        this.showSuccessToast();
      }, 2000);
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
}