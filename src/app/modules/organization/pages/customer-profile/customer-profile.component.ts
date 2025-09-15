import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService, Customer } from '../../services/customer.service';
import { trigger, transition, style, animate } from '@angular/animations';

interface Coupon {
  id: number;
  code: string;
  discount: string;
  originalPrice: number;
  discountedPrice: number;
  status: 'Active' | 'Used' | 'Expired';
  purchaseDate: string;
  expiryDate: string;
  serviceCenterName: string;
}

interface ServiceHistory {
  id: number;
  serviceName: string;
  serviceCenterName: string;
  serviceDate: string;
  status: 'Completed' | 'In Progress' | 'Cancelled';
  amount: number;
  technician: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  serviceCenterName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  items: InvoiceItem[];
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.scss'],
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
export class CustomerProfileComponent implements OnInit {
  @Input() customerId?: number;
  
  customer: Customer | null = null;
  selectedTabIndex = 0;
  
  // Sample data - replace with actual API calls
  coupons: Coupon[] = [];
  serviceHistory: ServiceHistory[] = [];
  invoices: Invoice[] = [];
  
  // Edit form
  editForm: FormGroup;
  isEditMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  ngOnInit(): void {
    // Get customer ID from route params or input
    const id = this.customerId || this.route.snapshot.params['id'];
    if (id) {
      this.loadCustomer(+id);
    }
    this.loadSampleData();
  }

  private loadCustomer(id: number): void {
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customer = customer;
        this.populateEditForm();
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.snackBar.open('Error loading customer details', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        // Fallback to sample data
        this.loadSampleCustomer();
      }
    });
  }

  private loadSampleCustomer(): void {
    this.customer = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      mobileNumber: '1234567890',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      couponCount: 5,
      invoiceCount: 3,
      googleId: null
    };
    this.populateEditForm();
  }


  private loadSampleData(): void {
    // Sample coupons data
    this.coupons = [
      {
        id: 1,
        code: 'SUMMER20',
        discount: '20%',
        originalPrice: 100,
        discountedPrice: 80,
        status: 'Active',
        purchaseDate: '2024-01-15',
        expiryDate: '2024-02-15',
        serviceCenterName: 'Downtown Service Center'
      },
      {
        id: 2,
        code: 'SAVEBIG10',
        discount: '$10 Off',
        originalPrice: 50,
        discountedPrice: 40,
        status: 'Used',
        purchaseDate: '2024-01-10',
        expiryDate: '2024-02-10',
        serviceCenterName: 'Downtown Service Center'
      },
      {
        id: 3,
        code: 'FREEDELIVERY',
        discount: 'Free Delivery',
        originalPrice: 10,
        discountedPrice: 0,
        status: 'Expired',
        purchaseDate: '2024-01-01',
        expiryDate: '2024-01-31',
        serviceCenterName: 'Downtown Service Center'
      }
    ];

    // Sample service history data
    this.serviceHistory = [
      {
        id: 1,
        serviceName: 'Oil Change',
        serviceCenterName: 'Downtown Service Center',
        serviceDate: '2024-01-20',
        status: 'Completed',
        amount: 50,
        technician: 'Mike Johnson'
      },
      {
        id: 2,
        serviceName: 'Brake Inspection',
        serviceCenterName: 'Downtown Service Center',
        serviceDate: '2024-01-15',
        status: 'Completed',
        amount: 75,
        technician: 'Sarah Wilson'
      },
      {
        id: 3,
        serviceName: 'Tire Rotation',
        serviceCenterName: 'Downtown Service Center',
        serviceDate: '2024-01-10',
        status: 'Completed',
        amount: 25,
        technician: 'Mike Johnson'
      }
    ];

    // Sample invoices data
    this.invoices = [
      {
        id: 1,
        invoiceNumber: 'INV-2024-001',
        customerName: 'John Doe',
        serviceCenterName: 'Downtown Service Center',
        issueDate: '2024-01-20',
        dueDate: '2024-02-20',
        amount: 50,
        status: 'Paid',
        items: [
          { description: 'Oil Change Service', quantity: 1, unitPrice: 50, total: 50 }
        ]
      },
      {
        id: 2,
        invoiceNumber: 'INV-2024-002',
        customerName: 'John Doe',
        serviceCenterName: 'Downtown Service Center',
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        amount: 75,
        status: 'Paid',
        items: [
          { description: 'Brake Inspection', quantity: 1, unitPrice: 75, total: 75 }
        ]
      },
      {
        id: 3,
        invoiceNumber: 'INV-2024-003',
        customerName: 'John Doe',
        serviceCenterName: 'Downtown Service Center',
        issueDate: '2024-01-10',
        dueDate: '2024-02-10',
        amount: 25,
        status: 'Pending',
        items: [
          { description: 'Tire Rotation', quantity: 1, unitPrice: 25, total: 25 }
        ]
      }
    ];
  }

  private populateEditForm(): void {
    if (this.customer) {
      this.editForm.patchValue({
        firstName: this.customer.firstName,
        lastName: this.customer.lastName,
        email: this.customer.email,
        mobileNumber: this.customer.mobileNumber
      });
    }
  }

  onEdit(): void {
    this.isEditMode = true;
  }

  onSave(): void {
    if (this.editForm.valid && this.customer) {
      const formValue = this.editForm.value;
      const updatedCustomer = {
        ...this.customer,
        ...formValue,
        fullName: `${formValue.firstName} ${formValue.lastName}`
      };
      
      this.customer = updatedCustomer;
      this.isEditMode = false;
      
      this.snackBar.open('Customer updated successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.isEditMode = false;
    this.populateEditForm();
  }

  onBack(): void {
    this.router.navigate(['/organization/customers']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid 10-digit mobile number';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      mobileNumber: 'Mobile Number'
    };
    return labels[fieldName] || fieldName;
  }


  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Used': return 'bg-blue-100 text-blue-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getCouponsByStatus(status: string): Coupon[] {
    return this.coupons.filter(coupon => coupon.status === status);
  }

  getTotalAmount(): number {
    return this.invoices.reduce((total, invoice) => total + invoice.amount, 0);
  }

  getPaidAmount(): number {
    return this.invoices
      .filter(invoice => invoice.status === 'Paid')
      .reduce((total, invoice) => total + invoice.amount, 0);
  }

  getPendingAmount(): number {
    return this.invoices
      .filter(invoice => invoice.status === 'Pending')
      .reduce((total, invoice) => total + invoice.amount, 0);
  }

  getCompletedServicesCount(): number {
    return this.serviceHistory.filter(s => s.status === 'Completed').length;
  }

  getInProgressServicesCount(): number {
    return this.serviceHistory.filter(s => s.status === 'In Progress').length;
  }

  getTotalServiceAmount(): number {
    return this.serviceHistory.reduce((total, s) => total + s.amount, 0);
  }
}
