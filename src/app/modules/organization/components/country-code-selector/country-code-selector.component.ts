import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

// Export country codes list as a constant for reuse
export const COUNTRY_CODES: CountryCode[] = [
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' }
];

@Component({
  selector: 'app-country-code-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './country-code-selector.component.html',
  styleUrls: ['./country-code-selector.component.scss']
})
export class CountryCodeSelectorComponent {
  @Input() id: string = 'countryCode';
  @Input() value: string = '+971';
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() countryCodeChange = new EventEmitter<string>();

  // Country codes list (UAE first as default, then others)
  countryCodes: CountryCode[] = COUNTRY_CODES;

  getSelectedCountry(): CountryCode | undefined {
    return this.countryCodes.find(cc => cc.code === this.value);
  }

  onCountryCodeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
    this.countryCodeChange.emit(this.value);
  }
}

