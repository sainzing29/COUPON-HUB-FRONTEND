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
import { ServiceCenterService, ServiceCenter } from '../../services/service-center.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-service-centers',
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
  templateUrl: './service-centers.component.html',
  styleUrls: ['./service-centers.component.scss'],
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
export class ServiceCentersComponent implements OnInit {
  serviceCenters: ServiceCenter[] = [];
  filteredServiceCenters: ServiceCenter[] = [];
  paginatedServiceCenters: ServiceCenter[] = [];
  
  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  searchForm: FormGroup;
  showAddServiceCenterForm = false;
  serviceCenterForm: FormGroup;
  isEditMode = false;
  editingServiceCenter: ServiceCenter | null = null;

  // Sample data - replace with actual API calls
  private sampleServiceCenters: ServiceCenter[] = [
    {
      id: 1,
      name: 'Downtown Service Center',
      address: '123 Main Street, Downtown',
      contactNumber: '1234567890',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      lastUpdated: '2024-01-20T14:22:00Z'
    },
    {
      id: 2,
      name: 'Uptown Service Center',
      address: '456 Oak Avenue, Uptown',
      contactNumber: '0987654321',
      isActive: true,
      createdAt: '2024-01-16T09:15:00Z',
      lastUpdated: '2024-01-19T16:45:00Z'
    },
    {
      id: 3,
      name: 'Westside Service Center',
      address: '789 Pine Road, Westside',
      contactNumber: '1122334455',
      isActive: false,
      createdAt: '2024-01-10T11:20:00Z'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private serviceCenterService: ServiceCenterService
  ) {
    this.searchForm = this.fb.group({
      search: ['']
    });

    this.serviceCenterForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  ngOnInit(): void {
    // Commented out API integration for dummy data
    // this.loadServiceCenters();
    this.loadDummyServiceCenters();
    this.setupSearch();
  }

  // Commented out API integration - replaced with dummy data
  // private loadServiceCenters(): void {
  //   this.serviceCenterService.getServiceCenters().subscribe({
  //     next: (serviceCenters) => {
  //       this.serviceCenters = serviceCenters;
  //       this.filteredServiceCenters = [...serviceCenters];
  //       this.updatePagination();
  //     },
  //     error: (error) => {
  //       console.error('Error loading service centers:', error);
  //       this.snackBar.open('Error loading service centers', 'Close', {
  //         duration: 3000,
  //         horizontalPosition: 'right',
  //         verticalPosition: 'top'
  //       });
  //       // Fallback to sample data on error
  //       this.serviceCenters = this.sampleServiceCenters;
  //       this.filteredServiceCenters = [...this.sampleServiceCenters];
  //       this.updatePagination();
  //     }
  //   });
  // }

  private loadDummyServiceCenters(): void {
    // Simulate API delay
    setTimeout(() => {
      this.serviceCenters = [
        {
          id: 1,
          name: 'Dubai Downtown Center',
          address: 'Sheikh Zayed Road, Downtown Dubai',
          contactNumber: '0501234567',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          lastUpdated: '2024-04-15T09:15:00Z'
        },
        {
          id: 2,
          name: 'Abu Dhabi Corniche Center',
          address: 'Corniche Road, Abu Dhabi',
          contactNumber: '0502345678',
          isActive: true,
          createdAt: '2024-01-20T14:15:00Z',
          lastUpdated: '2024-04-14T16:30:00Z'
        },
        {
          id: 3,
          name: 'Sharjah Al Qasba Center',
          address: 'Al Qasba Area, Sharjah',
          contactNumber: '0503456789',
          isActive: true,
          createdAt: '2024-02-01T09:45:00Z',
          lastUpdated: '2024-04-13T14:45:00Z'
        },
        {
          id: 4,
          name: 'Ajman Corniche Center',
          address: 'Ajman Corniche, Ajman',
          contactNumber: '0504567890',
          isActive: true,
          createdAt: '2024-02-10T16:20:00Z',
          lastUpdated: '2024-04-12T10:15:00Z'
        },
        {
          id: 5,
          name: 'Fujairah Port Center',
          address: 'Fujairah Port Area, Fujairah',
          contactNumber: '0505678901',
          isActive: true,
          createdAt: '2024-02-15T11:30:00Z',
          lastUpdated: '2024-04-11T15:30:00Z'
        },
        {
          id: 6,
          name: 'Ras Al Khaimah City Center',
          address: 'RAK City Center, Ras Al Khaimah',
          contactNumber: '0506789012',
          isActive: false,
          createdAt: '2024-03-01T08:15:00Z',
          lastUpdated: '2024-03-15T12:00:00Z'
        },
        {
          id: 7,
          name: 'Umm Al Quwain City Center',
          address: 'UAQ City Center, Umm Al Quwain',
          contactNumber: '0507890123',
          isActive: true,
          createdAt: '2024-03-05T15:30:00Z',
          lastUpdated: '2024-04-10T09:45:00Z'
        },
        {
          id: 8,
          name: 'Dubai Marina Center',
          address: 'Marina Walk, Dubai Marina',
          contactNumber: '0508901234',
          isActive: true,
          createdAt: '2024-03-10T12:00:00Z',
          lastUpdated: '2024-04-09T13:20:00Z'
        },
        {
          id: 9,
          name: 'Abu Dhabi Airport Center',
          address: 'Abu Dhabi International Airport',
          contactNumber: '0509012345',
          isActive: true,
          createdAt: '2024-03-15T17:45:00Z',
          lastUpdated: '2024-04-08T11:10:00Z'
        },
        {
          id: 10,
          name: 'Sharjah Industrial Center',
          address: 'Industrial Area, Sharjah',
          contactNumber: '0500123456',
          isActive: false,
          createdAt: '2024-03-20T10:20:00Z',
          lastUpdated: '2024-03-25T14:30:00Z'
        },
        {
          id: 11,
          name: 'Ajman Free Zone Center',
          address: 'Ajman Free Zone',
          contactNumber: '0501234568',
          isActive: true,
          createdAt: '2024-03-25T14:10:00Z',
          lastUpdated: '2024-04-07T16:45:00Z'
        },
        {
          id: 12,
          name: 'Fujairah Industrial Center',
          address: 'Fujairah Industrial Area',
          contactNumber: '0502345679',
          isActive: true,
          createdAt: '2024-04-01T09:30:00Z',
          lastUpdated: '2024-04-06T12:15:00Z'
        }
      ];
      
      this.filteredServiceCenters = [...this.serviceCenters];
      this.updatePagination();
      
      console.log('Loaded dummy service centers:', this.serviceCenters.length);
    }, 500); // Simulate API delay
  }

  private setupSearch(): void {
    this.searchForm.get('search')?.valueChanges.subscribe(value => {
      const searchTerm = value.trim().toLowerCase();
      if (searchTerm) {
        this.filteredServiceCenters = this.serviceCenters.filter(center => 
          center.name.toLowerCase().includes(searchTerm) ||
          center.address.toLowerCase().includes(searchTerm) ||
          center.contactNumber.includes(searchTerm)
        );
      } else {
        this.filteredServiceCenters = [...this.serviceCenters];
      }
      this.currentPage = 1;
      this.updatePagination();
    });
  }

  onAddServiceCenter(): void {
    this.isEditMode = false;
    this.editingServiceCenter = null;
    this.serviceCenterForm.reset();
    this.showAddServiceCenterForm = true;
  }

  onEditServiceCenter(serviceCenter: ServiceCenter): void {
    this.isEditMode = true;
    this.editingServiceCenter = serviceCenter;
    this.serviceCenterForm.patchValue({
      name: serviceCenter.name,
      address: serviceCenter.address,
      contactNumber: serviceCenter.contactNumber
    });
    this.showAddServiceCenterForm = true;
  }

  onDeactivateServiceCenter(serviceCenter: ServiceCenter): void {
    const action = serviceCenter.isActive ? 'deactivate' : 'activate';
    const message = `Are you sure you want to ${action} ${serviceCenter.name}?`;
    
    if (confirm(message)) {
      // For now, update locally. Replace with API call when backend is ready
      serviceCenter.isActive = !serviceCenter.isActive;
      
      // Update the service centers array
      const index = this.serviceCenters.findIndex(s => s.id === serviceCenter.id);
      if (index > -1) {
        this.serviceCenters[index] = serviceCenter;
      }
      
      // Update filtered service centers
      const filteredIndex = this.filteredServiceCenters.findIndex(s => s.id === serviceCenter.id);
      if (filteredIndex > -1) {
        this.filteredServiceCenters[filteredIndex] = serviceCenter;
      }
      
      this.updatePagination();
      
      // Uncomment when API is ready:
      // this.serviceCenterService.toggleServiceCenterStatus(serviceCenter.id, !serviceCenter.isActive).subscribe({
      //   next: (updatedServiceCenter) => {
      //     const index = this.serviceCenters.findIndex(s => s.id === serviceCenter.id);
      //     if (index > -1) {
      //       this.serviceCenters[index] = updatedServiceCenter;
      //     }
      //     this.updatePagination();
      //     this.snackBar.open(`Service Center ${action}d successfully`, 'Close', {
      //       duration: 3000,
      //       horizontalPosition: 'right',
      //       verticalPosition: 'top'
      //     });
      //   },
      //   error: (error) => {
      //     console.error('Error updating service center status:', error);
      //     this.snackBar.open('Error updating service center status', 'Close', {
      //       duration: 3000,
      //       horizontalPosition: 'right',
      //       verticalPosition: 'top'
      //     });
      //   }
      // });
      
      this.snackBar.open(`Service Center ${action}d successfully`, 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }

  onDeleteServiceCenter(serviceCenter: ServiceCenter): void {
    if (confirm(`Are you sure you want to delete ${serviceCenter.name}?`)) {
      // For now, delete locally. Replace with API call when backend is ready
      this.serviceCenters = this.serviceCenters.filter(s => s.id !== serviceCenter.id);
      this.filteredServiceCenters = this.filteredServiceCenters.filter(s => s.id !== serviceCenter.id);
      this.updatePagination();
      
      // Uncomment when API is ready:
      // this.serviceCenterService.deleteServiceCenter(serviceCenter.id).subscribe({
      //   next: () => {
      //     this.serviceCenters = this.serviceCenters.filter(s => s.id !== serviceCenter.id);
      //     this.filteredServiceCenters = this.filteredServiceCenters.filter(s => s.id !== serviceCenter.id);
      //     this.updatePagination();
      //     this.snackBar.open('Service Center deleted successfully', 'Close', {
      //       duration: 3000,
      //       horizontalPosition: 'right',
      //       verticalPosition: 'top'
      //     });
      //   },
      //   error: (error) => {
      //     console.error('Error deleting service center:', error);
      //     this.snackBar.open('Error deleting service center', 'Close', {
      //       duration: 3000,
      //       horizontalPosition: 'right',
      //       verticalPosition: 'top'
      //     });
      //   }
      // });
      
      this.snackBar.open('Service Center deleted successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }

  onSaveServiceCenter(): void {
    if (this.serviceCenterForm.valid) {
      const formValue = this.serviceCenterForm.value;
      
      if (this.isEditMode && this.editingServiceCenter) {
        // Update existing service center
        const updatedServiceCenter = {
          ...this.editingServiceCenter,
          ...formValue
        };
        
        const index = this.serviceCenters.findIndex(s => s.id === this.editingServiceCenter!.id);
        if (index > -1) {
          this.serviceCenters[index] = updatedServiceCenter;
        }
        
        const filteredIndex = this.filteredServiceCenters.findIndex(s => s.id === this.editingServiceCenter!.id);
        if (filteredIndex > -1) {
          this.filteredServiceCenters[filteredIndex] = updatedServiceCenter;
        }
        
        this.updatePagination();
        
        // Commented out API integration - using local update for dummy data
        // this.serviceCenterService.updateServiceCenter(this.editingServiceCenter.id, formValue).subscribe({...});
        
        this.snackBar.open('Service Center updated successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      } else {
        // Add new service center
        const newServiceCenter: ServiceCenter = {
          id: Date.now(), // Simple ID generation
          ...formValue,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        
        this.serviceCenters.unshift(newServiceCenter);
        this.filteredServiceCenters.unshift(newServiceCenter);
        this.updatePagination();
        
        // Commented out API integration - using local creation for dummy data
        // this.serviceCenterService.createServiceCenter(formValue).subscribe({...});
        
        this.snackBar.open('Service Center added successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
      
      this.showAddServiceCenterForm = false;
      this.serviceCenterForm.reset();
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.showAddServiceCenterForm = false;
    this.serviceCenterForm.reset();
    this.isEditMode = false;
    this.editingServiceCenter = null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.serviceCenterForm.controls).forEach(key => {
      const control = this.serviceCenterForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.serviceCenterForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid 10-digit contact number';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      address: 'Address',
      contactNumber: 'Contact Number'
    };
    return labels[fieldName] || fieldName;
  }


  formatDate(dateString: string | undefined): string {
    if (!dateString) {
      return 'N/A';
    }
    return new Date(dateString).toLocaleDateString();
  }

  // Pagination methods
  updatePagination(): void {
    this.totalItems = this.filteredServiceCenters.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedServiceCenters = this.filteredServiceCenters.slice(startIndex, endIndex);
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
