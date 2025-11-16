import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ConfigurationService } from './configuration.service';
import { Configuration, ConfigurationRequest } from './configuration.model';
import { ToastrService } from 'ngx-toastr';
import { CountryCodeSelectorComponent, COUNTRY_CODES } from '../../components/country-code-selector/country-code-selector.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CountryCodeSelectorComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [
    trigger('tabFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class SettingsComponent implements OnInit {
  activeTab: string = 'general';
  isSaving: boolean = false;
  isLoading: boolean = false;
  saveMessage: string = '';
  configuration: Configuration | null = null;
  hasConfiguration: boolean = false;
  selectedCountryCode: string = '+971'; // Default to UAE

  // Form groups
  generalForm!: FormGroup;
  emailForm!: FormGroup;
  couponForm!: FormGroup;

  // Options
  currencies = [
    { value: 'AED', label: 'UAE Dirham (AED)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'SAR', label: 'Saudi Riyal (SAR)' }
  ];

  timezones = [
    { value: 'UTC', label: 'UTC (UTC+0)' },
    { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' },
    { value: 'America/New_York', label: 'New York (UTC-5)' },
    { value: 'Europe/London', label: 'London (UTC+0)' },
    { value: 'Asia/Kolkata', label: 'Mumbai (UTC+5:30)' },
    { value: 'Asia/Riyadh', label: 'Riyadh (UTC+3)' },
    { value: 'Asia/Kuwait', label: 'Kuwait (UTC+3)' },
    { value: 'Asia/Qatar', label: 'Qatar (UTC+3)' }
  ];

  constructor(
    private fb: FormBuilder,
    private configurationService: ConfigurationService,
    private toastr: ToastrService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadConfiguration();
  }

  private initializeForms(): void {
    // General Settings Form
    this.generalForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      logo: [null],
      currency: ['USD', Validators.required],
      timeZone: ['UTC', Validators.required],
      companyAddress: [null],
      companyCity: [null],
      companyState: [null],
      companyZip: [null],
      companyCountry: [null],
      countryCode: ['+971', [Validators.required]], // Default to UAE
      companyPhone: [null, [Validators.pattern(/^[0-9]{7,15}$/)]],
      companyEmail: [null, [Validators.email]]
    });

    // Email Settings Form
    this.emailForm = this.fb.group({
      sendGridApiKey: [null],
      emailFromName: [null],
      emailReplyTo: [null]
    });

    // Coupon Settings Form
    this.couponForm = this.fb.group({
      maxCouponsPerBatch: [100, [Validators.required, Validators.min(1), Validators.max(1000)]],
      defaultValidityPeriodMonths: [12, [Validators.required, Validators.min(1), Validators.max(12)]],
      maxUnassignedCoupons: [1000, [Validators.required, Validators.min(1), Validators.max(100000)]]
    });
  }

  private loadConfiguration(): void {
    this.isLoading = true;
    this.configurationService.getConfiguration().subscribe({
      next: (config) => {
        this.configuration = config;
        this.hasConfiguration = config.id > 0;
        this.populateForms(config);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading configuration:', error);
        // If configuration doesn't exist, start with empty forms
        this.hasConfiguration = false;
        this.isLoading = false;
      }
    });
  }

  private populateForms(config: Configuration): void {
    // Extract country code and phone number from companyPhone if it includes country code
    let phoneNumber = config.companyPhone || '';
    let countryCode = '+971'; // Default to UAE
    
    if (phoneNumber) {
      // Check if phoneNumber starts with a country code
      const matchedCountry = COUNTRY_CODES.find(cc => phoneNumber.startsWith(cc.code));
      if (matchedCountry) {
        countryCode = matchedCountry.code;
        phoneNumber = phoneNumber.substring(matchedCountry.code.length).trim();
      }
    }
    
    this.selectedCountryCode = countryCode;
    
    // General Settings
    this.generalForm.patchValue({
      companyName: config.companyName || '',
      logo: config.logo || null,
      currency: config.currency || 'USD',
      timeZone: config.timeZone || 'UTC',
      companyAddress: config.companyAddress || null,
      companyCity: config.companyCity || null,
      companyState: config.companyState || null,
      companyZip: config.companyZip || null,
      companyCountry: config.companyCountry || null,
      countryCode: countryCode,
      companyPhone: phoneNumber || null,
      companyEmail: config.companyEmail || null
    });

    // Email Settings
    this.emailForm.patchValue({
      sendGridApiKey: config.sendGridApiKey || null,
      emailFromName: config.emailFromName || null,
      emailReplyTo: config.emailReplyTo || null
    });

    // Coupon Settings
    this.couponForm.patchValue({
      maxCouponsPerBatch: config.maxCouponsPerBatch || 1000,
      defaultValidityPeriodMonths: config.defaultValidityPeriodMonths || 365,
      maxUnassignedCoupons: config.maxUnassignedCoupons || 1000
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.saveMessage = '';
  }

  onLogoUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        this.generalForm.patchValue({ logo: base64String });
      };
      reader.readAsDataURL(file);
    }
  }

  private buildConfigurationRequest(): ConfigurationRequest {
    const generalValues = this.generalForm.value;
    const emailValues = this.emailForm.value;
    const couponValues = this.couponForm.value;

    // Combine country code and phone number
    let companyPhone = null;
    if (generalValues.countryCode && generalValues.companyPhone) {
      companyPhone = `${generalValues.countryCode}${generalValues.companyPhone}`;
    } else if (generalValues.companyPhone) {
      companyPhone = generalValues.companyPhone;
    }

    return {
      companyName: generalValues.companyName,
      logo: generalValues.logo || null,
      currency: generalValues.currency,
      timeZone: generalValues.timeZone,
      companyAddress: generalValues.companyAddress || null,
      companyCity: generalValues.companyCity || null,
      companyState: generalValues.companyState || null,
      companyZip: generalValues.companyZip || null,
      companyCountry: generalValues.companyCountry || null,
      companyPhone: companyPhone,
      companyEmail: generalValues.companyEmail || null,
      sendGridApiKey: emailValues.sendGridApiKey || null,
      emailFromName: emailValues.emailFromName || null,
      emailReplyTo: emailValues.emailReplyTo || null,
      maxCouponsPerBatch: couponValues.maxCouponsPerBatch,
      defaultValidityPeriodMonths: couponValues.defaultValidityPeriodMonths,
      maxUnassignedCoupons: couponValues.maxUnassignedCoupons
    };
  }

  saveGeneralSettings(): void {
    if (this.generalForm.valid) {
      this.saveAllSettings();
    } else {
      this.generalForm.markAllAsTouched();
      this.toastr.error('Please fix the errors in the form', 'Validation Error');
    }
  }

  saveEmailSettings(): void {
    if (this.emailForm.valid) {
      this.saveAllSettings();
    } else {
      this.emailForm.markAllAsTouched();
      this.toastr.error('Please fix the errors in the form', 'Validation Error');
    }
  }

  saveCouponSettings(): void {
    if (this.couponForm.valid) {
      this.saveAllSettings();
    } else {
      this.couponForm.markAllAsTouched();
      this.toastr.error('Please fix the errors in the form', 'Validation Error');
    }
  }

  private saveAllSettings(): void {
    // Validate all forms before saving
    if (this.generalForm.invalid || this.couponForm.invalid) {
      this.toastr.error('Please fix all form errors before saving', 'Validation Error');
      return;
    }

    this.isSaving = true;
    const configRequest = this.buildConfigurationRequest();

    const saveOperation = this.hasConfiguration
      ? this.configurationService.updateConfiguration(configRequest)
      : this.configurationService.createConfiguration(configRequest);

    saveOperation.subscribe({
      next: (config) => {
        this.configuration = config;
        this.hasConfiguration = true;
        this.isSaving = false;
        this.toastr.success('Settings saved successfully', 'Success');
      },
      error: (error) => {
        console.error('Error saving configuration:', error);
        this.isSaving = false;
        this.toastr.error('Failed to save settings', 'Error');
      }
    });
  }

  testEmailConnection(): void {
    // This would require a separate API endpoint for testing email connection
    this.toastr.info('Email connection test feature coming soon', 'Info');
  }



  getTabClass(tab: string): string {
    return this.activeTab === tab 
      ? 'bg-blue-600 text-white border-blue-600' 
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
  }
}
