import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouponRedemptionService } from '../pages/coupon-redemption.service';
import { Coupon, Product, CreateRedemptionRequest, RedemptionResponse } from '../pages/coupon-redemption.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-customer-coupons',
  standalone: true,
  imports: [CommonModule, ConfirmationDialogComponent],
  templateUrl: './customer-coupons.component.html',
  styleUrls: ['./customer-coupons.component.scss']
})
export class CustomerCouponsComponent implements OnInit {
  @Input() coupons: Coupon[] = [];
  @Input() customerId: number = 0;
  @Output() redemptionComplete = new EventEmitter<RedemptionResponse>();
  @Output() couponSelected = new EventEmitter<void>();
  @Output() couponDeselected = new EventEmitter<void>();

  selectedCoupon: Coupon | null = null;
  products: Product[] = [];
  loadingProducts = false;
  showConfirmationDialog = false;
  selectedProduct: Product | null = null;
  isRedeeming = false;

  constructor(
    private couponRedemptionService: CouponRedemptionService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Component initialized
  }

  onCouponClick(coupon: Coupon): void {
    // Only allow clicking on active coupons
    if (coupon.status === 'Active') {
      this.selectedCoupon = coupon;
      this.loadProducts(coupon.couponId);
      this.couponSelected.emit();
    } else {
      this.toastr.warning('Only active coupons can be redeemed', 'Warning');
    }
  }

  loadProducts(couponId: number): void {
    this.loadingProducts = true;
    this.products = [];
    this.couponRedemptionService.getCouponProducts(couponId).subscribe({
      next: (products) => {
        this.loadingProducts = false;
        // Sort products by displayOrder
        this.products = products.sort((a, b) => a.displayOrder - b.displayOrder);
      },
      error: (error) => {
        this.loadingProducts = false;
        this.toastr.error(error.error?.message || 'Failed to load products', 'Error');
      }
    });
  }

  onConfirmRedeem(product: Product): void {
    // Only allow redemption for non-redeemed products
    if (product.isRedeemed) {
      this.toastr.warning('This product has already been redeemed', 'Warning');
      return;
    }

    this.selectedProduct = product;
    this.showConfirmationDialog = true;
  }

  onConfirmDialog(): void {
    if (!this.selectedProduct || !this.selectedCoupon) {
      return;
    }

    const user = this.authService.getCurrentUser();
    let serviceCenterId = 0;
    
    if (user?.serviceCenterId) {
      const parsedId = parseInt(user.serviceCenterId, 10);
      if (!isNaN(parsedId)) {
        serviceCenterId = parsedId;
      }
    }

    if (!serviceCenterId || serviceCenterId === 0) {
      this.toastr.error('Service center ID not found. Please ensure you are assigned to a service center.', 'Error');
      return;
    }

    const request: CreateRedemptionRequest = {
      couponId: this.selectedCoupon.couponId,
      serviceCenterId: serviceCenterId,
      customerId: this.customerId,
      productId: this.selectedProduct.productId,
      notes: ''
    };

    this.isRedeeming = true;
    this.couponRedemptionService.createRedemption(request).subscribe({
      next: (response) => {
        this.isRedeeming = false;
        this.showConfirmationDialog = false;
        this.toastr.success('Product redeemed successfully', 'Success');
        
        // Update product status
        const productIndex = this.products.findIndex(p => p.productId === this.selectedProduct!.productId);
        if (productIndex !== -1) {
          this.products[productIndex].isRedeemed = true;
          this.products[productIndex].redemptionDate = response.redemptionDate;
          this.products[productIndex].redemptionId = response.id;
        }

        // Update coupon remaining services
        if (this.selectedCoupon) {
          this.selectedCoupon.remainingServices = Math.max(0, this.selectedCoupon.remainingServices - 1);
          this.selectedCoupon.usedServices = this.selectedCoupon.usedServices + 1;
        }

        this.selectedProduct = null;
        this.redemptionComplete.emit(response);
      },
      error: (error) => {
        this.isRedeeming = false;
        this.toastr.error(error.error?.message || 'Failed to redeem product', 'Error');
      }
    });
  }

  onCancelDialog(): void {
    this.showConfirmationDialog = false;
    this.selectedProduct = null;
  }

  goBack(): void {
    this.selectedCoupon = null;
    this.products = [];
    this.couponDeselected.emit();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Used':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

