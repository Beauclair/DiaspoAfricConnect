import { HostCountryCode, getCountryConfig } from '../constants/countries';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+\..+/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string, countryCode: HostCountryCode = 'US'): boolean {
  if (!phone || !phone.trim()) return false;
  const config = getCountryConfig(countryCode);
  return config.phoneFields.phoneRegex.test(phone.trim());
}

export function isValidURL(url: string): boolean {
  if (!url) return true;
  return URL_REGEX.test(url.trim());
}

export function isValidPostalCode(code: string, countryCode: HostCountryCode): boolean {
  const config = getCountryConfig(countryCode);
  return config.addressFields.postalCodeRegex.test(code.trim());
}

export function isValidZipCode(zip: string): boolean {
  return isValidPostalCode(zip, 'US');
}

export function isStrongPassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must include a number';
  return null;
}

export function validateBusinessForm(fields: {
  name: string;
  description: string;
  countryOfOrigin: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website?: string;
}, hostCountry: HostCountryCode = 'US'): string | null {
  const config = getCountryConfig(hostCountry);
  if (!fields.name.trim()) return 'Business name is required';
  if (!fields.description.trim()) return 'Description is required';
  if (!fields.countryOfOrigin.trim()) return 'Country of origin is required';
  if (!fields.address.trim()) return 'Address is required';
  if (!fields.city.trim()) return 'City is required';
  if (!fields.state.trim()) return `${config.addressFields.regionLabel} is required`;
  if (!isValidPostalCode(fields.zipCode, hostCountry)) return `Enter a valid ${config.addressFields.postalCodeLabel.toLowerCase()} (e.g. ${config.addressFields.postalCodePlaceholder.replace('e.g. ', '')})`;
  if (!fields.phone.trim()) return 'Phone number is required';
  if (!isValidPhone(fields.phone, hostCountry)) return `Enter a valid phone number (e.g. ${config.phoneFields.placeholder})`;
  if (fields.website && !isValidURL(fields.website)) return 'Website must start with http:// or https://';
  return null;
}
