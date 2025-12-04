import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CustomerAuthService } from '../../../../modules/customer/services/customer-auth.service';
import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-customer-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class CustomerNavbarComponent implements OnInit {
  showUserDropdown = false;
  customerEmail: string = '';
  customerPhone: string = '';
  customerName: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private customerAuthService: CustomerAuthService,
    private tokenService: TokenService
  ) { }

  ngOnInit(): void {
    // Load customer data from localStorage (from token)
    const userData = this.tokenService.getUser();
    if (userData) {
      // Get customer name - try multiple fields
      const firstName = userData.firstName || '';
      const lastName = userData.lastName || '';
      const fullName = userData.name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || 'Customer');
      this.customerName = firstName;
      this.customerEmail = userData.email || '';
      this.customerPhone = userData.mobileNumber || '';
    }

    // Fallback to route parameters if localStorage doesn't have data
    this.route.queryParams.subscribe(params => {
      if (!this.customerName || this.customerName === 'Customer') {
        this.customerName = params['customerName'] || this.customerName || 'Customer';
      }
      if (!this.customerEmail) {
        this.customerEmail = params['email'] || this.customerEmail;
      }
      if (!this.customerPhone) {
        this.customerPhone = params['phone'] || this.customerPhone;
      }
    });
  }

  getUserInitials(): string {
    if (!this.customerName || this.customerName === 'Customer') {
      return 'C';
    }
    const names = this.customerName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return this.customerName[0].toUpperCase();
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  closeUserDropdown(): void {
    this.showUserDropdown = false;
  }

  viewProfile(): void {
    // Navigate to profile page
    console.log('View Profile');
    this.closeUserDropdown();
  }

  logout(): void {
    // Clear token and customer data
    this.tokenService.clearAuthData();
    this.customerAuthService.logout();
    this.router.navigate(['/customer/login']);
  }
}
