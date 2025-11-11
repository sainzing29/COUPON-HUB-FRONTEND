import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Role, Permission, UpdateRolePermissionsRequest } from './role-permissions.model';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionsService {
  constructor(private apiService: ApiService) { }

  // Get all roles
  getRoles(): Observable<Role[]> {
    return this.apiService.get<Role[]>('/roles');
  }

  // Get permissions with status for a specific role
  getPermissionsWithStatus(roleId: number): Observable<Permission[]> {
    return this.apiService.get<Permission[]>(`/roles/roles/${roleId}/permissions-with-status`);
  }

  // Update role permissions
  updateRolePermissions(roleId: number, request: UpdateRolePermissionsRequest): Observable<void> {
    return this.apiService.put<void>(`/roles/roles/${roleId}/permissions`, request);
  }
}

