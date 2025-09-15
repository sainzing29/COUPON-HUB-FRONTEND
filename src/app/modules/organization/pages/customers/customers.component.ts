import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService, Customer } from '../../services/customer.service';
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
    MatSnackBarModule,
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
    private snackBar: MatSnackBar,
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
        this.snackBar.open('Error loading customers', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        // Handle error without fallback data
        this.customers = [];
        this.filteredCustomers = [];
        this.updatePagination();
      }
    });
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
      
      this.snackBar.open(`Customer ${action}d successfully`, 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }

  onDeleteCustomer(customer: Customer): void {
    if (confirm(`Are you sure you want to delete ${customer.firstName} ${customer.lastName}?`)) {
      // For now, delete locally. Replace with API call when backend is ready
      this.customers = this.customers.filter(c => c.id !== customer.id);
      this.filteredCustomers = this.filteredCustomers.filter(c => c.id !== customer.id);
      this.updatePagination();
      
      this.snackBar.open('Customer deleted successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
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
        
        this.snackBar.open('Customer updated successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
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
        
        this.snackBar.open('Customer added successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
      
      this.showAddCustomerForm = false;
      this.customerForm.reset();
    } else {
      this.markFormGroupTouched();
    }
  }

  onViewCustomer(customer: Customer): void {
    this.router.navigate(['/organization/customer-profile', customer.id]);
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
