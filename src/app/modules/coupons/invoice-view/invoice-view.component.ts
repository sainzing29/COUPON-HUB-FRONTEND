import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { InvoiceDetailResponse } from '../model/coupon-sale.model';
import { CouponSaleService } from '../service/coupon-sale.service';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationService } from '../../organization/pages/settings/configuration.service';
import { BasicConfiguration } from '../../organization/pages/settings/configuration.model';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-view.component.html',
  styleUrls: ['./invoice-view.component.scss']
})
export class InvoiceViewComponent implements OnInit {
  invoiceData: InvoiceDetailResponse | null = null;
  isLoading = false;
  companyDetails: BasicConfiguration | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private couponSaleService: CouponSaleService,
    private configurationService: ConfigurationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Load company details
    this.loadCompanyDetails();
    
    // Get invoice number from query params
    this.route.queryParams.subscribe(params => {
      const invoiceNumber = params['invoiceNumber'];
      if (invoiceNumber) {
        this.loadInvoiceDetails(invoiceNumber);
      } else {
        this.toastr.error('Invoice number not found', 'Error');
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

  loadInvoiceDetails(invoiceNumber: string): void {
    this.isLoading = true;
    this.couponSaleService.getInvoiceDetailsByNumber(invoiceNumber).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.invoiceData = response;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading invoice details:', error);
        this.toastr.error('Failed to load invoice details', 'Error');
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

  formatDateTime(dateString: string): string {
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

