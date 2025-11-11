export interface Role {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  permissionCount: number;
  userCount: number;
}

export interface Permission {
  id: number;
  key: string;
  description: string;
  isActive: boolean;
  isAssigned: boolean;
}

export interface UpdateRolePermissionsRequest {
  permissionIds: number[];
}

