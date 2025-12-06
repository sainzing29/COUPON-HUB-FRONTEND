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
import { CustomerService, Customer, CustomerDeleteRequest } from '../../services/customer.service';
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
  filteredCustomers: Customer[] = [];
  paginatedCustomers: Customer[] = [];
  
  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  searchForm: FormGroup;
  showAddCustomerForm = false;
  customerForm: FormGroup;
  isEditMode = false;
  editingCustomer: Customer | null = null;



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
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.filteredCustomers = [...customers];
        this.updatePagination();
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.toastr.error('Error loading customers', 'Error');
        // Handle error without fallback data
        this.customers = [];
        this.filteredCustomers = [];
        this.updatePagination();
      }
    });
  }

  private loadDummyCustomers(): void {
    // Simulate API delay
    setTimeout(() => {
      this.customers = [
        {
          id: 1,
          firstName: 'Ahmed',
          lastName: 'Al-Rashid',
          fullName: 'Ahmed Al-Rashid',
          email: 'ahmed.rashid@email.com',
          mobileNumber: '0501234567',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          couponCount: 5,
          invoiceCount: 3,
          googleId: null
        },
        {
          id: 2,
          firstName: 'Fatima',
          lastName: 'Hassan',
          fullName: 'Fatima Hassan',
          email: 'fatima.hassan@email.com',
          mobileNumber: '0502345678',
          isActive: true,
          createdAt: '2024-01-20T14:15:00Z',
          couponCount: 8,
          invoiceCount: 6,
          googleId: null
        },
        {
          id: 3,
          firstName: 'Mohammed',
          lastName: 'Al-Zahra',
          fullName: 'Mohammed Al-Zahra',
          email: 'mohammed.zahra@email.com',
          mobileNumber: '0503456789',
          isActive: false,
          createdAt: '2024-02-01T09:45:00Z',
          couponCount: 2,
          invoiceCount: 1,
          googleId: null
        },
        {
          id: 4,
          firstName: 'Aisha',
          lastName: 'Al-Mansouri',
          fullName: 'Aisha Al-Mansouri',
          email: 'aisha.mansouri@email.com',
          mobileNumber: '0504567890',
          isActive: true,
          createdAt: '2024-02-10T16:20:00Z',
          couponCount: 12,
          invoiceCount: 9,
          googleId: null
        },
        {
          id: 5,
          firstName: 'Omar',
          lastName: 'Al-Sabah',
          fullName: 'Omar Al-Sabah',
          email: 'omar.sabah@email.com',
          mobileNumber: '0505678901',
          isActive: true,
          createdAt: '2024-02-15T11:30:00Z',
          couponCount: 3,
          invoiceCount: 2,
          googleId: null
        },
        {
          id: 6,
          firstName: 'Layla',
          lastName: 'Al-Kuwaiti',
          fullName: 'Layla Al-Kuwaiti',
          email: 'layla.kuwaiti@email.com',
          mobileNumber: '0506789012',
          isActive: true,
          createdAt: '2024-02-20T13:45:00Z',
          couponCount: 7,
          invoiceCount: 4,
          googleId: null
        },
        {
          id: 7,
          firstName: 'Khalid',
          lastName: 'Al-Dubai',
          fullName: 'Khalid Al-Dubai',
          email: 'khalid.dubai@email.com',
          mobileNumber: '0507890123',
          isActive: false,
          createdAt: '2024-03-01T08:15:00Z',
          couponCount: 1,
          invoiceCount: 0,
          googleId: null
        },
        {
          id: 8,
          firstName: 'Nour',
          lastName: 'Al-Sharjah',
          fullName: 'Nour Al-Sharjah',
          email: 'nour.sharjah@email.com',
          mobileNumber: '0508901234',
          isActive: true,
          createdAt: '2024-03-05T15:30:00Z',
          couponCount: 9,
          invoiceCount: 7,
          googleId: null
        },
        {
          id: 9,
          firstName: 'Yousef',
          lastName: 'Al-Ajman',
          fullName: 'Yousef Al-Ajman',
          email: 'yousef.ajman@email.com',
          mobileNumber: '0509012345',
          isActive: true,
          createdAt: '2024-03-10T12:00:00Z',
          couponCount: 4,
          invoiceCount: 3,
          googleId: null
        },
        {
          id: 10,
          firstName: 'Mariam',
          lastName: 'Al-Fujairah',
          fullName: 'Mariam Al-Fujairah',
          email: 'mariam.fujairah@email.com',
          mobileNumber: '0500123456',
          isActive: true,
          createdAt: '2024-03-15T17:45:00Z',
          couponCount: 6,
          invoiceCount: 5,
          googleId: null
        },
        {
          id: 11,
          firstName: 'Hassan',
          lastName: 'Al-Ras Al-Khaimah',
          fullName: 'Hassan Al-Ras Al-Khaimah',
          email: 'hassan.rak@email.com',
          mobileNumber: '0501234568',
          isActive: false,
          createdAt: '2024-03-20T10:20:00Z',
          couponCount: 2,
          invoiceCount: 1,
          googleId: null
        },
        {
          id: 12,
          firstName: 'Zainab',
          lastName: 'Al-Umm Al-Quwain',
          fullName: 'Zainab Al-Umm Al-Quwain',
          email: 'zainab.uq@email.com',
          mobileNumber: '0502345679',
          isActive: true,
          createdAt: '2024-03-25T14:10:00Z',
          couponCount: 11,
          invoiceCount: 8,
          googleId: null
        },
        {
          id: 13,
          firstName: 'Abdullah',
          lastName: 'Al-Abu Dhabi',
          fullName: 'Abdullah Al-Abu Dhabi',
          email: 'abdullah.ad@email.com',
          mobileNumber: '0503456780',
          isActive: true,
          createdAt: '2024-04-01T09:30:00Z',
          couponCount: 15,
          invoiceCount: 12,
          googleId: null
        },
        {
          id: 14,
          firstName: 'Sara',
          lastName: 'Al-Dubai Marina',
          fullName: 'Sara Al-Dubai Marina',
          email: 'sara.marina@email.com',
          mobileNumber: '0504567891',
          isActive: true,
          createdAt: '2024-04-05T16:45:00Z',
          couponCount: 8,
          invoiceCount: 6,
          googleId: null
        },
        {
          id: 15,
          firstName: 'Tariq',
          lastName: 'Al-Jumeirah',
          fullName: 'Tariq Al-Jumeirah',
          email: 'tariq.jumeirah@email.com',
          mobileNumber: '0505678902',
          isActive: false,
          createdAt: '2024-04-10T11:15:00Z',
          couponCount: 3,
          invoiceCount: 2,
          googleId: null
        }
      ];
      
      this.filteredCustomers = [...this.customers];
      this.updatePagination();
      
      console.log('Loaded dummy customers:', this.customers.length);
    }, 500); // Simulate API delay
  }


  private setupSearch(): void {
    this.searchForm.get('search')?.valueChanges.subscribe(value => {
      const searchTerm = value.trim().toLowerCase();
      if (searchTerm) {
        this.filteredCustomers = this.customers.filter(customer => 
          customer.firstName.toLowerCase().includes(searchTerm) ||
          customer.lastName.toLowerCase().includes(searchTerm) ||
          customer.fullName.toLowerCase().includes(searchTerm) ||
          customer.email.toLowerCase().includes(searchTerm)
        );
      } else {
        this.filteredCustomers = [...this.customers];
      }
      this.currentPage = 1;
      this.updatePagination();
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
      // For now, update locally. Replace with API call when backend is ready
      customer.isActive = !customer.isActive;
      
      // Update the customers array
      const index = this.customers.findIndex(c => c.id === customer.id);
      if (index > -1) {
        this.customers[index] = customer;
      }
      
      // Update filtered customers
      const filteredIndex = this.filteredCustomers.findIndex(c => c.id === customer.id);
      if (filteredIndex > -1) {
        this.filteredCustomers[filteredIndex] = customer;
      }
      
      this.updatePagination();
      
      this.toastr.success(`Customer ${action}d successfully`, 'Success');
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
      this.customers = this.customers.filter(c => c.id !== customer.id);
      this.filteredCustomers = this.filteredCustomers.filter(c => c.id !== customer.id);
      this.updatePagination();
      this.toastr.success('Customer deleted successfully', 'Success');
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
        const updatedCustomer = {
          ...this.editingCustomer,
          ...formValue,
          fullName: `${formValue.firstName} ${formValue.lastName}`
        };
        
        const index = this.customers.findIndex(c => c.id === this.editingCustomer!.id);
        if (index > -1) {
          this.customers[index] = updatedCustomer;
        }
        
        const filteredIndex = this.filteredCustomers.findIndex(c => c.id === this.editingCustomer!.id);
        if (filteredIndex > -1) {
          this.filteredCustomers[filteredIndex] = updatedCustomer;
        }
        
        this.updatePagination();
        
        this.toastr.success('Customer updated successfully', 'Success');
      } else {
        // Add new customer
        const newCustomer: Customer = {
          id: Date.now(), // Simple ID generation
          ...formValue,
          fullName: `${formValue.firstName} ${formValue.lastName}`,
          isActive: true,
          createdAt: new Date().toISOString(),
          couponCount: 0,
          invoiceCount: 0,
          googleId: null
        };
        
        this.customers.unshift(newCustomer);
        this.filteredCustomers.unshift(newCustomer);
        this.updatePagination();
        
        this.toastr.success('Customer added successfully', 'Success');
      }
      
      this.showAddCustomerForm = false;
      this.customerForm.reset();
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
  updatePagination(): void {
    this.totalItems = this.filteredCustomers.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedCustomers = this.filteredCustomers.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
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
