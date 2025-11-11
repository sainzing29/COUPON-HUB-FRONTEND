import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';
import { trigger, transition, style, animate } from '@angular/animations';
import { RolePermissionsService } from './role-permissions.service';
import { Role, Permission } from './role-permissions.model';

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss'],
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
export class RolePermissionsComponent implements OnInit {
  roles: Role[] = [];
  permissions: Permission[] = [];
  selectedRoleId: number | null = null;
  selectedRole: Role | null = null;
  isLoadingRoles = false;
  isLoadingPermissions = false;
  isSaving = false;
  
  // Track original permission IDs to detect changes
  originalPermissionIds: Set<number> = new Set();
  
  roleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private rolePermissionsService: RolePermissionsService,
    private toastr: ToastrService
  ) {
    this.roleForm = this.fb.group({
      roleId: [null]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoadingRoles = true;
    this.rolePermissionsService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.isLoadingRoles = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.toastr.error('Failed to load roles', 'Error');
        this.isLoadingRoles = false;
      }
    });
  }

  onRoleChange(): void {
    const roleIdValue = this.roleForm.get('roleId')?.value;
    
    if (!roleIdValue || roleIdValue === 'null') {
      this.selectedRoleId = null;
      this.selectedRole = null;
      this.permissions = [];
      this.originalPermissionIds.clear();
      return;
    }

    // Convert to number if it's a string (native select returns string)
    const roleId = typeof roleIdValue === 'string' ? parseInt(roleIdValue, 10) : roleIdValue;
    
    this.selectedRoleId = roleId;
    this.selectedRole = this.roles.find(r => r.id === roleId) || null;
    this.loadPermissions(roleId);
  }

  loadPermissions(roleId: number): void {
    this.isLoadingPermissions = true;
    this.rolePermissionsService.getPermissionsWithStatus(roleId).subscribe({
      next: (permissions) => {
        this.permissions = permissions.sort((a, b) => a.key.localeCompare(b.key));
        // Store original assigned permission IDs
        this.originalPermissionIds = new Set(
          permissions.filter(p => p.isAssigned).map(p => p.id)
        );
        this.isLoadingPermissions = false;
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.toastr.error('Failed to load permissions', 'Error');
        this.isLoadingPermissions = false;
      }
    });
  }

  onPermissionChange(permission: Permission, event: any): void {
    // Prevent changing UserRoles permission for SuperAdmin role
    if (this.isSuperAdminRole() && permission.key === 'UserRoles') {
      event.source.checked = permission.isAssigned; // Revert the change
      this.toastr.warning('Cannot modify UserRoles permission for SuperAdmin role', 'Warning');
      return;
    }
    permission.isAssigned = event.checked;
  }

  isSuperAdminRole(): boolean {
    return this.selectedRole?.name === 'SuperAdmin' || this.selectedRole?.name === 'superadmin';
  }

  isPermissionDisabled(permission: Permission): boolean {
    return this.isSuperAdminRole() && permission.key === 'UserRoles';
  }

  getCurrentPermissionIds(): number[] {
    return this.permissions
      .filter(p => p.isAssigned)
      .map(p => p.id);
  }

  getCurrentPermissionIdsForSave(): number[] {
    // For SuperAdmin, always include UserRoles permission even if it's disabled
    const permissionIds = this.permissions
      .filter(p => p.isAssigned)
      .map(p => p.id);
    
    // If SuperAdmin role, ensure UserRoles is included
    if (this.isSuperAdminRole()) {
      const userRolesPermission = this.permissions.find(p => p.key === 'UserRoles');
      if (userRolesPermission && !permissionIds.includes(userRolesPermission.id)) {
        permissionIds.push(userRolesPermission.id);
      }
    }
    
    return permissionIds;
  }

  hasChanges(): boolean {
    if (!this.selectedRoleId) return false;
    
    // Get UserRoles permission ID to exclude from change detection for SuperAdmin
    const userRolesPermission = this.permissions.find(p => p.key === 'UserRoles');
    const userRolesId = userRolesPermission?.id;
    
    // Filter out UserRoles from change detection if SuperAdmin
    const currentIds = new Set(
      this.getCurrentPermissionIds().filter(id => 
        !this.isSuperAdminRole() || id !== userRolesId
      )
    );
    
    const originalIds = new Set(
      Array.from(this.originalPermissionIds).filter(id => 
        !this.isSuperAdminRole() || id !== userRolesId
      )
    );
    
    // Check if sets are different (excluding UserRoles for SuperAdmin)
    if (currentIds.size !== originalIds.size) {
      return true;
    }
    
    for (const id of currentIds) {
      if (!originalIds.has(id)) {
        return true;
      }
    }
    
    return false;
  }

  savePermissions(): void {
    if (!this.selectedRoleId) {
      this.toastr.warning('Please select a role first', 'Warning');
      return;
    }

    if (!this.hasChanges()) {
      this.toastr.info('No changes to save', 'Info');
      return;
    }

    this.isSaving = true;
    const permissionIds = this.getCurrentPermissionIdsForSave();

    this.rolePermissionsService.updateRolePermissions(this.selectedRoleId, { permissionIds }).subscribe({
      next: () => {
        this.toastr.success('Permissions updated successfully', 'Success');
        // Update original permission IDs to reflect the saved state
        this.originalPermissionIds = new Set(permissionIds);
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error updating permissions:', error);
        this.toastr.error('Failed to update permissions', 'Error');
        this.isSaving = false;
      }
    });
  }
}

