import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() pageTitle: string = 'Dashboard';
  @Input() sidebarOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  currentUser: User | null = null;
  showUserMenu = false;
  
  // Theme modal properties
  showThemeModal = false;
  selectedTheme: string = 'light';

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

    // Load saved theme settings
    this.loadThemeSettings();
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
    this.router.navigate(['/admin-login']);
  }

  onProfileClick(): void {
    this.showUserMenu = false;
    // Navigate to profile page when implemented
  }

  onSettingsClick(): void {
    this.showUserMenu = false;
    // Navigate to settings page when implemented
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

  getUserFirstName(): string {
    if (this.currentUser) {
      const nameParts = this.currentUser.name.split(' ');
      return nameParts[0] || this.currentUser.name;
    }
    return 'User';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userMenu = target.closest('.user-menu-container');
    const themeModal = target.closest('.theme-modal-container');
    const settingsButton = target.closest('button[matTooltip="Theme Settings"]');
    
    if (!userMenu && this.showUserMenu) {
      this.showUserMenu = false;
    }
    
    // Only close theme modal if clicking outside and not on the settings button
    if (!themeModal && !settingsButton && this.showThemeModal) {
      this.showThemeModal = false;
    }
  }

  // Theme modal methods
  onThemeSettingsClick(): void {
    this.showThemeModal = true;
  }

  closeThemeModal(): void {
    this.showThemeModal = false;
  }


  applyThemeSettings(): void {
    // Save theme settings to localStorage
    const themeSettings = {
      theme: this.selectedTheme
    };
    
    localStorage.setItem('themeSettings', JSON.stringify(themeSettings));
    
    // Apply theme to document
    this.applyThemeToDocument();
    
    // Close modal
    this.closeThemeModal();
  }

  private loadThemeSettings(): void {
    const savedSettings = localStorage.getItem('themeSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        this.selectedTheme = settings.theme || 'light';
        this.applyThemeToDocument();
      } catch (error) {
        console.error('Error loading theme settings:', error);
      }
    }
  }

  private applyThemeToDocument(): void {
    const html = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes from both html and body
    html.classList.remove('theme-light', 'theme-dark');
    body.classList.remove('theme-light', 'theme-dark');
    
    // Apply new theme classes to html element
    const themeClass = `theme-${this.selectedTheme}`;
    
    html.classList.add(themeClass);
    body.classList.add(themeClass);
  }

}
