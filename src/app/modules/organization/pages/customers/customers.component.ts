import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService, Customer, CustomerDeleteRequest, CustomersResponse } from '../../services/customer.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
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
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  paginatedCustomers: Customer[] = [];
  
  // Pagination properties
  currentPage = 1;
  pageSize = 50;
  totalItems = 0;
  totalPages = 0;
  
  searchForm: FormGroup;
  showAddCustomerForm = false;
  customerForm: FormGroup;
  isEditMode = false;
  editingCustomer: Customer | null = null;
  isLoading = false;



  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private customerService: CustomerService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      search: ['']
    });

    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.setupSearch();
  }

  private loadCustomers(): void {
    this.isLoading = true;
    const searchText = this.searchForm.get('search')?.value?.trim() || '';
    
    const params: any = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };
    
    if (searchText) {
      params.searchText = searchText;
    }
    
    this.customerService.getCustomers(params).subscribe({
      next: (response: CustomersResponse) => {
        this.customers = response.items;
        this.paginatedCustomers = response.items;
        this.totalItems = response.totalCount;
        this.totalPages = response.totalPages;
        this.currentPage = response.pageNumber;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.toastr.error('Error loading customers', 'Error');
        this.customers = [];
        this.paginatedCustomers = [];
        this.totalItems = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }



  private setupSearch(): void {
    // Debounce search to avoid too many API calls
    let searchTimeout: any;
    this.searchForm.get('search')?.valueChanges.subscribe(value => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.loadCustomers();
      }, 500); // Wait 500ms after user stops typing
    });
  }

  onAddCustomer(): void {
    this.isEditMode = false;
    this.editingCustomer = null;
    this.customerForm.reset();
    this.showAddCustomerForm = true;
  }

  onEditCustomer(customer: Customer): void {
    this.isEditMode = true;
    this.editingCustomer = customer;
    this.customerForm.patchValue({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      mobileNumber: customer.mobileNumber
    });
    this.showAddCustomerForm = true;
  }

  onDeactivateCustomer(customer: Customer): void {
    const action = customer.isActive ? 'deactivate' : 'activate';
    const message = `Are you sure you want to ${action} ${customer.firstName} ${customer.lastName}?`;
    
    if (confirm(message)) {
      this.customerService.toggleCustomerStatus(customer.id, !customer.isActive).subscribe({
        next: (updatedCustomer) => {
          // Update the customer in the list
          const index = this.customers.findIndex(c => c.id === customer.id);
          if (index > -1) {
            this.customers[index] = updatedCustomer;
            this.paginatedCustomers[index] = updatedCustomer;
          }
          this.toastr.success(`Customer ${action}d successfully`, 'Success');
        },
        error: (error) => {
          console.error('Error toggling customer status:', error);
          this.toastr.error(error.error?.message || `Error ${action}ing customer`, 'Error');
        }
      });
    }
  }

  onDeleteCustomer(customer: Customer): void {
    if (confirm(`Are you sure you want to delete ${customer.firstName} ${customer.lastName}?`)) {
      // Prepare delete request payload
      // Note: Based on the API payload model, mobileNumber should include country code
      // and countryCode should be just the number part (e.g., "971" not "+971")
      let mobileNumberWithCountry = customer.mobileNumber;
      let countryCodeOnly = customer.countryCode || '';
      
      // If countryCode has "+", remove it for the payload
      if (countryCodeOnly.startsWith('+')) {
        countryCodeOnly = countryCodeOnly.substring(1);
      }
      
      // If mobileNumber doesn't include country code, combine them
      if (customer.countryCode && !customer.mobileNumber.startsWith('+') && !customer.mobileNumber.startsWith(customer.countryCode)) {
        const countryCodeForMobile = customer.countryCode.startsWith('+') ? customer.countryCode : `+${customer.countryCode}`;
        mobileNumberWithCountry = `${countryCodeForMobile}${customer.mobileNumber}`;
      }
      
      const deleteRequest: CustomerDeleteRequest = {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        mobileNumber: mobileNumberWithCountry,
        countryCode: countryCodeOnly,
        googleId: customer.googleId || null
      };

      this.customerService.deleteCustomer(customer.id, deleteRequest).subscribe({
        next: () => {
          this.customers = this.customers.filter((c: Customer) => c.id !== customer.id);
          this.paginatedCustomers = this.paginatedCustomers.filter((c: Customer) => c.id !== customer.id);
          this.totalItems--;
          this.toastr.success('Customer deleted successfully', 'Success');
          // Reload customers to refresh pagination
          this.loadCustomers();
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
          this.toastr.error(error.error?.message || 'Error deleting customer', 'Error');
        }
      });
    }
  }

  onSaveCustomer(): void {
    if (this.customerForm.valid) {
      const formValue = this.customerForm.value;
      
      if (this.isEditMode && this.editingCustomer) {
        // Update existing customer
        this.customerService.updateCustomer(this.editingCustomer.id, formValue).subscribe({
          next: (updatedCustomer) => {
            this.toastr.success('Customer updated successfully', 'Success');
            this.showAddCustomerForm = false;
            this.customerForm.reset();
            this.loadCustomers(); // Reload to get updated data
          },
          error: (error) => {
            console.error('Error updating customer:', error);
            this.toastr.error(error.error?.message || 'Error updating customer', 'Error');
          }
        });
      } else {
        // Add new customer
        this.customerService.createCustomer(formValue).subscribe({
          next: (newCustomer) => {
            this.toastr.success('Customer added successfully', 'Success');
            this.showAddCustomerForm = false;
            this.customerForm.reset();
            this.loadCustomers(); // Reload to get new data
          },
          error: (error) => {
            console.error('Error creating customer:', error);
            this.toastr.error(error.error?.message || 'Error creating customer', 'Error');
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onViewCustomer(customer: Customer): void {
    this.router.navigate(['/organization/customers', customer.id]);
  }

  onCancel(): void {
    this.showAddCustomerForm = false;
    this.customerForm.reset();
    this.isEditMode = false;
    this.editingCustomer = null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.customerForm.controls).forEach(key => {
      const control = this.customerForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
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
        if (fieldName === 'mobileNumber') {
          return 'Please enter a valid 10-digit mobile number';
        }
        if (fieldName === 'zipCode') {
          return 'Please enter a valid 5-digit ZIP code';
        }
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


  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }


  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadCustomers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCustomers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCustomers();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Expose Math for template
  get Math() {
    return Math;
  }
}
