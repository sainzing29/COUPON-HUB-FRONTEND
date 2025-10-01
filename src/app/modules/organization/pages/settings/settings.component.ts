import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

interface GeneralSettings {
  companyName: string;
  companyLogo: string;
  currency: string;
  validityPeriod: number;
  timezone: string;
  language: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  senderEmail: string;
  senderName: string;
  useSSL: boolean;
}

interface CouponSettings {
  defaultValidityDays: number;
  maxServicesPerCoupon: number;
  maxCouponCount: number;
  allowMultipleRedemptions: boolean;
  requireOTP: boolean;
  autoExpire: boolean;
  notificationEnabled: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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
  saveMessage: string = '';

  // Form groups
  generalForm!: FormGroup;
  emailForm!: FormGroup;
  couponForm!: FormGroup;

  // Settings data
  generalSettings: GeneralSettings = {
    companyName: 'Coupon Hub',
    companyLogo: '',
    currency: 'AED',
    validityPeriod: 12,
    timezone: 'Asia/Dubai',
    language: 'en'
  };

  emailSettings: EmailSettings = {
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    senderEmail: '',
    senderName: '',
    useSSL: true
  };

  couponSettings: CouponSettings = {
    defaultValidityDays: 30,
    maxServicesPerCoupon: 5,
    maxCouponCount: 100,
    allowMultipleRedemptions: false,
    requireOTP: true,
    autoExpire: true,
    notificationEnabled: true
  };

  // Options
  currencies = [
    { value: 'AED', label: 'UAE Dirham (AED)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'SAR', label: 'Saudi Riyal (SAR)' }
  ];

  timezones = [
    { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' },
    { value: 'UTC', label: 'UTC (UTC+0)' },
    { value: 'America/New_York', label: 'New York (UTC-5)' },
    { value: 'Europe/London', label: 'London (UTC+0)' },
    { value: 'Asia/Kolkata', label: 'Mumbai (UTC+5:30)' }
  ];

  languages = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'Arabic' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ur', label: 'Urdu' }
  ];

  constructor(private fb: FormBuilder) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private initializeForms(): void {
    // General Settings Form
    this.generalForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      companyLogo: [''],
      currency: ['AED', Validators.required],
      validityPeriod: [12, [Validators.required, Validators.min(1), Validators.max(365)]],
      timezone: ['Asia/Dubai', Validators.required],
      language: ['en', Validators.required]
    });

    // Email Settings Form
    this.emailForm = this.fb.group({
      smtpHost: ['', Validators.required],
      smtpPort: [587, [Validators.required, Validators.min(1), Validators.max(65535)]],
      smtpUsername: ['', Validators.required],
      smtpPassword: ['', Validators.required],
      senderEmail: ['', [Validators.required, Validators.email]],
      senderName: ['', Validators.required],
      useSSL: [true]
    });

    // Coupon Settings Form
    this.couponForm = this.fb.group({
      defaultValidityDays: [30, [Validators.required, Validators.min(1), Validators.max(365)]],
      maxServicesPerCoupon: [5, [Validators.required, Validators.min(1), Validators.max(20)]],
      maxCouponCount: [100, [Validators.required, Validators.min(1), Validators.max(10000)]],
      allowMultipleRedemptions: [false],
      requireOTP: [true],
      autoExpire: [true],
      notificationEnabled: [true]
    });
  }

  private loadSettings(): void {
    // Load general settings
    this.generalForm.patchValue(this.generalSettings);
    
    // Load email settings
    this.emailForm.patchValue(this.emailSettings);
    
    // Load coupon settings
    this.couponForm.patchValue(this.couponSettings);
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
        this.generalSettings.companyLogo = e.target.result;
        this.generalForm.patchValue({ companyLogo: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  saveGeneralSettings(): void {
    if (this.generalForm.valid) {
      this.isSaving = true;
      this.generalSettings = { ...this.generalSettings, ...this.generalForm.value };
      
      // Simulate API call
      setTimeout(() => {
        this.isSaving = false;
        this.showSaveMessage('General settings saved successfully!');
      }, 1000);
    }
  }

  saveEmailSettings(): void {
    if (this.emailForm.valid) {
      this.isSaving = true;
      this.emailSettings = { ...this.emailSettings, ...this.emailForm.value };
      
      // Simulate API call
      setTimeout(() => {
        this.isSaving = false;
        this.showSaveMessage('Email settings saved successfully!');
      }, 1000);
    }
  }

  saveCouponSettings(): void {
    if (this.couponForm.valid) {
      this.isSaving = true;
      this.couponSettings = { ...this.couponSettings, ...this.couponForm.value };
      
      // Simulate API call
      setTimeout(() => {
        this.isSaving = false;
        this.showSaveMessage('Coupon settings saved successfully!');
      }, 1000);
    }
  }

  testEmailConnection(): void {
    if (this.emailForm.valid) {
      this.isSaving = true;
      
      // Simulate email test
      setTimeout(() => {
        this.isSaving = false;
        this.showSaveMessage('Email connection test successful!');
      }, 2000);
    }
  }

  private showSaveMessage(message: string): void {
    this.saveMessage = message;
    setTimeout(() => {
      this.saveMessage = '';
    }, 3000);
  }

  getTabClass(tab: string): string {
    return this.activeTab === tab 
      ? 'bg-blue-600 text-white border-blue-600' 
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
  }
}
