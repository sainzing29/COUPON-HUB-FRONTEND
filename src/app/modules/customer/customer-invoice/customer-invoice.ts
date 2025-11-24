import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CouponSaleService } from '../../coupons/service/coupon-sale.service';
import { InvoiceDetailResponse } from '../../coupons/model/coupon-sale.model';
import { ConfigurationService } from '../../organization/pages/settings/configuration.service';
import { BasicConfiguration } from '../../organization/pages/settings/configuration.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-customer-invoice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-invoice.html',
  styleUrls: ['./customer-invoice.scss']
})
export class CustomerInvoiceComponent implements OnInit {
  invoiceData: InvoiceDetailResponse | null = null;
  isLoading = false;
  companyDetails: BasicConfiguration | null = null;
  couponCode: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private couponSaleService: CouponSaleService,
    private configurationService: ConfigurationService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Load company details
    this.loadCompanyDetails();
    
    // Get coupon code from route parameters
    this.route.queryParams.subscribe(params => {
      this.couponCode = params['couponCode'] || params['couponNumber'] || '';
      if (this.couponCode) {
        this.loadInvoiceDetails(this.couponCode);
      } else {
        this.toastr.error('Coupon code not found', 'Error');
      }
    });
  }

  loadCompanyDetails(): void {
    this.configurationService.getBasicConfiguration().subscribe({
      next: (response) => {
        this.companyDetails = response;
      },
      error: (error) => {
        console.error('Error loading company details:', error);
        // Don't show error toast as this is not critical
      }
    });
  }

  loadInvoiceDetails(couponCode: string): void {
    this.isLoading = true;
    this.couponSaleService.getInvoiceDetailsByCouponCode(couponCode).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.invoiceData = response;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading invoice details:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Failed to load invoice details';
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  printInvoice(): void {
    window.print();
  }

  downloadInvoice(): void {
    // TODO: Implement PDF download
    alert('PDF download feature will be implemented');
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
