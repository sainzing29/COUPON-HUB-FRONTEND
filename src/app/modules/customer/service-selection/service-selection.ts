import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

interface Service {
  id: number;
  name: string;
  description: string;
  value: string;
  isSelected: boolean;
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
  selectedServices: Service[] = [];

  services: Service[] = [
    {
      id: 1,
      name: 'Screen Protector Installation',
      description: 'High-quality screen protector installation with warranty',
      value: 'AED 50',
      isSelected: false
    },
    {
      id: 2,
      name: 'One Time Service Charge Waiver',
      description: 'Waive service charges for one-time repairs and maintenance',
      value: 'AED 100',
      isSelected: false
    },
    {
      id: 3,
      name: 'CES 5000mAh Power Bank',
      description: 'Portable power bank with 5000mAh capacity and fast charging',
      value: 'AED 80',
      isSelected: false
    },
    {
      id: 4,
      name: 'Free Diagnostic Checkup',
      description: 'Complimentary device diagnostic service and health check',
      value: 'AED 30',
      isSelected: false
    },
    {
      id: 5,
      name: '10% Off Mobile Outlets Product',
      description: 'Get 10% discount on any mobile outlet product purchase',
      value: 'Up to AED 200',
      isSelected: false
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get customer data from route parameters
    this.route.queryParams.subscribe(params => {
      this.customerName = params['customerName'] || 'Customer';
      this.couponNumber = params['couponNumber'] || 'N/A';
    });
  }

  toggleService(service: Service, index: number): void {
    service.isSelected = !service.isSelected;
    
    if (service.isSelected) {
      this.selectedServices.push(service);
    } else {
      this.selectedServices = this.selectedServices.filter(s => s.id !== service.id);
    }
  }

  proceedToRedeem(): void {
    if (this.selectedServices.length > 0) {
      // Navigate to a success page or back to admin panel
      // For now, we'll show an alert and go back
      alert(`Successfully selected ${this.selectedServices.length} services! Your coupon has been redeemed.`);
      this.router.navigate(['/customer/register']);
    }
  }

  goBack(): void {
    this.router.navigate(['/customer/register']);
  }

  getServiceCardClass(index: number): string {
    return `service-${index + 1}`;
  }

  getSelectButtonClass(index: number, isSelected: boolean): string {
    return isSelected ? 'selected' : `service-${index + 1}`;
  }
}