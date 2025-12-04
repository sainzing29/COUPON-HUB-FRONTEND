import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

/**
 * Customer Auth Guard
 * Protects customer routes by checking if customer has a valid token
 */
export const customerAuthGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Check if customer has a valid (non-expired) token
  if (!tokenService.isAuthenticated()) {
    // No valid token, redirect to customer login
    router.navigate(['/customer/login']);
    return false;
  }
  
  return true;
};

