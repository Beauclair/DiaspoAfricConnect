import { LegalCategory } from '../types';

export type HostCountryCode = 'US' | 'CA' | 'UK' | 'FR' | 'DE';

export interface CountryConfig {
  code: HostCountryCode;
  name: string;
  flag: string;
  currency: string;
  phoneFields: {
    placeholder: string;
    phoneRegex: RegExp;
  };
  addressFields: {
    regionLabel: string;
    regionPlaceholder: string;
    postalCodeLabel: string;
    postalCodePlaceholder: string;
    postalCodeRegex: RegExp;
    postalCodeKeyboardType: 'numeric' | 'default';
  };
  immigrationSubCategories: { key: string; label: string; icon: string }[];
  legalSystemLabel: string;
}

export const HOST_COUNTRIES: Record<HostCountryCode, CountryConfig> = {
  US: {
    code: 'US',
    name: 'United States',
    flag: '\u{1F1FA}\u{1F1F8}',
    currency: 'USD',
    phoneFields: {
      placeholder: '(555) 123-4567',
      phoneRegex: /^[\d\s()+-]{10,}$/,
    },
    addressFields: {
      regionLabel: 'State',
      regionPlaceholder: 'e.g. MD, VA, NY',
      postalCodeLabel: 'Zip Code',
      postalCodePlaceholder: 'e.g. 20001',
      postalCodeRegex: /^\d{5}(-\d{4})?$/,
      postalCodeKeyboardType: 'numeric',
    },
    immigrationSubCategories: [
      { key: 'visa', label: 'Visas', icon: 'card-travel' },
      { key: 'greencard', label: 'Green Card', icon: 'credit-card' },
      { key: 'asylum', label: 'Asylum', icon: 'security' },
      { key: 'citizenship', label: 'Citizenship', icon: 'flag' },
      { key: 'work-permit', label: 'Work Permit', icon: 'work' },
      { key: 'family', label: 'Family-Based', icon: 'people' },
      { key: 'student', label: 'Student', icon: 'school' },
      { key: 'other', label: 'Other', icon: 'help-outline' },
    ],
    legalSystemLabel: 'US legal system',
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '\u{1F1E8}\u{1F1E6}',
    currency: 'CAD',
    phoneFields: {
      placeholder: '(514) 123-4567',
      phoneRegex: /^[\d\s()+-]{10,}$/,
    },
    addressFields: {
      regionLabel: 'Province',
      regionPlaceholder: 'e.g. ON, BC, QC',
      postalCodeLabel: 'Postal Code',
      postalCodePlaceholder: 'e.g. M5V 2H1',
      postalCodeRegex: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
      postalCodeKeyboardType: 'default',
    },
    immigrationSubCategories: [
      { key: 'visa', label: 'Visas', icon: 'card-travel' },
      { key: 'permanent-residence', label: 'Permanent Residence', icon: 'credit-card' },
      { key: 'asylum', label: 'Refugee & Asylum', icon: 'security' },
      { key: 'citizenship', label: 'Citizenship', icon: 'flag' },
      { key: 'work-permit', label: 'Work Permit', icon: 'work' },
      { key: 'family', label: 'Family Sponsorship', icon: 'people' },
      { key: 'student', label: 'Study Permit', icon: 'school' },
      { key: 'other', label: 'Other', icon: 'help-outline' },
    ],
    legalSystemLabel: 'Canadian legal system',
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    flag: '\u{1F1EC}\u{1F1E7}',
    currency: 'GBP',
    phoneFields: {
      placeholder: '020 7946 0958',
      phoneRegex: /^[\d\s()+-]{10,}$/,
    },
    addressFields: {
      regionLabel: 'County',
      regionPlaceholder: 'e.g. Greater London, Kent',
      postalCodeLabel: 'Postcode',
      postalCodePlaceholder: 'e.g. SW1A 1AA',
      postalCodeRegex: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
      postalCodeKeyboardType: 'default',
    },
    immigrationSubCategories: [
      { key: 'visa', label: 'Visas', icon: 'card-travel' },
      { key: 'indefinite-leave', label: 'Indefinite Leave', icon: 'credit-card' },
      { key: 'asylum', label: 'Asylum', icon: 'security' },
      { key: 'citizenship', label: 'British Citizenship', icon: 'flag' },
      { key: 'work-permit', label: 'Skilled Worker', icon: 'work' },
      { key: 'family', label: 'Family Visa', icon: 'people' },
      { key: 'student', label: 'Student Visa', icon: 'school' },
      { key: 'other', label: 'Other', icon: 'help-outline' },
    ],
    legalSystemLabel: 'UK legal system',
  },
  FR: {
    code: 'FR',
    name: 'France',
    flag: '\u{1F1EB}\u{1F1F7}',
    currency: 'EUR',
    phoneFields: {
      placeholder: '01 23 45 67 89',
      phoneRegex: /^[\d\s()+-]{10,}$/,
    },
    addressFields: {
      regionLabel: 'Region',
      regionPlaceholder: 'e.g. Île-de-France, PACA',
      postalCodeLabel: 'Code Postal',
      postalCodePlaceholder: 'e.g. 75001',
      postalCodeRegex: /^\d{5}$/,
      postalCodeKeyboardType: 'numeric',
    },
    immigrationSubCategories: [
      { key: 'visa', label: 'Visas', icon: 'card-travel' },
      { key: 'carte-de-sejour', label: 'Carte de Séjour', icon: 'credit-card' },
      { key: 'asylum', label: 'Asile', icon: 'security' },
      { key: 'citizenship', label: 'Nationalité', icon: 'flag' },
      { key: 'work-permit', label: 'Autorisation de Travail', icon: 'work' },
      { key: 'family', label: 'Regroupement Familial', icon: 'people' },
      { key: 'student', label: 'Visa Étudiant', icon: 'school' },
      { key: 'other', label: 'Autre', icon: 'help-outline' },
    ],
    legalSystemLabel: 'French legal system',
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    flag: '\u{1F1E9}\u{1F1EA}',
    currency: 'EUR',
    phoneFields: {
      placeholder: '030 1234567',
      phoneRegex: /^[\d\s()+-]{10,}$/,
    },
    addressFields: {
      regionLabel: 'Bundesland',
      regionPlaceholder: 'e.g. Berlin, Bayern, NRW',
      postalCodeLabel: 'Postleitzahl',
      postalCodePlaceholder: 'e.g. 10115',
      postalCodeRegex: /^\d{5}$/,
      postalCodeKeyboardType: 'numeric',
    },
    immigrationSubCategories: [
      { key: 'visa', label: 'Visa', icon: 'card-travel' },
      { key: 'aufenthaltstitel', label: 'Aufenthaltstitel', icon: 'credit-card' },
      { key: 'asylum', label: 'Asyl', icon: 'security' },
      { key: 'citizenship', label: 'Einbürgerung', icon: 'flag' },
      { key: 'work-permit', label: 'Arbeitserlaubnis', icon: 'work' },
      { key: 'family', label: 'Familiennachzug', icon: 'people' },
      { key: 'student', label: 'Studienvisum', icon: 'school' },
      { key: 'other', label: 'Sonstiges', icon: 'help-outline' },
    ],
    legalSystemLabel: 'German legal system',
  },
};

export function getCountryConfig(code: HostCountryCode): CountryConfig {
  return HOST_COUNTRIES[code];
}

export const LEGAL_CATEGORIES: { key: LegalCategory; label: string; icon: string; description: string }[] = [
  { key: 'immigration', label: 'Immigration', icon: 'flight', description: 'Visas, green cards, asylum, work permits' },
  { key: 'deportation-defense', label: 'Deportation Defense', icon: 'shield', description: 'Removal proceedings, appeals' },
  { key: 'family-law', label: 'Family Law', icon: 'people', description: 'Divorce, custody, child support' },
  { key: 'criminal-defense', label: 'Criminal Defense', icon: 'gavel', description: 'DUI, charges, expungement' },
  { key: 'personal-injury', label: 'Personal Injury', icon: 'local-hospital', description: 'Accidents, workplace injuries' },
  { key: 'housing', label: 'Housing Rights', icon: 'home', description: 'Evictions, lease disputes' },
];
