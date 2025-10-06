import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { TokenService } from './token.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string; // JWT token
}

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  isValid: boolean;
  user?: User;
  message?: string;
}

export interface SetPasswordRequest {
  token: string;
  password: string;
}

export interface SetPasswordResponse {
  success: boolean;
  message: string;
}

export interface JwtPayload {
  sub: string;                    // User ID
  name: string;                   // First Name
  role: string;                   // User Role
  serviceCenterId?: string;       // Only for Admin users with ServiceCenterId
  email?: string;                 // User Email
  mobileNumber?: string;          // User Mobile Number
  authProvider?: string;          // Authentication Provider
  isActive?: boolean;             // User Active Status
  iss: string;                    // Issuer
  aud: string;                    // Audience
  exp: number;                    // Expiration timestamp
  iat: number;                    // Issued at timestamp
}

export interface User {
  id: string;
  name: string;
  role: string;
  serviceCenterId?: string;
  email?: string;
  mobileNumber?: string;
  authProvider?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private tokenService: TokenService
  ) {
    // Check if user is already logged in (from token)
    this.loadUserFromToken();
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/Auth/login', credentials).pipe(
      tap(response => {
        // Store JWT token
        this.tokenService.setToken(response.token);
        
        // Decode token to get user information
        const payload = this.decodeToken(response.token);
        const user: User = {
          id: payload.sub || '',
          name: payload.name || '',
          role: payload.role || '',
          serviceCenterId: payload.serviceCenterId,
          email: payload.email || undefined,
          mobileNumber: payload.mobileNumber || undefined,
          authProvider: payload.authProvider || undefined,
          isActive: payload.isActive !== undefined ? payload.isActive : true
        };
        
        // Store user data
        this.tokenService.setUser(user);
        
        // Update current user subject
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Auth service error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear all authentication data
    this.tokenService.clearAuthData();
    
    // Update current user subject
    this.currentUserSubject.next(null);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.tokenService.isAuthenticated() && this.currentUserSubject.value !== null;
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Get JWT token
   */
  getToken(): string | null {
    return this.tokenService.getToken();
  }

  /**
   * Check if token needs refresh
   */
  needsTokenRefresh(): boolean {
    return this.tokenService.needsRefresh();
  }

  /**
   * Refresh user data from current token
   */
  refreshUserFromToken(): void {
    this.loadUserFromToken();
  }

  /**
   * Get all user data including additional fields
   */
  getFullUserData(): User | null {
    const user = this.getCurrentUser();
    if (user) {
      console.log('Full user data:', user);
      return user;
    }
    return null;
  }

  /**
   * Validate setup token for password setting
   */
  validateSetupToken(token: string): Observable<ValidateTokenResponse> {
    return this.apiService.post<ValidateTokenResponse>('/Auth/validate-setup-token', { token });
  }

  /**
   * Set password using setup token
   */
  setPassword(request: SetPasswordRequest): Observable<SetPasswordResponse> {
    return this.apiService.post<SetPasswordResponse>('/Auth/set-password', request);
  }


  /**
   * Load user from token on app initialization
   */
  private loadUserFromToken(): void {
    if (this.tokenService.isAuthenticated()) {
      const token = this.tokenService.getToken();
      if (token) {
        try {
          // Decode token to get fresh user information
          const payload = this.decodeToken(token);
          console.log('JWT Payload:', payload);
          
          const user: User = {
            id: payload.sub || '',
            name: payload.name || '',
            role: payload.role || '',
            serviceCenterId: payload.serviceCenterId,
            email: payload.email || undefined,
            mobileNumber: payload.mobileNumber || undefined,
            authProvider: payload.authProvider || undefined,
            isActive: payload.isActive !== undefined ? payload.isActive : true
          };
          
          console.log('Final User Object:', user);
          
          // Update stored user data with fresh token data
          this.tokenService.setUser(user);
          
          // Update current user subject
          this.currentUserSubject.next(user);
        } catch (error) {
          console.error('Error loading user from token:', error);
          // Fallback to stored user data
          const user = this.tokenService.getUser();
          if (user) {
            this.currentUserSubject.next(user);
          }
        }
      }
    }
  }

  /**
   * Decode JWT token to extract payload
   */
  private decodeToken(token: string): JwtPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      throw new Error('Invalid token format');
    }
  }
}













