import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, transition, style, animate } from '@angular/animations';
import { CouponSchemeService } from '../service/coupon-scheme.service';
import { CouponScheme, CouponSchemeProductCreateRequest } from '../model/coupon-scheme.model';

@Component({
  selector: 'app-coupon-scheme-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './coupon-scheme-add.component.html',
  styleUrls: ['./coupon-scheme-add.component.scss'],
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
export class CouponSchemeAddComponent implements OnInit {
  schemeForm: FormGroup;
  productForm: FormGroup;
  isEditMode = false;
  schemeId: number | null = null;
  isSubmitting = false;
  isLoading = false;
  
  // Product modal state
  showProductModal = false;
  editingProductIndex: number | null = null;
  productsList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private couponSchemeService: CouponSchemeService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.schemeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      price: [0, [Validators.required, Validators.min(0), Validators.max(9999)]],
      products: this.fb.array([])
    });

    this.productForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      icon: [null],
      displayOrder: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.schemeId = parseInt(id, 10);
      this.loadScheme(this.schemeId);
    }
  }

  get productsFormArray(): FormArray {
    return this.schemeForm.get('products') as FormArray;
  }

  loadScheme(id: number): void {
    this.isLoading = true;
    this.couponSchemeService.getCouponSchemeById(id).subscribe({
      next: (scheme) => {
        this.schemeForm.patchValue({
          name: scheme.name,
          description: scheme.description,
          price: scheme.price
        });

        // Clear existing products
        while (this.productsFormArray.length !== 0) {
          this.productsFormArray.removeAt(0);
        }

        // Add products from scheme
        scheme.products.forEach(product => {
          this.productsFormArray.push(this.createProductFormGroup({
            id: product.id,
            name: product.name,
            description: product.description,
            icon: product.icon || null,
            displayOrder: product.displayOrder
          }));
        });

        this.updateProductsList();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading coupon scheme:', error);
        this.toastr.error('Error loading coupon scheme', 'Error');
        this.isLoading = false;
        this.router.navigate(['/organization/coupons/coupon-schemes']);
      }
    });
  }

  createProductFormGroup(product?: Partial<CouponSchemeProductCreateRequest> & { id?: number }): FormGroup {
    return this.fb.group({
      id: [product?.id || null],
      name: [product?.name || '', [Validators.required, Validators.minLength(2)]],
      description: [product?.description || '', [Validators.required, Validators.minLength(5)]],
      icon: [product?.icon || null],
      displayOrder: [product?.displayOrder || this.productsFormArray.length + 1, [Validators.required, Validators.min(1)]]
    });
  }

  onPriceInput(event: any): void {
    const value = event.target.value;
    // Limit to 4 digits
    if (value && value.toString().length > 4) {
      event.target.value = value.toString().slice(0, 4);
      this.schemeForm.patchValue({ price: parseInt(event.target.value) || 0 });
    }
  }

  openProductModal(index?: number): void {
    console.log('openProductModal called with index:', index);
    this.editingProductIndex = index !== undefined ? index : null;
    if (index !== undefined) {
      // Edit mode - populate form with existing product data
      const product = this.productsFormArray.at(index);
      this.productForm.patchValue({
        id: product.get('id')?.value || null,
        name: product.get('name')?.value,
        description: product.get('description')?.value,
        icon: product.get('icon')?.value || null,
        displayOrder: product.get('displayOrder')?.value
      });
    } else {
      // Add mode - reset form
      const newOrder = this.productsFormArray.length + 1;
      this.productForm.reset({
        id: null,
        name: '',
        description: '',
        icon: null,
        displayOrder: newOrder
      });
    }
    this.showProductModal = true;
    this.cdr.detectChanges();
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.editingProductIndex = null;
    this.productForm.reset();
  }

  saveProduct(): void {
    if (this.productForm.valid) {
      const productData = this.productForm.value;
      
      if (this.editingProductIndex !== null) {
        // Update existing product
        const productGroup = this.productsFormArray.at(this.editingProductIndex) as FormGroup;
        productGroup.patchValue({
          id: productData.id,
          name: productData.name,
          description: productData.description,
          icon: productData.icon,
          displayOrder: productData.displayOrder
        });
      } else {
        // Add new product
        this.productsFormArray.push(this.createProductFormGroup({
          id: productData.id,
          name: productData.name,
          description: productData.description,
          icon: productData.icon,
          displayOrder: productData.displayOrder
        }));
        this.updateDisplayOrders();
      }
      
      this.updateProductsList();
      this.closeProductModal();
    } else {
      // Mark form as touched to show validation errors
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
    }
  }

  removeProduct(index: number): void {
    console.log('removeProduct called with index:', index);
    if (confirm('Are you sure you want to remove this product?')) {
      this.productsFormArray.removeAt(index);
      this.updateDisplayOrders();
      this.updateProductsList();
      this.cdr.detectChanges();
    }
  }

  updateDisplayOrders(): void {
    this.productsFormArray.controls.forEach((control, index) => {
      control.patchValue({ displayOrder: index + 1 }, { emitEvent: false });
    });
  }

  moveProductUp(index: number): void {
    console.log('moveProductUp called with index:', index);
    if (index > 0) {
      const products = this.productsFormArray;
      const temp = products.at(index);
      products.removeAt(index);
      products.insert(index - 1, temp);
      this.updateDisplayOrders();
      this.updateProductsList();
      this.cdr.detectChanges();
    }
  }

  moveProductDown(index: number): void {
    console.log('moveProductDown called with index:', index);
    if (index < this.productsFormArray.length - 1) {
      const products = this.productsFormArray;
      const temp = products.at(index);
      products.removeAt(index);
      products.insert(index + 1, temp);
      this.updateDisplayOrders();
      this.updateProductsList();
      this.cdr.detectChanges();
    }
  }

  getProductFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  updateProductsList(): void {
    this.productsList = this.productsFormArray.controls.map((control, index) => ({
      index,
      id: control.get('id')?.value,
      name: control.get('name')?.value,
      description: control.get('description')?.value,
      icon: control.get('icon')?.value,
      displayOrder: control.get('displayOrder')?.value
    }));
  }

  getProducts(): any[] {
    return this.productsList;
  }

  getFieldError(formArray: FormArray, index: number, fieldName: string): string {
    const control = formArray.at(index).get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (control.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['min'].min}`;
      }
    }
    return '';
  }

  getMainFieldError(fieldName: string): string {
    const field = this.schemeForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${this.getFieldLabel(fieldName)} must be at most ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      description: 'Description',
      price: 'Price',
      icon: 'Icon',
      displayOrder: 'Display Order'
    };
    return labels[fieldName] || fieldName;
  }

  onSubmit(): void {
    // Validate that at least one product is added
    if (this.productsFormArray.length === 0) {
      this.toastr.warning('Please add at least one product', 'Warning');
      return;
    }

    if (this.schemeForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.schemeForm.value;

      const request: any = {
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        products: formValue.products.map((product: any) => ({
          id: product.id || undefined,
          name: product.name,
          description: product.description,
          icon: product.icon || null,
          displayOrder: product.displayOrder
        }))
      };

      if (this.isEditMode && this.schemeId) {
        // Include scheme ID in update request
        request.id = this.schemeId;
        this.couponSchemeService.updateCouponScheme(this.schemeId, request).subscribe({
          next: () => {
            this.toastr.success('Coupon scheme updated successfully', 'Success');
            this.router.navigate(['/organization/coupons/coupon-schemes']);
          },
          error: (error) => {
            console.error('Error updating coupon scheme:', error);
            this.toastr.error('Error updating coupon scheme', 'Error');
            this.isSubmitting = false;
          }
        });
      } else {
        this.couponSchemeService.createCouponScheme(request).subscribe({
          next: () => {
            this.toastr.success('Coupon scheme created successfully', 'Success');
            this.router.navigate(['/organization/coupons/coupon-schemes']);
          },
          error: (error) => {
            console.error('Error creating coupon scheme:', error);
            this.toastr.error('Error creating coupon scheme', 'Error');
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/organization/coupons/coupon-schemes']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.schemeForm.controls).forEach(key => {
      const control = this.schemeForm.get(key);
      control?.markAsTouched();
    });

    // Mark all product form groups as touched
    this.productsFormArray.controls.forEach(productGroup => {
      const formGroup = productGroup as FormGroup;
      Object.keys(formGroup.controls).forEach(key => {
        formGroup.get(key)?.markAsTouched();
      });
    });
  }
}

