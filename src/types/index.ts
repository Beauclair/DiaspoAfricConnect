import type { Timestamp } from 'firebase/firestore';
import { HostCountryCode } from '../constants/countries';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  countryOfOrigin?: string;
  hostCountry?: HostCountryCode;
  languagesSpoken?: string[];
  savedBusinesses?: string[];
  createdAt: Timestamp;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: BusinessCategory;
  countryOfOrigin: string;
  hostCountry: HostCountryCode;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  phone?: string;
  website?: string;
  languagesSpoken: string[];
  photos: string[];
  ownerId: string;
  averageRating: number;
  reviewCount: number;
  isVerified: boolean;
  createdAt: Timestamp;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  ownerResponse?: string;
  ownerResponseAt?: Timestamp;
  createdAt: Timestamp;
}

export interface ImmigrationGuide {
  id: string;
  title: string;
  category: ImmigrationCategory;
  hostCountry: HostCountryCode;
  summary: string;
  content: string;
  steps: string[];
  requiredDocuments: string[];
  estimatedTimeline: string;
  estimatedCost: string;
  lastUpdated: Timestamp;
}

export interface Lawyer {
  id: string;
  name: string;
  firm: string;
  specializations: ImmigrationCategory[];
  hostCountry: HostCountryCode;
  languagesSpoken: string[];
  city: string;
  state: string;
  phone: string;
  email: string;
  website?: string;
  photoURL?: string;
  averageRating: number;
  reviewCount: number;
  consultationFee?: string;
  createdAt: Timestamp;
}

export type BusinessCategory =
  | 'restaurant'
  | 'grocery'
  | 'beauty'
  | 'fashion'
  | 'services'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'other';

export type ImmigrationCategory =
  | 'visa'
  | 'greencard'
  | 'permanent-residence'
  | 'indefinite-leave'
  | 'carte-de-sejour'
  | 'aufenthaltstitel'
  | 'asylum'
  | 'citizenship'
  | 'work-permit'
  | 'family'
  | 'student'
  | 'other';

export type RootTabParamList = {
  home: undefined;
  business: undefined;
  immigration: undefined;
  profile: undefined;
};
