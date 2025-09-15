# Environment Configuration

This folder contains environment-specific configuration files for the Coupon Hub application.

## Files

- `environment.ts` - Development environment configuration
- `environment.prod.ts` - Production environment configuration
- `environment.interface.ts` - TypeScript interface for environment variables

## Usage

### In Components

```typescript
import { Component } from '@angular/core';
import { EnvironmentService } from '../core/services/environment.service';

@Component({
  selector: 'app-example',
  template: '<p>API URL: {{ apiUrl }}</p>'
})
export class ExampleComponent {
  apiUrl: string;

  constructor(private environmentService: EnvironmentService) {
    this.apiUrl = this.environmentService.getApiUrl();
  }
}
```

### In Services

```typescript
import { Injectable } from '@angular/core';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class MyService {
  constructor(private environmentService: EnvironmentService) {
    const baseUrl = this.environmentService.getBaseUrl();
    // Use baseUrl for API calls
  }
}
```

### Direct Import

```typescript
import { environment } from '../environments/environment';

// Use environment variables directly
const apiUrl = environment.apiUrl;
```

## Environment Variables

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `production` | Whether the app is running in production mode | `false` | `true` |
| `baseUrl` | Base URL for API calls | `http://localhost:3000/api` | `https://api.couponhub.com/api` |
| `apiUrl` | API URL (same as baseUrl) | `http://localhost:3000/api` | `https://api.couponhub.com/api` |
| `appName` | Application name | `Coupon Hub` | `Coupon Hub` |
| `version` | Application version | `1.0.0` | `1.0.0` |
| `debug` | Debug mode flag | `true` | `false` |

## Adding New Environment Variables

1. Add the variable to `environment.interface.ts`
2. Add the variable to both `environment.ts` and `environment.prod.ts`
3. Add a getter method to `EnvironmentService` if needed

## Build Commands

- **Development**: `ng serve` (uses `environment.ts`)
- **Production**: `ng build --configuration production` (uses `environment.prod.ts`)







