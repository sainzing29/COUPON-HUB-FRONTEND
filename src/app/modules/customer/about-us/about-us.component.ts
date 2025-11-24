import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ConfigurationService } from '../../organization/pages/settings/configuration.service';
import { BasicConfiguration } from '../../organization/pages/settings/configuration.model';
import { ToastrService } from 'ngx-toastr';

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {
  companyDetails: BasicConfiguration | null = null;
  isLoading = false;

  // About Us Information (fallback values)
  aboutUsInfo = {
    companyName: 'CES Warranty',
    address: '',
    poBox: '',
    phone: '',
    email: '',
    description: 'Your trusted partner for mobile device services and warranty solutions across the UAE.'
  };

  // Main office location for map
  mainOffice: Location = {
    id: 1,
    name: 'CES Abu Dhabi - Main Branch',
    address: '',
    city: 'Abu Dhabi',
    phone: '',
    hours: 'Sun-Thu: 9:00 AM - 9:00 PM, Fri-Sat: 2:00 PM - 10:00 PM',
    coordinates: { lat: 24.4539, lng: 54.3773 }
  };

  constructor(
    private router: Router,
    private configurationService: ConfigurationService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadCompanyDetails();
  }

  loadCompanyDetails(): void {
    this.isLoading = true;
    this.configurationService.getBasicConfiguration().subscribe({
      next: (response: BasicConfiguration) => {
        this.isLoading = false;
        this.companyDetails = response;
        
        // Update aboutUsInfo with API data
        this.aboutUsInfo = {
          companyName: response.companyName || 'CES Warranty',
          address: this.buildAddress(response),
          poBox: '', // PO Box not available in BasicConfiguration
          phone: response.companyPhone || '',
          email: response.companyEmail || '',
          description: 'Your trusted partner for mobile device services and warranty solutions across the UAE.'
        };
        
        // Update mainOffice with API data
        this.mainOffice = {
          ...this.mainOffice,
          address: this.buildAddress(response),
          phone: response.companyPhone || ''
        };
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error loading company details:', error);
        // Don't show error toast as this is not critical - use fallback values
      }
    });
  }

  private buildAddress(config: BasicConfiguration): string {
    const parts: string[] = [];
    if (config.companyCity) parts.push(config.companyCity);
    if (config.companyCountry) parts.push(config.companyCountry);
    return parts.join(', ') || '';
  }

  getGoogleMapsUrl(location: Location): string {
    return `https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}`;
  }

  getDirections(location: Location): void {
    window.open(this.getGoogleMapsUrl(location), '_blank');
  }

  goBack(): void {
    this.router.navigate(['/customer/service-selection']);
  }
}
