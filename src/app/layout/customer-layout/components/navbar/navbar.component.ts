import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CustomerAuthService } from '../../../../modules/customer/services/customer-auth.service';

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
    private customerAuthService: CustomerAuthService
  ) { }

  ngOnInit(): void {
    // Get customer data from route parameters
    this.route.queryParams.subscribe(params => {
      this.customerName = params['customerName'] || 'Customer';
      this.customerEmail = params['email'] || '';
      this.customerPhone = params['phone'] || '';
    });
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
    this.customerAuthService.logout();
    this.router.navigate(['/customer/login']);
  }
}
