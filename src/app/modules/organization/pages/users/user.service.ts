import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: string;
  status: number; // 0 = Deactivated, 1 = Invited, 2 = Active, 3 = Deleted
  createdAt: string;
  lastLogin?: string;
  passwordHash?: string;
  serviceCenterId?: number;
  serviceCenterName?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: string;
  passwordHash: string;
  serviceCenterId?: number;
  isActive: boolean;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  role?: string;
  serviceCenterId?: number;
  status?: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService) { }

  /**
   * Get all users
   */
  getUsers(allUsers: boolean = false): Observable<User[]> {
    if (allUsers) {
      return this.apiService.getWithParams<User[]>('/users', { allUsers: 'true' });
    }
    return this.apiService.get<User[]>('/users');
  }

  /**
   * Transform user data to match our interface
   */
  private transformUser(user: any): User {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      passwordHash: user.passwordHash,
      serviceCenterId: user.serviceCenterId,
      serviceCenterName: user.serviceCenterName
    };
  }

  /**
   * Break circular references in objects
   */
  private breakCircularReferences(obj: any): any {
    const seen = new WeakSet();
    return this.deepClone(obj, seen);
  }

  private deepClone(obj: any, seen: WeakSet<any>): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (seen.has(obj)) {
      return '[Circular Reference]';
    }

    seen.add(obj);

    if (Array.isArray(obj)) {
      const clonedArray = obj.map(item => this.deepClone(item, seen));
      seen.delete(obj);
      return clonedArray;
    }

    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Skip potentially problematic circular reference properties
        if (this.shouldSkipProperty(key)) {
          continue;
        }
        clonedObj[key] = this.deepClone(obj[key], seen);
      }
    }

    seen.delete(obj);
    return clonedObj;
  }

  private shouldSkipProperty(key: string): boolean {
    const skipProperties = [
      'ServiceCenter',
      'Admins',
      'Users',
      'Coupons',
      'Invoices',
      'Parent',
      'Children',
      'Related',
      'Navigation'
    ];
    return skipProperties.includes(key);
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<User> {
    return this.apiService.get<any>(`/users/${id}`).pipe(
      map(response => this.breakCircularReferences(response) as User),
      catchError(error => {
        console.error('Error fetching user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create new user
   */
  createUser(userData: UserCreateRequest): Observable<User> {
    return this.apiService.post<any>('/users', userData).pipe(
      map(response => this.breakCircularReferences(response) as User),
      catchError(error => {
        console.error('Error creating user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user
   */
  updateUser(id: number, userData: UserUpdateRequest): Observable<User> {
    return this.apiService.put<any>(`/users/${id}`, userData).pipe(
      map(response => this.breakCircularReferences(response) as User),
      catchError(error => {
        console.error('Error updating user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete user
   */
  deleteUser(id: number): Observable<void> {
    return this.apiService.delete<void>(`/users/${id}`);
  }

  /**
   * Toggle user status
   */
  toggleUserStatus(id: number, status: number): Observable<User> {
    return this.apiService.patch<any>(`/users/${id}/status`, { status }).pipe(
      map(response => this.breakCircularReferences(response) as User),
      catchError(error => {
        console.error('Error toggling user status:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Search users
   */
  searchUsers(query: string): Observable<User[]> {
    return this.apiService.getWithParams<any>('/users/search', { q: query }).pipe(
      map(response => this.breakCircularReferences(response) as User[]),
      catchError(error => {
        console.error('Error searching users:', error);
        return of([]);
      })
    );
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: string): Observable<User[]> {
    return this.apiService.getWithParams<any>('/users', { role }).pipe(
      map(response => this.breakCircularReferences(response) as User[]),
      catchError(error => {
        console.error('Error fetching users by role:', error);
        return of([]);
      })
    );
  }

  /**
   * Get active users
   */
  getActiveUsers(): Observable<User[]> {
    return this.apiService.get<any>('/users/active').pipe(
      map(response => this.breakCircularReferences(response) as User[]),
      catchError(error => {
        console.error('Error fetching active users:', error);
        return of([]);
      })
    );
  }

  /**
   * Get inactive users
   */
  getInactiveUsers(): Observable<User[]> {
    return this.apiService.get<any>('/users/inactive').pipe(
      map(response => this.breakCircularReferences(response) as User[]),
      catchError(error => {
        console.error('Error fetching inactive users:', error);
        return of([]);
      })
    );
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<{
    total: number;
    active: number;
    inactive: number;
    byRole: { [key: string]: number };
  }> {
    return this.apiService.get<any>('/users/stats').pipe(
      map(response => this.breakCircularReferences(response)),
      catchError(error => {
        console.error('Error fetching user stats:', error);
        return of({
          total: 0,
          active: 0,
          inactive: 0,
          byRole: {}
        });
      })
    );
  }

  /**
   * Resend password setup email to user
   */
  resendPasswordEmail(userId: number): Observable<void> {
    return this.apiService.post<any>(`/users/${userId}/resend-password-setup`, {}).pipe(
      map(() => undefined as void),
      catchError(error => {
        console.error('Error in resendPasswordEmail service:', error);
        return throwError(() => error);
      })
    );
  }
}

