import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService, Customer, CustomerUpdateRequest, CustomerDetailResponse, CustomerCoupon, CustomerService as CustomerServiceData, CustomerInvoice, CouponSchemeProduct } from '../../services/customer.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { CountryCodeSelectorComponent, COUNTRY_CODES } from '../../components/country-code-selector/country-code-selector.component';

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
    FormsModule,
    ReactiveFormsModule,
    CountryCodeSelectorComponent
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
  
  // Data from API
  coupons: CustomerCoupon[] = [];
  services: CustomerServiceData[] = [];
  invoices: CustomerInvoice[] = [];
  
  // Edit form
  editForm: FormGroup;
  isEditMode = false;
  selectedCountryCode = '+971'; // Default to UAE

  // Products modal
  showProductsModal = false;
  selectedCouponForProducts: CustomerCoupon | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+971', [Validators.required]], // Default to UAE
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]]
    });
  }

  ngOnInit(): void {
    // Get customer ID from route params or input
    const id = this.customerId || this.route.snapshot.params['id'];
    if (id) {
      this.loadCustomerDetails(+id);
    }
  }

  private loadCustomerDetails(id: number): void {
    this.customerService.getCustomerDetails(id).subscribe({
      next: (response: CustomerDetailResponse) => {
        this.customer = response.customer;
        this.coupons = response.coupons || [];
        this.services = response.services || [];
        this.invoices = response.invoices || [];
        console.log('Loaded coupons:', this.coupons);
        console.log('First coupon scheme:', this.coupons[0]?.scheme);
        this.populateEditForm();
      },
      error: (error) => {
        console.error('Error loading customer details:', error);
        this.toastr.error('Error loading customer details', 'Error');
      }
    });
  }


  private populateEditForm(): void {
    if (this.customer) {
      // Use countryCode from customer directly (now separate property)
      const countryCode = this.customer.countryCode || '+971'; // Default to UAE
      
      this.selectedCountryCode = countryCode;
      
      this.editForm.patchValue({
        firstName: this.customer.firstName,
        lastName: this.customer.lastName,
        email: this.customer.email,
        countryCode: countryCode,
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
      
      // Prepare update request with countryCode as separate property
      const updateRequest: CustomerUpdateRequest = {
        id: this.customer.id,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        mobileNumber: formValue.mobileNumber,
        countryCode: formValue.countryCode
      };
      
      // Call API to update customer
      this.customerService.updateCustomer(this.customer.id, updateRequest).subscribe({
        next: (updatedCustomer) => {
      this.customer = updatedCustomer;
      this.isEditMode = false;
      this.toastr.success('Customer updated successfully', 'Success');
          // Reload customer details to get latest data
          this.loadCustomerDetails(this.customer.id);
        },
        error: (error) => {
          console.error('Error updating customer:', error);
          this.toastr.error(error.error?.message || 'Error updating customer', 'Error');
        }
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
        return 'Please enter a valid phone number (7-15 digits)';
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

  getCouponsByStatus(status: string): CustomerCoupon[] {
    return this.coupons.filter(coupon => coupon.status?.toLowerCase() === status.toLowerCase());
  }

  getTotalAmount(): number {
    return this.invoices.reduce((total, invoice) => total + invoice.amount, 0);
  }

  getPaidAmount(): number {
    return this.invoices
      .filter(invoice => invoice.paymentStatus?.toLowerCase() === 'paid')
      .reduce((total, invoice) => total + invoice.amount, 0);
  }

  getPendingAmount(): number {
    return this.invoices
      .filter(invoice => invoice.paymentStatus?.toLowerCase() === 'pending')
      .reduce((total, invoice) => total + invoice.amount, 0);
  }

  getCompletedServicesCount(): number {
    return this.services.filter(s => s.status?.toLowerCase() === 'completed').length;
  }

  getInProgressServicesCount(): number {
    return this.services.filter(s => s.status?.toLowerCase() === 'in progress').length;
  }

  viewProducts(coupon: CustomerCoupon): void {
    this.selectedCouponForProducts = coupon;
    this.showProductsModal = true;
  }

  closeProductsModal(): void {
    this.showProductsModal = false;
    this.selectedCouponForProducts = null;
  }

  getProductsForSelectedCoupon(): CouponSchemeProduct[] {
    return this.selectedCouponForProducts?.scheme?.products || [];
  }

  hasProducts(): boolean {
    const products = this.selectedCouponForProducts?.scheme?.products;
    return products ? products.length > 0 : false;
  }

  getProductCardClass(index: number): string {
    const classes = [
      'product-1',
      'product-2',
      'product-3',
      'product-4',
      'product-5',
      'product-6'
    ];
    return classes[index % classes.length] || 'product-1';
  }
}
