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
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {
  
  // UAE Service Center Locations
  locations: Location[] = [
    {
      id: 1,
      name: 'CES Abu Dhabi - Main Branch',
      address: 'Hifayif Street, E19_02, Al Nahyan',
      city: 'Abu Dhabi',
      phone: '+971 56 3365247',
      hours: 'Sun-Thu: 9:00 AM - 9:00 PM, Fri-Sat: 2:00 PM - 10:00 PM',
      coordinates: { lat: 24.4539, lng: 54.3773 }
    },
    {
      id: 2,
      name: 'CES Dubai Mall',
      address: 'Level 2, Dubai Mall, Downtown Dubai',
      city: 'Dubai',
      phone: '+971 4 123 4567',
      hours: 'Sun-Wed: 10:00 AM - 12:00 AM, Thu-Sat: 10:00 AM - 1:00 AM',
      coordinates: { lat: 25.1972, lng: 55.2744 }
    },
    {
      id: 3,
      name: 'CES Sharjah City Center',
      address: 'Al Majaz Waterfront, Al Majaz 3',
      city: 'Sharjah',
      phone: '+971 6 123 4567',
      hours: 'Sun-Thu: 9:00 AM - 11:00 PM, Fri-Sat: 2:00 PM - 12:00 AM',
      coordinates: { lat: 25.3573, lng: 55.4033 }
    },
    {
      id: 4,
      name: 'CES Ajman Marina',
      address: 'Ajman Marina, Corniche Road',
      city: 'Ajman',
      phone: '+971 6 234 5678',
      hours: 'Sun-Thu: 9:00 AM - 10:00 PM, Fri-Sat: 2:00 PM - 11:00 PM',
      coordinates: { lat: 25.4052, lng: 55.5136 }
    },
    {
      id: 5,
      name: 'CES Ras Al Khaimah',
      address: 'Al Qawasim Corniche, Al Nakheel',
      city: 'Ras Al Khaimah',
      phone: '+971 7 123 4567',
      hours: 'Sun-Thu: 9:00 AM - 9:00 PM, Fri-Sat: 2:00 PM - 10:00 PM',
      coordinates: { lat: 25.7895, lng: 55.9592 }
    },
    {
      id: 6,
      name: 'CES Fujairah City Center',
      address: 'Fujairah City Center, Sheikh Hamad Bin Abdullah Road',
      city: 'Fujairah',
      phone: '+971 9 123 4567',
      hours: 'Sun-Thu: 9:00 AM - 10:00 PM, Fri-Sat: 2:00 PM - 11:00 PM',
      coordinates: { lat: 25.1288, lng: 56.3264 }
    }
  ];

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
