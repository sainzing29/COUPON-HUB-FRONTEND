import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

interface Invoice {
  id: number;
  invoiceNo: string;
  customer: string;
  serviceCenter: string;
  amount: number;
  paymentMethod: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
  animations: [
    trigger('pageFadeIn', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateY(20px)' 
        }),
        animate('500ms ease-out', style({ 
          opacity: 1, 
          transform: 'translateY(0)' 
        }))
      ])
    ])
  ]
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  
  // Filter properties
  dateRangeFilter: string = '';
  serviceCenterFilter: string = '';
  
  // Mock data
  private mockInvoices: Invoice[] = [
    {
      id: 1,
      invoiceNo: 'INV-001',
      customer: 'Alice',
      serviceCenter: 'Downtown SC',
      amount: 99,
      paymentMethod: 'Cash',
      status: 'Paid',
      date: '2025-09-01'
    },
    {
      id: 2,
      invoiceNo: 'INV-002',
      customer: 'Bob',
      serviceCenter: 'TechFix Hub',
      amount: 99,
      paymentMethod: 'Card',
      status: 'Paid',
      date: '2025-09-02'
    },
    {
      id: 3,
      invoiceNo: 'INV-003',
      customer: 'Charlie',
      serviceCenter: 'Downtown SC',
      amount: 99,
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      date: '2025-09-03'
    },
    {
      id: 4,
      invoiceNo: 'INV-004',
      customer: 'Diana',
      serviceCenter: 'TechFix Hub',
      amount: 99,
      paymentMethod: 'Cash',
      status: 'Pending',
      date: '2025-09-04'
    },
    {
      id: 5,
      invoiceNo: 'INV-005',
      customer: 'Eve',
      serviceCenter: 'Service Plus',
      amount: 99,
      paymentMethod: 'Card',
      status: 'Paid',
      date: '2025-09-05'
    },
    {
      id: 6,
      invoiceNo: 'INV-006',
      customer: 'Frank',
      serviceCenter: 'Downtown SC',
      amount: 99,
      paymentMethod: 'Bank Transfer',
      status: 'Overdue',
      date: '2025-08-15'
    },
    {
      id: 7,
      invoiceNo: 'INV-007',
      customer: 'Grace',
      serviceCenter: 'TechFix Hub',
      amount: 99,
      paymentMethod: 'Card',
      status: 'Paid',
      date: '2025-09-06'
    },
    {
      id: 8,
      invoiceNo: 'INV-008',
      customer: 'Henry',
      serviceCenter: 'Service Plus',
      amount: 99,
      paymentMethod: 'Cash',
      status: 'Pending',
      date: '2025-09-07'
    },
    {
      id: 9,
      invoiceNo: 'INV-009',
      customer: 'Ivy',
      serviceCenter: 'Downtown SC',
      amount: 99,
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      date: '2025-09-08'
    },
    {
      id: 10,
      invoiceNo: 'INV-010',
      customer: 'Jack',
      serviceCenter: 'TechFix Hub',
      amount: 99,
      paymentMethod: 'Card',
      status: 'Overdue',
      date: '2025-08-20'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.invoices = [...this.mockInvoices];
    this.filteredInvoices = [...this.invoices];
  }

  onDateRangeFilterChange(): void {
    this.applyFilters();
  }

  onServiceCenterFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredInvoices = this.invoices.filter(invoice => {
      const dateMatch = !this.dateRangeFilter || 
        invoice.date.includes(this.dateRangeFilter);
      const serviceCenterMatch = !this.serviceCenterFilter || 
        invoice.serviceCenter.toLowerCase().includes(this.serviceCenterFilter.toLowerCase());
      
      return dateMatch && serviceCenterMatch;
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return `${amount} AED`;
  }
}
