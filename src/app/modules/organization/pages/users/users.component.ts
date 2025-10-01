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
import { UserService, User } from '../../services/user.service';
import { ServiceCenterService, ServiceCenter } from '../../services/service-center.service';
import { trigger, transition, style, animate } from '@angular/animations';

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
    MatSnackBarModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule
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


  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
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
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      role: ['Admin'], // Hidden field with default value
      serviceCenterId: ['', [this.serviceCenterRequiredValidator.bind(this)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
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

  private loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.updatePagination();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error loading users', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        this.users = [];
        this.filteredUsers = [];
        this.updatePagination();
      }
    });
  }

  private loadServiceCenters(): void {
    this.serviceCenterService.getServiceCenters().subscribe({
      next: (serviceCenters) => {
        this.serviceCenters = serviceCenters;
      },
      error: (error) => {
        console.error('Error loading service centers:', error);
        this.snackBar.open('Error loading service centers', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
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
          user.role.toLowerCase().includes(searchTerm)
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
    this.userForm.reset();
    // Explicitly set role to 'Admin' for new users
    this.userForm.patchValue({
      role: 'Admin'
    });
    this.showAddUserForm = true;
  }

  onEditUser(user: User): void {
    this.isEditMode = true;
    this.editingUser = user;
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role, // Set role from selected user
      serviceCenterId: user.serviceCenterId || ''
    });
    // Update validation after setting role
    this.updateServiceCenterValidation();
    this.showAddUserForm = true;
  }

  onDeactivateUser(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    const message = `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`;
    
    if (confirm(message)) {
      // For now, update locally. Replace with API call when backend is ready
      user.isActive = !user.isActive;
      
      // Update the users array
      const index = this.users.findIndex(u => u.id === user.id);
      if (index > -1) {
        this.users[index] = user;
      }
      
      // Update filtered users
      const filteredIndex = this.filteredUsers.findIndex(u => u.id === user.id);
      if (filteredIndex > -1) {
        this.filteredUsers[filteredIndex] = user;
      }
      
      this.updatePagination();
      
      // Uncomment when API is ready:
      // this.userService.toggleUserStatus(user.id, !user.isActive).subscribe({
      //   next: (updatedUser) => {
      //     const index = this.users.findIndex(u => u.id === user.id);
      //     if (index > -1) {
      //       this.users[index] = updatedUser;
      //     }
      //     this.updatePagination();
      //     this.snackBar.open(`User ${action}d successfully`, 'Close', {
      //       duration: 3000,
      //       horizontalPosition: 'right',
      //       verticalPosition: 'top'
      //     });
      //   },
      //   error: (error) => {
      //     console.error('Error updating user status:', error);
      //     this.snackBar.open('Error updating user status', 'Close', {
      //       duration: 3000,
      //       horizontalPosition: 'right',
      //       verticalPosition: 'top'
      //     });
      //   }
      // });
      
      this.snackBar.open(`User ${action}d successfully`, 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }

  onDeleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      // For now, delete locally. Replace with API call when backend is ready
      this.users = this.users.filter(u => u.id !== user.id);
      this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
      this.updatePagination();
      
      // Uncomment when API is ready:
      // this.userService.deleteUser(user.id).subscribe({
      //   next: () => {
      //     this.users = this.users.filter(u => u.id !== user.id);
      //     this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
      //     this.updatePagination();
      //     this.snackBar.open('User deleted successfully', 'Close', {
      //       duration: 3000,
      //       horizontalPosition: 'right',
      //       verticalPosition: 'top'
      //     });
      //   },
      //   error: (error) => {
      //     console.error('Error deleting user:', error);
      //     this.snackBar.open('Error deleting user', 'Close', {
      //       duration: 3000,
      //       horizontalPosition: 'right',
      //       verticalPosition: 'top'
      //     });
      //   }
      // });
      
      this.snackBar.open('User deleted successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }

  onSaveUser(): void {
    if (this.userForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.userForm.value;
      console.log('Form values:', formValue); // Debug log
      
      if (this.isEditMode && this.editingUser) {
        // Update existing user - role is already set from form
        this.userService.updateUser(this.editingUser.id, formValue).subscribe({
          next: (updatedUser) => {
            this.isSubmitting = false;
            const index = this.users.findIndex(u => u.id === this.editingUser!.id);
            if (index > -1) {
              this.users[index] = updatedUser;
            }
            
            const filteredIndex = this.filteredUsers.findIndex(u => u.id === this.editingUser!.id);
            if (filteredIndex > -1) {
              this.filteredUsers[filteredIndex] = updatedUser;
            }
            
            this.updatePagination();
            this.snackBar.open('User updated successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            
            // Close popup and reset form on success
            this.showAddUserForm = false;
            this.userForm.reset();
            this.userForm.patchValue({ role: 'Admin' });
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Error updating user:', error);
            this.snackBar.open('Error updating user', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            // Don't close popup on error
          }
        });
      } else {
        // Add new user - role is already set from form (defaults to 'Admin')
        const createData = {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          mobileNumber: formValue.mobileNumber,
          role: formValue.role || 'Admin', // Use role from form, fallback to 'Admin' if null
          passwordHash: '', // Empty password hash for new users
          serviceCenterId: formValue.serviceCenterId || null,
          isActive: true
        };
        
        this.userService.createUser(createData).subscribe({
          next: (createdUser) => {
            this.isSubmitting = false;
            this.users.unshift(createdUser);
            this.filteredUsers.unshift(createdUser);
            this.updatePagination();
            this.snackBar.open('User added successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            
            // Close popup and reset form on success
            this.showAddUserForm = false;
            this.userForm.reset();
            this.userForm.patchValue({ role: 'Admin' });
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Error creating user:', error);
            this.snackBar.open('Error creating user', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            // Don't close popup on error
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.showAddUserForm = false;
    this.userForm.reset();
    // Ensure role is set to 'Admin' after reset
    this.userForm.patchValue({
      role: 'Admin'
    });
    this.isEditMode = false;
    this.editingUser = null;
    this.isSubmitting = false; // Reset submitting state
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
      mobileNumber: 'Mobile Number',
      role: 'Role',
      serviceCenterId: 'Service Center'
    };
    return labels[fieldName] || fieldName;
  }

  getRoleBadgeClass(role: string): string {
    const classes: { [key: string]: string } = {
      'Admin': 'bg-red-100 text-red-800',
      'Manager': 'bg-yellow-100 text-yellow-800',
      'User': 'bg-blue-100 text-blue-800'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }

  getServiceCenterName(serviceCenterId: number | undefined): string {
    if (!serviceCenterId) return 'N/A';
    const serviceCenter = this.serviceCenters.find(sc => sc.id === serviceCenterId);
    return serviceCenter ? serviceCenter.name : 'N/A';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
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
}
