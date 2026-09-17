import { BusinessCategory, ImmigrationCategory } from '../types';

export const BUSINESS_CATEGORIES: { key: BusinessCategory; label: string; icon: string }[] = [
  { key: 'restaurant', label: 'Restaurants', icon: 'restaurant' },
  { key: 'grocery', label: 'Grocery', icon: 'shopping-cart' },
  { key: 'beauty', label: 'Beauty', icon: 'cut' },
  { key: 'fashion', label: 'Fashion', icon: 'shopping-bag' },
  { key: 'services', label: 'Services', icon: 'build' },
  { key: 'health', label: 'Health', icon: 'local-hospital' },
  { key: 'education', label: 'Education', icon: 'school' },
  { key: 'entertainment', label: 'Entertainment', icon: 'music-note' },
  { key: 'other', label: 'Other', icon: 'more-horiz' },
];

export const IMMIGRATION_CATEGORIES: { key: ImmigrationCategory; label: string; icon: string }[] = [
  { key: 'visa', label: 'Visas', icon: 'card-travel' },
  { key: 'greencard', label: 'Permanent Residence', icon: 'credit-card' },
  { key: 'asylum', label: 'Asylum', icon: 'security' },
  { key: 'citizenship', label: 'Citizenship', icon: 'flag' },
  { key: 'work-permit', label: 'Work Permit', icon: 'work' },
  { key: 'family', label: 'Family-Based', icon: 'people' },
  { key: 'student', label: 'Student', icon: 'school' },
  { key: 'other', label: 'Other', icon: 'help-outline' },
];

export const AFRICAN_COUNTRIES = [
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi',
  'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros',
  'Congo (DRC)', 'Congo (Republic)', 'Cote d\'Ivoire', 'Djibouti', 'Egypt',
  'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia',
  'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya',
  'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco',
  'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe',
  'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan',
  'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe',
];

export const LANGUAGES = [
  'English', 'French', 'Swahili', 'Amharic', 'Arabic', 'Hausa', 'Yoruba',
  'Igbo', 'Zulu', 'Somali', 'Tigrinya', 'Wolof', 'Lingala', 'Twi',
  'Kinyarwanda', 'Portuguese', 'Shona', 'Oromo',
];
