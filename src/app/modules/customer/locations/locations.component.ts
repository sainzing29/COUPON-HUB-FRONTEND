import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ServiceCenterService, ServiceCenter } from '../../organization/pages/service-centers/service-center.service';
import { ToastrService } from 'ngx-toastr';

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {
  locations: Location[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private serviceCenterService: ServiceCenterService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadServiceCenters();
  }

  loadServiceCenters(): void {
    this.isLoading = true;
    this.serviceCenterService.getServiceCenters(true).subscribe({
      next: (serviceCenters: ServiceCenter[]) => {
        this.isLoading = false;
        // Map service centers to locations
        // Note: ServiceCenter doesn't have city or coordinates, so we'll extract city from address or use default
        this.locations = serviceCenters
          .filter(sc => sc.isActive !== false) // Only show active service centers
          .map((sc, index) => {
            // Try to extract city from address or use a default
            const city = this.extractCityFromAddress(sc.address) || 'UAE';
            
            // Default coordinates (can be enhanced later if coordinates are added to service center model)
            const defaultCoordinates = [
              { lat: 24.4539, lng: 54.3773 }, // Abu Dhabi
              { lat: 25.1972, lng: 55.2744 }, // Dubai
              { lat: 25.3573, lng: 55.4033 }, // Sharjah
              { lat: 25.4052, lng: 55.5136 }, // Ajman
              { lat: 25.7895, lng: 55.9592 }, // Ras Al Khaimah
              { lat: 25.1288, lng: 56.3264 }  // Fujairah
            ];
            
            return {
              id: sc.id,
              name: sc.name,
              address: sc.address,
              city: city,
              phone: sc.contactNumber,
              coordinates: defaultCoordinates[index % defaultCoordinates.length]
            };
          });
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error loading service centers:', error);
        this.toastr.error('Failed to load service centers', 'Error');
      }
    });
  }

  private extractCityFromAddress(address: string): string | null {
    if (!address) return null;
    
    // Common UAE cities to look for in address
    const cities = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
    
    for (const city of cities) {
      if (address.toLowerCase().includes(city.toLowerCase())) {
        return city;
      }
    }
    
    return null;
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
