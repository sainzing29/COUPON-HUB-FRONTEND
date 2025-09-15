import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      state('out', style({
        transform: 'translateX(-100%)',
        opacity: 0
      })),
      transition('in => out', animate('300ms ease-in-out')),
      transition('out => in', animate('300ms ease-in-out'))
    ])
  ]
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() sidebarOpen = true;
  @Input() activeMenuItem = 'dashboard';
  @Output() menuItemClick = new EventEmitter<string>();

  menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view', route: '/dashboard', active: true, hasSubmenu: false },
    { id: 'users', label: 'Users', icon: 'person', route: '/organization/users', active: false, hasSubmenu: false },
    { id: 'customers', label: 'Customers', icon: 'people', route: '/organization/customers', active: false, hasSubmenu: false },
    { id: 'service-centers', label: 'Service Centers', icon: 'business', route: '/organization/service-centers', active: false, hasSubmenu: false },
    { id: 'coupons', label: 'Coupons', icon: 'local_offer', route: '/organization/coupons', active: false, hasSubmenu: false },
    { id: 'invoices', label: 'Invoices & Payments', icon: 'receipt', route: '/organization/invoices', active: false, hasSubmenu: false },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: 'assessment', 
      route: '', 
      active: false, 
      hasSubmenu: true,
      expanded: false,
      submenu: [
        { id: 'sales-report', label: 'Sales Report', icon: 'assessment', route: '/reports/sales-report', active: false },
        { id: 'service-usage-report', label: 'Service Usage', icon: 'trending_up', route: '/reports/service-usage-report', active: false },
        { id: 'service-center-performance', label: 'Center Performance', icon: 'business_center', route: '/reports/service-center-performance', active: false }
      ]
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.updateActiveState();
    this.ensureSubmenuExpanded();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeMenuItem']) {
      this.updateActiveState();
      this.ensureSubmenuExpanded();
    }
  }

  private updateActiveState(): void {
    this.menuItems.forEach(item => {
      item.active = item.id === this.activeMenuItem;
      
      // Check if any submenu item is active
      if (item.hasSubmenu && item.submenu) {
        item.submenu.forEach(subItem => {
          subItem.active = subItem.id === this.activeMenuItem;
          // If submenu item is active, mark parent as active and expanded
          if (subItem.active) {
            item.active = true;
            item.expanded = true; // Keep submenu expanded when submenu item is active
          }
        });
      }
    });
  }

  private ensureSubmenuExpanded(): void {
    // Ensure that if a submenu item is active, its parent is expanded
    this.menuItems.forEach(item => {
      if (item.hasSubmenu && item.submenu) {
        const hasActiveSubItem = item.submenu.some(subItem => subItem.active);
        if (hasActiveSubItem) {
          item.expanded = true;
        }
      }
    });
  }

  onMenuItemClick(event: Event, itemId: string): void {
    // Prevent event propagation to avoid triggering parent click handlers
    event.stopPropagation();
    event.preventDefault();
    
    const selectedItem = this.menuItems.find(item => item.id === itemId);
    
    if (selectedItem) {
      if (selectedItem.hasSubmenu) {
        // Toggle submenu expansion
        selectedItem.expanded = !selectedItem.expanded;
      } else {
        // Regular menu item - navigate to route
        this.activeMenuItem = itemId;
        this.updateActiveState();
        this.router.navigate([selectedItem.route]);
        this.menuItemClick.emit(itemId);
      }
    }
  }

  onSubmenuItemClick(event: Event, subItemId: string, parentId: string): void {
    // Prevent event propagation to avoid triggering parent click handlers
    event.stopPropagation();
    event.preventDefault();
    
    this.activeMenuItem = subItemId;
    
    // Find the parent item and ensure it stays expanded
    const parentItem = this.menuItems.find(item => item.id === parentId);
    if (parentItem) {
      parentItem.expanded = true; // Ensure parent stays expanded
    }
    
    this.updateActiveState();
    
    // Find the submenu item and navigate to its route
    if (parentItem && parentItem.submenu) {
      const subItem = parentItem.submenu.find(item => item.id === subItemId);
      if (subItem) {
        this.router.navigate([subItem.route]);
        this.menuItemClick.emit(subItemId);
      }
    }
  }
}
