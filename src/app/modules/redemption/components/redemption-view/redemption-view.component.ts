import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CouponRedemptionService } from '../../services/coupon-redemption.service';
import { RedemptionHistory } from '../../models/coupon-redemption.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-redemption-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './redemption-view.component.html',
  styleUrls: ['./redemption-view.component.scss']
})
export class RedemptionViewComponent implements OnInit {
  redemption: RedemptionHistory | null = null;
  isLoading = false;
  showCancelDialog = false;
  cancellationReason = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private couponRedemptionService: CouponRedemptionService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRedemption(+id);
    } else {
      this.toastr.error('Invalid redemption ID', 'Error');
      this.router.navigate(['/organization/redemption/redemptions']);
    }
  }

  loadRedemption(id: number): void {
    this.isLoading = true;
    this.couponRedemptionService.getRedemptionById(id).subscribe({
      next: (response) => {
        this.redemption = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading redemption:', error);
        this.toastr.error('Error loading redemption details', 'Error');
        this.isLoading = false;
        this.router.navigate(['/organization/redemption/redemptions']);
      }
    });
  }

  getStatusLabel(status: number): string {
    return status === 0 ? 'Redeemed' : 'Cancelled';
  }

  getStatusColorClass(status: number): string {
    return status === 0 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  }

  openCancelDialog(): void {
    this.cancellationReason = '';
    this.showCancelDialog = true;
  }

  closeCancelDialog(): void {
    this.showCancelDialog = false;
    this.cancellationReason = '';
  }

  cancelRedemption(): void {
    if (!this.redemption || !this.cancellationReason.trim()) {
      this.toastr.error('Please enter a cancellation reason', 'Error');
      return;
    }

    // Get current user ID
    const currentUser = this.authService.getCurrentUser();
    const cancelledByUserId = currentUser?.id ? parseInt(currentUser.id, 10) : undefined;

    this.isLoading = true;
    this.couponRedemptionService.cancelRedemption(
      this.redemption.id, 
      this.cancellationReason,
      cancelledByUserId
    ).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Redemption cancelled successfully', 'Success');
        this.closeCancelDialog();
        // Reload redemption to get updated status
        this.loadRedemption(this.redemption!.id);
      },
      error: (error) => {
        console.error('Error cancelling redemption:', error);
        this.toastr.error(error.error?.message || 'Error cancelling redemption', 'Error');
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/organization/redemption/redemptions']);
  }
}

