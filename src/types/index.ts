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
  expoPushToken?: string;
  createdAt: Timestamp;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

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
  verificationStatus: VerificationStatus;
  phoneVerified?: boolean;
  claimedPhone?: string;
  createdAt: Timestamp;
}

export interface Review {
  id: string;
  businessId?: string;
  lawyerId?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  ownerResponse?: string;
  ownerResponseAt?: Timestamp;
  updatedAt?: Timestamp;
  createdAt: Timestamp;
}

export interface LegalGuide {
  id: string;
  title: string;
  legalCategory: LegalCategory;
  category: ImmigrationCategory;
  hostCountry: HostCountryCode;
  summary: string;
  content: string;
  steps: string[];
  requiredDocuments: string[];
  estimatedTimeline: string;
  estimatedCost: string;
  /** Official government or legal-authority URLs this guide's content is based on. */
  sources?: { label: string; url: string }[];
  lastUpdated: Timestamp;
}

export interface Lawyer {
  id: string;
  name: string;
  firm: string;
  specializations: LegalCategory[];
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
  verificationStatus: VerificationStatus;
  barAssociationNumber?: string;
  ownerId: string;
  createdAt: Timestamp;
}

export interface VerificationRequest {
  id: string;
  entityType: 'business' | 'lawyer';
  entityId: string;
  entityName: string;
  submittedBy: string;
  submittedAt: Timestamp;
  status: VerificationStatus;
  phone: string;
  barAssociationNumber?: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  rejectionReason?: string;
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

export type LegalCategory =
  | 'immigration'
  | 'deportation-defense'
  | 'family-law'
  | 'criminal-defense'
  | 'personal-injury'
  | 'housing';

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

export interface PaginatedResult<T> {
  data: T[];
  /** Opaque Firestore cursor — pass back to the service to fetch the next page. */
  lastDoc: unknown;
  hasMore: boolean;
}

export type RootTabParamList = {
  home: undefined;
  business: undefined;
  legal: undefined;
  profile: undefined;
};
