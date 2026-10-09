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
  regions: { code: string; name: string }[];
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
    regions: [
      { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
      { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
      { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'DC', name: 'District of Columbia' },
      { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
      { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
      { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
      { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
      { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
      { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
      { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
      { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
      { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
      { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
      { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
      { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
      { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
      { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
    ],
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
    regions: [
      { code: 'AB', name: 'Alberta' }, { code: 'BC', name: 'British Columbia' },
      { code: 'MB', name: 'Manitoba' }, { code: 'NB', name: 'New Brunswick' },
      { code: 'NL', name: 'Newfoundland and Labrador' }, { code: 'NS', name: 'Nova Scotia' },
      { code: 'NT', name: 'Northwest Territories' }, { code: 'NU', name: 'Nunavut' },
      { code: 'ON', name: 'Ontario' }, { code: 'PE', name: 'Prince Edward Island' },
      { code: 'QC', name: 'Quebec' }, { code: 'SK', name: 'Saskatchewan' },
      { code: 'YT', name: 'Yukon' },
    ],
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
    regions: [
      { code: 'LDN', name: 'Greater London' }, { code: 'WMD', name: 'West Midlands' },
      { code: 'GTM', name: 'Greater Manchester' }, { code: 'WYK', name: 'West Yorkshire' },
      { code: 'KEN', name: 'Kent' }, { code: 'ESS', name: 'Essex' },
      { code: 'LAN', name: 'Lancashire' }, { code: 'HAM', name: 'Hampshire' },
      { code: 'SRY', name: 'Surrey' }, { code: 'MSY', name: 'Merseyside' },
      { code: 'SYK', name: 'South Yorkshire' }, { code: 'HRT', name: 'Hertfordshire' },
      { code: 'TWR', name: 'Tyne and Wear' }, { code: 'NTT', name: 'Nottinghamshire' },
      { code: 'BST', name: 'Bristol' }, { code: 'DEV', name: 'Devon' },
      { code: 'NFK', name: 'Norfolk' }, { code: 'DBY', name: 'Derbyshire' },
      { code: 'OXF', name: 'Oxfordshire' }, { code: 'CAM', name: 'Cambridgeshire' },
    ],
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
    regions: [
      { code: 'IDF', name: 'Île-de-France' }, { code: 'ARA', name: 'Auvergne-Rhône-Alpes' },
      { code: 'NAQ', name: 'Nouvelle-Aquitaine' }, { code: 'OCC', name: 'Occitanie' },
      { code: 'HDF', name: 'Hauts-de-France' }, { code: 'PAC', name: "Provence-Alpes-Côte d'Azur" },
      { code: 'GES', name: 'Grand Est' }, { code: 'PDL', name: 'Pays de la Loire' },
      { code: 'BFC', name: 'Bourgogne-Franche-Comté' }, { code: 'BRE', name: 'Bretagne' },
      { code: 'NOR', name: 'Normandie' }, { code: 'CVL', name: 'Centre-Val de Loire' },
      { code: 'COR', name: 'Corse' }, { code: 'GUA', name: 'Guadeloupe' },
      { code: 'MTQ', name: 'Martinique' }, { code: 'GUF', name: 'Guyane' },
      { code: 'REU', name: 'La Réunion' }, { code: 'MAY', name: 'Mayotte' },
    ],
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
    regions: [
      { code: 'BW', name: 'Baden-Württemberg' }, { code: 'BY', name: 'Bayern' },
      { code: 'BE', name: 'Berlin' }, { code: 'BB', name: 'Brandenburg' },
      { code: 'HB', name: 'Bremen' }, { code: 'HH', name: 'Hamburg' },
      { code: 'HE', name: 'Hessen' }, { code: 'MV', name: 'Mecklenburg-Vorpommern' },
      { code: 'NI', name: 'Niedersachsen' }, { code: 'NW', name: 'Nordrhein-Westfalen' },
      { code: 'RP', name: 'Rheinland-Pfalz' }, { code: 'SL', name: 'Saarland' },
      { code: 'SN', name: 'Sachsen' }, { code: 'ST', name: 'Sachsen-Anhalt' },
      { code: 'SH', name: 'Schleswig-Holstein' }, { code: 'TH', name: 'Thüringen' },
    ],
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

export const COMMON_LANGUAGES = [
  'English', 'French', 'Spanish', 'Arabic', 'Swahili',
  'Portuguese', 'Wolof', 'Hausa', 'Yoruba', 'Igbo',
  'Amharic', 'Somali', 'Lingala', 'Bambara', 'Twi',
  'Zulu', 'German', 'Italian', 'Dutch', 'Mandarin',
  'Pidgin English', 'Creole', 'Tigrinya', 'Oromo', 'Malagasy',
];
