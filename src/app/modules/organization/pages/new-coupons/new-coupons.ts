import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Coupon {
  id: string;
  couponCode: string;
  status: string;
  totalServices: number;
  createdDate: Date;
}

@Component({
  selector: 'app-new-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './new-coupons.html',
  styleUrls: ['./new-coupons.scss']
})
export class NewCouponsComponent implements OnInit {
  coupons: Coupon[] = [];
  showGenerateModal = false;
  isGenerating = false;
  generateCouponForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.generateCouponForm = this.fb.group({
      count: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      validFor: ['12 months'],
      serviceCount: [5]
    });
  }

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    // Mock data for demonstration
    this.coupons = [
      {
        id: '1',
        couponCode: 'COUPON001',
        status: 'unassigned',
        totalServices: 5,
        createdDate: new Date('2024-01-15')
      },
      {
        id: '2',
        couponCode: 'COUPON002',
        status: 'unassigned',
        totalServices: 5,
        createdDate: new Date('2024-01-16')
      },
      {
        id: '3',
        couponCode: 'COUPON003',
        status: 'unassigned',
        totalServices: 5,
        createdDate: new Date('2024-01-17')
      }
    ];
  }

  openGenerateCouponModal(): void {
    this.showGenerateModal = true;
    this.generateCouponForm.reset({
      count: 1,
      validFor: '12 months',
      serviceCount: 5
    });
  }

  closeGenerateCouponModal(): void {
    this.showGenerateModal = false;
    this.isGenerating = false;
    this.generateCouponForm.reset();
  }

  generateCoupons(): void {
    if (this.generateCouponForm.valid) {
      this.isGenerating = true;
      
      // Simulate API call with 2-second delay
      setTimeout(() => {
        const count = this.generateCouponForm.get('count')?.value;
        const newCoupons = this.createNewCoupons(count);
        
        // Add new coupons to the list
        this.coupons = [...newCoupons, ...this.coupons];
        
        // Reset form and close modal
        this.isGenerating = false;
        this.closeGenerateCouponModal();
        
        // Show success message (you can implement a toast notification here)
        console.log(`Successfully generated ${count} new coupons`);
      }, 2000);
    }
  }

  private createNewCoupons(count: number): Coupon[] {
    const newCoupons: Coupon[] = [];
    const currentDate = new Date();
    
    for (let i = 0; i < count; i++) {
      const couponCode = this.generateCouponCode();
      newCoupons.push({
        id: this.generateId(),
        couponCode: couponCode,
        status: 'unassigned',
        totalServices: 5,
        createdDate: currentDate
      });
    }
    
    return newCoupons;
  }

  private generateCouponCode(): string {
    const prefix = 'COUPON';
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}${randomNumber}`;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  sellCoupon(coupon: Coupon): void {
    // Navigate to sale page with coupon code as query parameter
    this.router.navigate(['/organization/new-coupons/sale'], {
      queryParams: { couponCode: coupon.couponCode }
    });
  }

  // Getter for form validation
  get countControl() {
    return this.generateCouponForm.get('count');
  }
}