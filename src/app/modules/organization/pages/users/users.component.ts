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
    // Commented out API integration for dummy data
    // this.loadUsers();
    // this.loadServiceCenters();
    this.loadDummyUsers();
    this.loadDummyServiceCenters();
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

  // Commented out API integration - replaced with dummy data
  // private loadUsers(): void {
  //   this.userService.getUsers().subscribe({
  //     next: (users) => {
  //       this.users = users;
  //       this.filteredUsers = [...users];
  //       this.updatePagination();
  //     },
  //     error: (error) => {
  //       console.error('Error loading users:', error);
  //       this.snackBar.open('Error loading users', 'Close', {
  //         duration: 3000,
  //         horizontalPosition: 'right',
  //         verticalPosition: 'top'
  //       });
  //       this.users = [];
  //       this.filteredUsers = [];
  //       this.updatePagination();
  //     }
  //   });
  // }

  // private loadServiceCenters(): void {
  //   this.serviceCenterService.getServiceCenters().subscribe({
  //     next: (serviceCenters) => {
  //       this.serviceCenters = serviceCenters;
  //     },
  //     error: (error) => {
  //       console.error('Error loading service centers:', error);
  //       this.snackBar.open('Error loading service centers', 'Close', {
  //         duration: 3000,
  //         horizontalPosition: 'right',
  //         verticalPosition: 'top'
  //       });
  //       this.serviceCenters = [];
  //     }
  //   });
  // }

  private loadDummyUsers(): void {
    // Simulate API delay
    setTimeout(() => {
      this.users = [
        {
          id: 1,
          firstName: 'Ahmed',
          lastName: 'Al-Rashid',
          email: 'ahmed.rashid@ces.com',
          mobileNumber: '0501234567',
          role: 'SuperAdmin',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          lastLogin: '2024-04-15T09:15:00Z',
          serviceCenterId: undefined,
          serviceCenterName: undefined
        },
        {
          id: 2,
          firstName: 'Fatima',
          lastName: 'Hassan',
          email: 'fatima.hassan@ces.com',
          mobileNumber: '0502345678',
          role: 'Admin',
          isActive: true,
          createdAt: '2024-01-20T14:15:00Z',
          lastLogin: '2024-04-14T16:30:00Z',
          serviceCenterId: 1,
          serviceCenterName: 'Dubai Center'
        },
        {
          id: 3,
          firstName: 'Mohammed',
          lastName: 'Al-Zahra',
          email: 'mohammed.zahra@ces.com',
          mobileNumber: '0503456789',
          role: 'Admin',
          isActive: false,
          createdAt: '2024-02-01T09:45:00Z',
          lastLogin: '2024-03-20T11:20:00Z',
          serviceCenterId: 2,
          serviceCenterName: 'Abu Dhabi Center'
        },
        {
          id: 4,
          firstName: 'Aisha',
          lastName: 'Al-Mansouri',
          email: 'aisha.mansouri@ces.com',
          mobileNumber: '0504567890',
          role: 'Admin',
          isActive: true,
          createdAt: '2024-02-10T16:20:00Z',
          lastLogin: '2024-04-13T14:45:00Z',
          serviceCenterId: 3,
          serviceCenterName: 'Sharjah Center'
        },
        {
          id: 5,
          firstName: 'Omar',
          lastName: 'Al-Sabah',
          email: 'omar.sabah@ces.com',
          mobileNumber: '0505678901',
          role: 'Admin',
          isActive: true,
          createdAt: '2024-02-15T11:30:00Z',
          lastLogin: '2024-04-12T10:15:00Z',
          serviceCenterId: 4,
          serviceCenterName: 'Ajman Center'
        },
        {
          id: 6,
          firstName: 'Layla',
          lastName: 'Al-Kuwaiti',
          email: 'layla.kuwaiti@ces.com',
          mobileNumber: '0506789012',
          role: 'Admin',
          isActive: true,
          createdAt: '2024-02-20T13:45:00Z',
          lastLogin: '2024-04-11T15:30:00Z',
          serviceCenterId: 5,
          serviceCenterName: 'Fujairah Center'
        },
        {
          id: 7,
          firstName: 'Khalid',
          lastName: 'Al-Dubai',
          email: 'khalid.dubai@ces.com',
          mobileNumber: '0507890123',
          role: 'Admin',
          isActive: false,
          createdAt: '2024-03-01T08:15:00Z',
          lastLogin: '2024-03-15T12:00:00Z',
          serviceCenterId: 1,
          serviceCenterName: 'Dubai Center'
        },
        {
          id: 8,
          firstName: 'Nour',
          lastName: 'Al-Sharjah',
          email: 'nour.sharjah@ces.com',
          mobileNumber: '0508901234',
          role: 'Admin',
          isActive: true,
          createdAt: '2024-03-05T15:30:00Z',
          lastLogin: '2024-04-10T09:45:00Z',
          serviceCenterId: 3,
          serviceCenterName: 'Sharjah Center'
        },
        {
          id: 9,
          firstName: 'Yousef',
          lastName: 'Al-Ajman',
          email: 'yousef.ajman@ces.com',
          mobileNumber: '0509012345',
          role: 'Admin',
          isActive: true,
          createdAt: '2024-03-10T12:00:00Z',
          lastLogin: '2024-04-09T13:20:00Z',
          serviceCenterId: 4,
          serviceCenterName: 'Ajman Center'
        },
        {
          id: 10,
          firstName: 'Mariam',
          lastName: 'Al-Fujairah',
          email: 'mariam.fujairah@ces.com',
          mobileNumber: '0500123456',
          role: 'Admin',
          isActive: true,
          createdAt: '2024-03-15T17:45:00Z',
          lastLogin: '2024-04-08T11:10:00Z',
          serviceCenterId: 5,
          serviceCenterName: 'Fujairah Center'
        },
        {
          id: 11,
          firstName: 'Hassan',
          lastName: 'Al-Ras Al-Khaimah',
          email: 'hassan.rak@ces.com',
          mobileNumber: '0501234568',
          role: 'Admin',
          isActive: false,
          createdAt: '2024-03-20T10:20:00Z',
          lastLogin: '2024-03-25T14:30:00Z',
          serviceCenterId: 6,
          serviceCenterName: 'Ras Al Khaimah Center'
        },
        {
          id: 12,
          firstName: 'Zainab',
          lastName: 'Al-Umm Al-Quwain',
          email: 'zainab.uq@ces.com',
          mobileNumber: '0502345679',
          role: 'Admin',
          isActive: true,
          createdAt: '2024-03-25T14:10:00Z',
          lastLogin: '2024-04-07T16:45:00Z',
          serviceCenterId: 7,
          serviceCenterName: 'Umm Al Quwain Center'
        }
      ];
      
      this.filteredUsers = [...this.users];
      this.updatePagination();
      
      console.log('Loaded dummy users:', this.users.length);
    }, 500); // Simulate API delay
  }

  private loadDummyServiceCenters(): void {
    // Simulate API delay
    setTimeout(() => {
      this.serviceCenters = [
        {
          id: 1,
          name: 'Dubai Center',
          address: 'Sheikh Zayed Road, Dubai',
          contactNumber: '0501234567',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          lastUpdated: '2024-04-15T09:15:00Z'
        },
        {
          id: 2,
          name: 'Abu Dhabi Center',
          address: 'Corniche Road, Abu Dhabi',
          contactNumber: '0502345678',
          isActive: true,
          createdAt: '2024-01-20T14:15:00Z',
          lastUpdated: '2024-04-14T16:30:00Z'
        },
        {
          id: 3,
          name: 'Sharjah Center',
          address: 'Al Qasba, Sharjah',
          contactNumber: '0503456789',
          isActive: true,
          createdAt: '2024-02-01T09:45:00Z',
          lastUpdated: '2024-04-13T14:45:00Z'
        },
        {
          id: 4,
          name: 'Ajman Center',
          address: 'Ajman Corniche, Ajman',
          contactNumber: '0504567890',
          isActive: true,
          createdAt: '2024-02-10T16:20:00Z',
          lastUpdated: '2024-04-12T10:15:00Z'
        },
        {
          id: 5,
          name: 'Fujairah Center',
          address: 'Fujairah Port, Fujairah',
          contactNumber: '0505678901',
          isActive: true,
          createdAt: '2024-02-15T11:30:00Z',
          lastUpdated: '2024-04-11T15:30:00Z'
        },
        {
          id: 6,
          name: 'Ras Al Khaimah Center',
          address: 'RAK City, Ras Al Khaimah',
          contactNumber: '0506789012',
          isActive: false,
          createdAt: '2024-03-01T08:15:00Z',
          lastUpdated: '2024-03-15T12:00:00Z'
        },
        {
          id: 7,
          name: 'Umm Al Quwain Center',
          address: 'UAQ City, Umm Al Quwain',
          contactNumber: '0507890123',
          isActive: true,
          createdAt: '2024-03-05T15:30:00Z',
          lastUpdated: '2024-04-10T09:45:00Z'
        }
      ];
      
      console.log('Loaded dummy service centers:', this.serviceCenters.length);
    }, 300); // Simulate API delay
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
        // Commented out API integration - using local update for dummy data
        // this.userService.updateUser(this.editingUser.id, formValue).subscribe({...});
        
        // Update existing user locally
        const updatedUser = {
          ...this.editingUser,
          ...formValue,
          serviceCenterName: this.getServiceCenterName(formValue.serviceCenterId)
        };
        
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
        this.isSubmitting = false;
      } else {
        // Commented out API integration - using local creation for dummy data
        // this.userService.createUser(createData).subscribe({...});
        
        // Add new user locally
        const newUser: User = {
          id: Date.now(), // Simple ID generation
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          mobileNumber: formValue.mobileNumber,
          role: formValue.role || 'Admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          serviceCenterId: formValue.serviceCenterId || undefined,
          serviceCenterName: this.getServiceCenterName(formValue.serviceCenterId)
        };
        
        this.users.unshift(newUser);
        this.filteredUsers.unshift(newUser);
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
        this.isSubmitting = false;
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
