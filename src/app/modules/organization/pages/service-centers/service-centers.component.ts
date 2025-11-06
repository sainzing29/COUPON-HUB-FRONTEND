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
import { ServiceCenterService, ServiceCenter, ServiceCenterUpdateRequest } from './service-center.service';
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
  showAll = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
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
    this.loadServiceCenters();
    this.setupSearch();
  }

  private loadServiceCenters(showAll: boolean = false): void {
    this.serviceCenterService.getServiceCenters(showAll).subscribe({
      next: (serviceCenters) => {
        this.serviceCenters = serviceCenters;
        this.filteredServiceCenters = [...serviceCenters];
        this.updatePagination();
      },
      error: (error) => {
        console.error('Error loading service centers:', error);
        this.toastr.error('Error loading service centers', 'Error');
      }
    });
  }

  onShowAllChange(): void {
    this.loadServiceCenters(this.showAll);
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
      this.serviceCenterService.toggleServiceCenterStatus(serviceCenter.id, !serviceCenter.isActive).subscribe({
        next: (updatedServiceCenter) => {
          const index = this.serviceCenters.findIndex(s => s.id === serviceCenter.id);
          if (index > -1) {
            this.serviceCenters[index] = updatedServiceCenter;
          }
          
          const filteredIndex = this.filteredServiceCenters.findIndex(s => s.id === serviceCenter.id);
          if (filteredIndex > -1) {
            this.filteredServiceCenters[filteredIndex] = updatedServiceCenter;
          }
          
          this.updatePagination();
          this.toastr.success(`Service Center ${action}d successfully`, 'Success');
        },
        error: (error) => {
          console.error('Error updating service center status:', error);
          this.toastr.error('Error updating service center status', 'Error');
        }
      });
    }
  }

  onDeleteServiceCenter(serviceCenter: ServiceCenter): void {
    if (confirm(`Are you sure you want to delete ${serviceCenter.name}?`)) {
      this.serviceCenterService.deleteServiceCenter(serviceCenter.id).subscribe({
        next: () => {
          this.serviceCenters = this.serviceCenters.filter(s => s.id !== serviceCenter.id);
          this.filteredServiceCenters = this.filteredServiceCenters.filter(s => s.id !== serviceCenter.id);
          this.updatePagination();
          this.toastr.success('Service Center deleted successfully', 'Success');
        },
        error: (error) => {
          console.error('Error deleting service center:', error);
          this.toastr.error('Error deleting service center', 'Error');
        }
      });
    }
  }

  onRestoreServiceCenter(serviceCenter: ServiceCenter): void {
    if (confirm(`Are you sure you want to restore ${serviceCenter.name}?`)) {
      this.serviceCenterService.restoreServiceCenter(serviceCenter.id).subscribe({
        next: (restoredServiceCenter) => {
          const index = this.serviceCenters.findIndex(s => s.id === serviceCenter.id);
          if (index > -1) {
            this.serviceCenters[index] = restoredServiceCenter;
          }
          
          const filteredIndex = this.filteredServiceCenters.findIndex(s => s.id === serviceCenter.id);
          if (filteredIndex > -1) {
            this.filteredServiceCenters[filteredIndex] = restoredServiceCenter;
          }
          
          this.updatePagination();
          this.toastr.success('Service Center restored successfully', 'Success');
        },
        error: (error) => {
          console.error('Error restoring service center:', error);
          this.toastr.error('Error restoring service center', 'Error');
        }
      });
    }
  }

  onSaveServiceCenter(): void {
    if (this.serviceCenterForm.valid) {
      const formValue = this.serviceCenterForm.value;
      
      if (this.isEditMode && this.editingServiceCenter) {
        // Update existing service center
        const updateRequest: ServiceCenterUpdateRequest = {
          id: this.editingServiceCenter.id,
          ...formValue
        };
        
        this.serviceCenterService.updateServiceCenter(this.editingServiceCenter.id, updateRequest).subscribe({
          next: (updatedServiceCenter) => {
            const index = this.serviceCenters.findIndex(s => s.id === this.editingServiceCenter!.id);
            if (index > -1) {
              this.serviceCenters[index] = updatedServiceCenter;
            }
            
            const filteredIndex = this.filteredServiceCenters.findIndex(s => s.id === this.editingServiceCenter!.id);
            if (filteredIndex > -1) {
              this.filteredServiceCenters[filteredIndex] = updatedServiceCenter;
            }
            
            this.updatePagination();
            this.toastr.success('Service Center updated successfully', 'Success');
            
            this.showAddServiceCenterForm = false;
            this.serviceCenterForm.reset();
          },
          error: (error) => {
            console.error('Error updating service center:', error);
            this.toastr.error('Error updating service center', 'Error');
          }
        });
      } else {
        // Add new service center
        this.serviceCenterService.createServiceCenter(formValue).subscribe({
          next: (newServiceCenter) => {
            this.serviceCenters.unshift(newServiceCenter);
            this.filteredServiceCenters.unshift(newServiceCenter);
            this.updatePagination();
            
            this.toastr.success('Service Center added successfully', 'Success');
            
            this.showAddServiceCenterForm = false;
            this.serviceCenterForm.reset();
          },
          error: (error) => {
            console.error('Error creating service center:', error);
            this.toastr.error('Error creating service center', 'Error');
          }
        });
      }
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
