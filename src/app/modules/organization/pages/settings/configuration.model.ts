export interface Configuration {
  id: number;
  companyName: string;
  logo: string | null;
  currency: string;
  timeZone: string;
  companyAddress: string | null;
  companyCity: string | null;
  companyState: string | null;
  companyZip: string | null;
  companyCountry: string | null;
  sendGridApiKey: string | null;
  emailFromName: string | null;
  emailReplyTo: string | null;
  maxCouponsPerBatch: number;
  defaultValidityPeriodDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigurationRequest {
  companyName: string;
  logo: string | null;
  currency: string;
  timeZone: string;
  companyAddress: string | null;
  companyCity: string | null;
  companyState: string | null;
  companyZip: string | null;
  companyCountry: string | null;
  sendGridApiKey: string | null;
  emailFromName: string | null;
  emailReplyTo: string | null;
  maxCouponsPerBatch: number;
  defaultValidityPeriodDays: number;
}

