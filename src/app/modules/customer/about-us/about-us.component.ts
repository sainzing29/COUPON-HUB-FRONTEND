import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

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
  
  // About Us Information
  aboutUsInfo = {
    companyName: 'CES Warranty',
    address: 'Hifayif Street, E19_02, Al Nahyan, Abu Dhabi, UAE',
    poBox: '37570',
    phone: '+971 56 3365247',
    email: 'info@ceswarranty.com',
    description: 'Your trusted partner for mobile device services and warranty solutions across the UAE.'
  };

  // Main office location for map
  mainOffice: Location = {
    id: 1,
    name: 'CES Abu Dhabi - Main Branch',
    address: 'Hifayif Street, E19_02, Al Nahyan',
    city: 'Abu Dhabi',
    phone: '+971 56 3365247',
    hours: 'Sun-Thu: 9:00 AM - 9:00 PM, Fri-Sat: 2:00 PM - 10:00 PM',
    coordinates: { lat: 24.4539, lng: 54.3773 }
  };

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Component initialization
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
