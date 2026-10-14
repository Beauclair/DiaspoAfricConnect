import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { getBusinessesByOwner } from './businessService';
import { getLawyersByOwner } from './legalService';
import { Business, Lawyer } from '../types';
import { getDeviceId } from '../utils/deviceId';

export type EntityType = 'business' | 'lawyer';
export type TapType = 'call' | 'website' | 'directions' | 'email' | 'save' | 'unsave';

export interface OwnerListing {
  id: string;
  name: string;
  entityType: EntityType;
  totalViews: number;
  totalContactTaps: number;
  totalSaves: number;
  averageRating: number;
  reviewCount: number;
}

/**
 * Fetch all businesses + lawyers owned by the user, mapped to dashboard-friendly shape.
 */
export async function getOwnerListings(uid: string): Promise<OwnerListing[]> {
  const [businesses, lawyers] = await Promise.all([
    getBusinessesByOwner(uid),
    getLawyersByOwner(uid),
  ]);

  const result: OwnerListing[] = [];

  for (const b of businesses) {
    result.push({
      id: b.id,
      name: b.name,
      entityType: 'business',
      totalViews: b.totalViews ?? 0,
      totalContactTaps: b.totalContactTaps ?? 0,
      totalSaves: b.totalSaves ?? 0,
      averageRating: b.averageRating,
      reviewCount: b.reviewCount,
    });
  }

  for (const l of lawyers) {
    result.push({
      id: l.id,
      name: l.name,
      entityType: 'lawyer',
      totalViews: l.totalViews ?? 0,
      totalContactTaps: l.totalContactTaps ?? 0,
      totalSaves: 0, // Lawyers don't have saves
      averageRating: l.averageRating,
      reviewCount: l.reviewCount,
    });
  }

  return result;
}

/**
 * Call the Cloud Function to record a profile view.
 * Supports both authenticated users and anonymous visitors (via deviceId).
 * Fire-and-forget — errors are swallowed to avoid blocking the detail screen.
 */
export async function recordProfileView(
  entityType: EntityType,
  entityId: string,
): Promise<void> {
  try {
    const functions = getFunctions();
    const fn = httpsCallable(functions, 'recordProfileView');
    const payload: Record<string, string> = { entityType, entityId };

    // If the user is not signed in, attach a device ID for anonymous dedup
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      payload.deviceId = await getDeviceId();
    }

    await fn(payload);
  } catch {
    // Silently fail — view tracking should never block the UI
  }
}

/**
 * Call the Cloud Function to record a contact tap (call, website, etc.).
 * Also supports 'save' and 'unsave' tap types for bookmark tracking.
 * Fire-and-forget — errors are swallowed.
 */
export async function recordContactTap(
  entityType: EntityType,
  entityId: string,
  tapType: TapType,
): Promise<void> {
  try {
    const functions = getFunctions();
    const fn = httpsCallable(functions, 'recordContactTap');
    await fn({ entityType, entityId, tapType });
  } catch {
    // Silently fail — tap tracking should never block the UI
  }
}
