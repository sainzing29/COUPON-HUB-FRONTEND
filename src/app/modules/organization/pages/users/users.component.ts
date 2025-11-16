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
import { UserService, User } from './user.service';
import { ServiceCenterService, ServiceCenter } from '../service-centers/service-center.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { CamelCasePipe } from '../../../../core/pipes/camel-case.pipe';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CountryCodeSelectorComponent, COUNTRY_CODES } from '../../components/country-code-selector/country-code-selector.component';

// User interface is now imported from the service

@Component({
  selector: 'app-users',
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
    ReactiveFormsModule,
    CamelCasePipe,
    NgxSkeletonLoaderModule,
    CountryCodeSelectorComponent
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
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
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  serviceCenters: ServiceCenter[] = [];
  
  // Status constants
  readonly STATUS_DEACTIVATED = 0;
  readonly STATUS_INVITED = 1;
  readonly STATUS_ACTIVE = 2;
  readonly STATUS_DELETED = 3;
  
  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  searchForm: FormGroup;
  showAddUserForm = false;
  userForm: FormGroup;
  isEditMode = false;
  editingUser: User | null = null;
  isSubmitting = false;
  showDeletedUsers = false;
  allowEmailChange = false;
  isLoading = false;

  selectedCountryCode = '+971'; // Default to UAE

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private userService: UserService,
    private serviceCenterService: ServiceCenterService
  ) {
    this.searchForm = this.fb.group({
      search: ['']
    });

    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+971', [Validators.required]], // Default to UAE
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      role: ['Admin'], // Hidden field with default value
      serviceCenterId: ['', [this.serviceCenterRequiredValidator.bind(this)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers(false);
    this.loadServiceCenters();
    this.setupSearch();
  }

  // Custom validator for serviceCenterId - required only when role is 'Admin'
  private serviceCenterRequiredValidator(control: any) {
    const roleControl = this.userForm?.get('role');
    const role = roleControl?.value;
    
    // Only require serviceCenterId when role is 'Admin' and we're creating a new user
    if (role === 'Admin' && !this.isEditMode && (!control.value || control.value === '')) {
      return { required: true };
    }
    return null;
  }

  // Method to update serviceCenterId validation when role changes
  private updateServiceCenterValidation(): void {
    const serviceCenterControl = this.userForm.get('serviceCenterId');
    if (serviceCenterControl) {
      serviceCenterControl.updateValueAndValidity();
    }
  }

  private loadUsers(allUsers: boolean = false): void {
    this.isLoading = true;
    this.userService.getUsers(allUsers).subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.toastr.error('Error loading users', 'Error');
        this.users = [];
        this.filteredUsers = [];
        this.updatePagination();
        this.isLoading = false;
      }
    });
  }

  onShowDeletedUsersChange(): void {
    this.loadUsers(this.showDeletedUsers);
  }

  private loadServiceCenters(): void {
    this.serviceCenterService.getServiceCenters().subscribe({
      next: (serviceCenters) => {
        this.serviceCenters = serviceCenters;
      },
      error: (error) => {
        console.error('Error loading service centers:', error);
        this.toastr.error('Error loading service centers', 'Error');
        this.serviceCenters = [];
      }
    });
  }


  private setupSearch(): void {
    this.searchForm.get('search')?.valueChanges.subscribe(value => {
      const searchTerm = value.trim().toLowerCase();
      if (searchTerm) {
        this.filteredUsers = this.users.filter(user => 
          user.firstName.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.roleName.toLowerCase().includes(searchTerm)
        );
      } else {
        this.filteredUsers = [...this.users];
      }
      this.currentPage = 1;
      this.updatePagination();
    });
  }

  onAddUser(): void {
    this.isEditMode = false;
    this.editingUser = null;
    this.allowEmailChange = false;
    this.selectedCountryCode = '+971'; // Reset to UAE default
    this.userForm.reset();
    // Explicitly set role and country code to defaults for new users
    this.userForm.patchValue({
      role: 'Admin',
      countryCode: '+971'
    });
    this.showAddUserForm = true;
  }

  onEditUser(user: User): void {
    this.isEditMode = true;
    this.editingUser = user;
    this.allowEmailChange = false;
    
    // Extract country code and phone number from mobileNumber if it includes country code
    let countryCode = '+971'; // Default
    let mobileNumber = user.mobileNumber || '';
    
    // Check if mobileNumber starts with a country code
    const matchedCountry = COUNTRY_CODES.find(cc => mobileNumber.startsWith(cc.code));
    if (matchedCountry) {
      countryCode = matchedCountry.code;
      mobileNumber = mobileNumber.substring(matchedCountry.code.length).trim();
    }
    
    this.selectedCountryCode = countryCode;
    
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      countryCode: countryCode,
      mobileNumber: mobileNumber,
      role: user.roleName, // Set role from selected user
      serviceCenterId: user.serviceCenterId || ''
    });
    // Disable email field initially
    this.userForm.get('email')?.disable();
    // Update validation after setting role
    this.updateServiceCenterValidation();
    this.showAddUserForm = true;
  }

  onAllowEmailChangeToggle(): void {
    if (this.allowEmailChange) {
      this.userForm.get('email')?.enable();
    } else {
      this.userForm.get('email')?.disable();
    }
  }

  onDeactivateUser(user: User): void {
    // Determine action and new status
    let action: string;
    let newStatus: number;
    
    if (user.status === this.STATUS_ACTIVE) {
      action = 'deactivate';
      newStatus = this.STATUS_DEACTIVATED;
    } else {
      action = 'activate';
      newStatus = this.STATUS_ACTIVE;
    }
    
    const message = `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`;
    
    if (confirm(message)) {
      this.userService.toggleUserStatus(user.id, newStatus).subscribe({
        next: (updatedUser) => {
          // Merge updated data with existing user data to preserve all fields
          const mergedUser = { ...user, ...updatedUser, status: newStatus };
          
          // Update in main users array - create new array reference
          const index = this.users.findIndex(u => u.id === user.id);
          if (index > -1) {
            this.users[index] = mergedUser;
            this.users = [...this.users]; // Create new array reference
          }
          
          // Update in filtered users array - create new array reference
          const filteredIndex = this.filteredUsers.findIndex(u => u.id === user.id);
          if (filteredIndex > -1) {
            this.filteredUsers[filteredIndex] = mergedUser;
            this.filteredUsers = [...this.filteredUsers]; // Create new array reference
          }
          
          // Update in paginated users array for immediate UI update - create new array reference
          const paginatedIndex = this.paginatedUsers.findIndex(u => u.id === user.id);
          if (paginatedIndex > -1) {
            this.paginatedUsers[paginatedIndex] = mergedUser;
            this.paginatedUsers = [...this.paginatedUsers]; // Create new array reference
          }
          
          this.toastr.success(`User ${action}d successfully`, 'Success');
        },
        error: (error) => {
          console.error('Error updating user status:', error);
          this.toastr.error('Error updating user status', 'Error');
        }
      });
    }
  }

  onDeleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
          this.updatePagination();
          this.toastr.success('User deleted successfully', 'Success');
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.toastr.error('Error deleting user', 'Error');
        }
      });
    }
  }

  onResendPasswordEmail(user: User): void {
    const message = `Resend password setup email to ${user.email}?`;
    
    if (confirm(message)) {
      this.userService.resendPasswordEmail(user.id).subscribe({
        next: () => {
          this.toastr.success('Password setup email sent successfully', 'Success');
        },
        error: (error) => {
          console.error('Error sending password email:', error);
          const errorMessage = error?.message || error?.error?.message || 'Failed to send password setup email';
          this.toastr.error(errorMessage, 'Error');
        },
        complete: () => {
          console.log('Resend password email request completed');
        }
      });
    }
  }

  onSaveUser(): void {
    if (this.userForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      // Re-enable email field before getting form value if it's disabled
      const emailControl = this.userForm.get('email');
      const wasDisabled = emailControl?.disabled;
      if (wasDisabled) {
        emailControl?.enable();
      }
      
      const formValue = this.userForm.value;
      
      // Combine country code with mobile number
      if (formValue.countryCode && formValue.mobileNumber) {
        formValue.mobileNumber = `${formValue.countryCode}${formValue.mobileNumber}`;
      }
      
      // Remove countryCode from formValue as backend might not expect it
      delete formValue.countryCode;
      
      // Remove role from formValue when creating user (not needed in add API)
      if (!this.isEditMode) {
        delete formValue.role;
      } else if (this.isEditMode && formValue.role) {
        // For update, rename role to roleName
        formValue.roleName = formValue.role;
        delete formValue.role;
      }
      
      if (this.isEditMode && this.editingUser) {
        this.userService.updateUser(this.editingUser.id, formValue).subscribe({
          next: (updatedUser) => {
            const index = this.users.findIndex(u => u.id === this.editingUser!.id);
            if (index > -1) {
              this.users[index] = updatedUser;
            }
            
            const filteredIndex = this.filteredUsers.findIndex(u => u.id === this.editingUser!.id);
            if (filteredIndex > -1) {
              this.filteredUsers[filteredIndex] = updatedUser;
            }
            
            this.updatePagination();
            this.toastr.success('User updated successfully', 'Success');
            
            // Close popup and reset form on success
            this.showAddUserForm = false;
            this.userForm.reset();
            this.userForm.patchValue({ role: 'Admin' });
            this.isSubmitting = false;
          },
          error: (error) => {
            this.toastr.error(error, 'Error');
            this.isSubmitting = false;
          }
        });
      } else {
        this.userService.createUser(formValue).subscribe({
          next: (newUser) => {
            this.users.unshift(newUser);
            this.filteredUsers.unshift(newUser);
            this.updatePagination();
            this.toastr.success('User added successfully', 'Success');
            
            // Close popup and reset form on success
            this.showAddUserForm = false;
            this.userForm.reset();
            this.userForm.patchValue({ role: 'Admin' });
            this.isSubmitting = false;
          },
          error: (error) => {
              this.toastr.error(error, 'Error');
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.showAddUserForm = false;
    this.selectedCountryCode = '+971'; // Reset to UAE default
    this.userForm.reset();
    // Ensure role and country code are set to defaults after reset
    this.userForm.patchValue({
      role: 'Admin',
      countryCode: '+971'
    });
    // Re-enable email field
    this.userForm.get('email')?.enable();
    this.isEditMode = false;
    this.editingUser = null;
    this.isSubmitting = false; // Reset submitting state
    this.allowEmailChange = false;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
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
        return 'Please enter a valid mobile number (7-15 digits)';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      mobileNumber: 'Mobile Number',
      role: 'Role',
      serviceCenterId: 'Service Center'
    };
    return labels[fieldName] || fieldName;
  }

  getRoleBadgeClass(roleName: string): string {
    const classes: { [key: string]: string } = {
      'Admin': 'bg-red-100 text-red-800',
      'Manager': 'bg-yellow-100 text-yellow-800',
      'User': 'bg-blue-100 text-blue-800'
    };
    return classes[roleName] || 'bg-gray-100 text-gray-800';
  }

  getServiceCenterName(serviceCenterId: number | undefined): string {
    if (!serviceCenterId) return 'N/A';
    const serviceCenter = this.serviceCenters.find(sc => sc.id === serviceCenterId);
    return serviceCenter ? serviceCenter.name : 'N/A';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  // Status helper methods
  getStatusText(status: number): string {
    switch (status) {
      case this.STATUS_DEACTIVATED:
        return 'Deactivated';
      case this.STATUS_INVITED:
        return 'Invited';
      case this.STATUS_ACTIVE:
        return 'Active';
      case this.STATUS_DELETED:
        return 'Deleted';
      default:
        return 'Unknown';
    }
  }

  getStatusBadgeClass(status: number): string {
    switch (status) {
      case this.STATUS_DEACTIVATED:
        return 'bg-red-100 text-red-800';
      case this.STATUS_INVITED:
        return 'bg-yellow-100 text-yellow-800';
      case this.STATUS_ACTIVE:
        return 'bg-green-100 text-green-800';
      case this.STATUS_DELETED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: number): string {
    switch (status) {
      case this.STATUS_DEACTIVATED:
        return 'bi-x-circle-fill';
      case this.STATUS_INVITED:
        return 'bi-envelope-fill';
      case this.STATUS_ACTIVE:
        return 'bi-check-circle-fill';
      case this.STATUS_DELETED:
        return 'bi-trash-fill';
      default:
        return 'bi-circle-fill';
    }
  }

  isUserActive(user: User): boolean {
    return user.status === this.STATUS_ACTIVE;
  }

  canToggleUserStatus(user: User): boolean {
    // Can toggle between Active/Deactivated/Deleted (not Invited)
    return user.status === this.STATUS_ACTIVE || user.status === this.STATUS_DEACTIVATED || user.status === this.STATUS_DELETED;
  }

  getToggleStatusIcon(user: User): string {
    return user.status === this.STATUS_ACTIVE ? 'bi-person-x' : 'bi-person-check';
  }

  getToggleStatusTitle(user: User): string {
    return user.status === this.STATUS_ACTIVE ? 'Deactivate User' : 'Activate User';
  }

  getToggleStatusButtonClass(user: User): string {
    return user.status === this.STATUS_ACTIVE 
      ? 'text-orange-600 hover:text-orange-800' 
      : 'text-green-600 hover:text-green-800';
  }

  // Pagination methods
  updatePagination(): void {
    this.totalItems = this.filteredUsers.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
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

  getSelectedCountryFlag(): string {
    const selectedCode = this.userForm.get('countryCode')?.value || this.selectedCountryCode;
    const country = COUNTRY_CODES.find(cc => cc.code === selectedCode);
    return country?.flag || '🇦🇪';
  }
}
