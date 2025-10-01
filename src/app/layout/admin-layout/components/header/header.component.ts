import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService, User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() pageTitle: string = 'Dashboard';
  @Input() sidebarOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  currentUser: User | null = null;
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get current user from auth service
    this.currentUser = this.authService.getCurrentUser();
    
    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onAccountClick(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  onLogout(): void {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/sign-in']);
  }

  onProfileClick(): void {
    this.showUserMenu = false;
    // Navigate to profile page when implemented
    console.log('Navigate to profile');
  }

  onSettingsClick(): void {
    this.showUserMenu = false;
    // Navigate to settings page when implemented
    console.log('Navigate to settings');
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return this.currentUser.name;
    }
    return 'User';
  }

  getUserInitials(): string {
    if (this.currentUser) {
      const nameParts = this.currentUser.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      } else {
        return this.currentUser.name.charAt(0).toUpperCase();
      }
    }
    return 'U';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userMenu = target.closest('.user-menu-container');
    
    if (!userMenu && this.showUserMenu) {
      this.showUserMenu = false;
    }
  }
}
