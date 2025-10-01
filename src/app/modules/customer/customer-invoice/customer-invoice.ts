import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

interface InvoiceItem {
  id: number;
  name: string;
  description: string;
  value: string;
  status: 'available' | 'redeemed';
  redeemedDate?: string;
}

@Component({
  selector: 'app-customer-invoice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-invoice.html',
  styleUrls: ['./customer-invoice.scss']
})
export class CustomerInvoiceComponent implements OnInit {
  customerName: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  customerAddress: string = '';
  couponNumber: string = '';
  invoiceDate: string = '';
  invoiceNumber: string = '';

  invoiceItems: InvoiceItem[] = [
    {
      id: 1,
      name: 'Screen Protector Installation',
      description: 'High-quality screen protector installation with warranty',
      value: 'AED 50',
      status: 'redeemed',
      redeemedDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'One Time Service Charge Waiver',
      description: 'Waive service charges for one-time repairs and maintenance',
      value: 'AED 100',
      status: 'available'
    },
    {
      id: 3,
      name: 'CES 5000mAh Power Bank',
      description: 'Portable power bank with 5000mAh capacity and fast charging',
      value: 'AED 80',
      status: 'redeemed',
      redeemedDate: '2024-01-20'
    },
    {
      id: 4,
      name: 'Free Diagnostic Checkup',
      description: 'Complimentary device diagnostic service and health check',
      value: 'AED 30',
      status: 'available'
    },
    {
      id: 5,
      name: '10% Off Mobile Outlets Product',
      description: 'Get 10% discount on any mobile outlet product purchase',
      value: 'Up to AED 200',
      status: 'redeemed',
      redeemedDate: '2024-01-18'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    // Get customer data from route parameters
    this.route.queryParams.subscribe(params => {
      this.customerName = params['customerName'] || 'Customer';
      this.customerEmail = params['customerEmail'] || '';
      this.customerPhone = params['customerPhone'] || '';
      this.customerAddress = params['customerAddress'] || '';
      this.couponNumber = params['couponNumber'] || 'N/A';
    });

    // Generate invoice details
    this.generateInvoiceDetails();
  }

  private generateInvoiceDetails(): void {
    const now = new Date();
    this.invoiceDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Generate invoice number
    const timestamp = now.getTime().toString().slice(-8);
    this.invoiceNumber = `INV-${timestamp}`;
  }

  goBack(): void {
    this.location.back();
  }

  printInvoice(): void {
    window.print();
  }

  downloadInvoice(): void {
    // In a real application, this would generate and download a PDF
    alert('Invoice download feature will be implemented with PDF generation');
  }

  getTotalValue(): string {
    return 'AED 99';
  }

  getRedeemedCount(): number {
    return this.invoiceItems.filter(item => item.status === 'redeemed').length;
  }

  getAvailableCount(): number {
    return this.invoiceItems.filter(item => item.status === 'available').length;
  }

  getStatusClass(status: string): string {
    return status === 'redeemed' ? 'status-redeemed' : 'status-available';
  }

  getStatusIcon(status: string): string {
    return status === 'redeemed' ? 'fas fa-check-circle' : 'fas fa-clock';
  }

  getStatusText(status: string): string {
    return status === 'redeemed' ? 'Redeemed' : 'Available';
  }
}
