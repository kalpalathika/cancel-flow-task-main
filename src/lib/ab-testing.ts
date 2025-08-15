// src/lib/ab-testing.ts
// A/B testing service with cryptographically secure variant assignment

import { secureDb } from './supabase';
import { logSecurityEvent } from './validation';

export type DownsellVariant = 'A' | 'B';

export interface VariantAssignment {
  userId: string;
  variant: DownsellVariant;
  assignedAt: Date;
}

/**
 * Generate cryptographically secure hash for user ID to ensure deterministic variant assignment
 */
async function hashUserId(userId: string): Promise<number> {
  // Use Web Crypto API for secure hashing
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(userId + 'migrate_mate_ab_salt'); // Add salt for security
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    
    // Convert first 4 bytes to integer for modulo operation
    let hash = 0;
    for (let i = 0; i < 4; i++) {
      hash = (hash << 8) | hashArray[i];
    }
    
    return Math.abs(hash);
  } else {
    // Fallback for environments without crypto.subtle (should not be used in production)
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * Assign A/B testing variant based on cryptographically secure hash of user ID
 * Returns 'A' or 'B' deterministically (same user always gets same variant)
 */
async function assignVariant(userId: string): Promise<DownsellVariant> {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID for variant assignment');
    }

    const hash = await hashUserId(userId);
    
    // Use modulo 2 for 50/50 split
    const variant: DownsellVariant = (hash % 2 === 0) ? 'A' : 'B';
    
    logSecurityEvent('ab_variant_assigned', userId, { 
      variant, 
      hash: hash % 1000, // Log only last 3 digits for privacy
      method: 'cryptographic_hash' 
    });
    
    return variant;
  } catch (err) {
    logSecurityEvent('ab_variant_assignment_failed', userId, { error: err });
    
    // Fallback to variant A if assignment fails
    return 'A';
  }
}

/**
 * Get existing variant from database or assign new one
 * Ensures consistency across sessions for the same user
 */
export async function getOrAssignVariant(userId: string): Promise<DownsellVariant> {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    // Check if user already has a variant assigned in any previous cancellation
    const existingCancellation = await secureDb.getCancellation(userId);
    
    if (existingCancellation && existingCancellation.downsell_variant) {
      logSecurityEvent('ab_variant_retrieved', userId, { 
        variant: existingCancellation.downsell_variant,
        source: 'existing_cancellation' 
      });
      
      return existingCancellation.downsell_variant;
    }

    // No existing variant found, assign new one
    const newVariant = await assignVariant(userId);
    
    logSecurityEvent('ab_variant_new_assignment', userId, { 
      variant: newVariant,
      source: 'new_assignment' 
    });
    
    return newVariant;
  } catch (err) {
    logSecurityEvent('ab_variant_error', userId, { error: err });
    
    // Fallback to variant A if anything fails
    return 'A';
  }
}

/**
 * Check if a user should see downsell offers based on their variant
 * Variant A: No downsell offers
 * Variant B: Show downsell offers
 */
export async function shouldShowDownsellOffers(userId: string): Promise<boolean> {
  try {
    const variant = await getOrAssignVariant(userId);
    
    const showOffers = variant === 'B';
    
    logSecurityEvent('ab_downsell_check', userId, { 
      variant, 
      showOffers,
      decision: showOffers ? 'show_downsell' : 'skip_downsell'
    });
    
    return showOffers;
  } catch (err) {
    logSecurityEvent('ab_downsell_check_failed', userId, { error: err });
    
    // Fallback to not showing offers if check fails
    return false;
  }
}

/**
 * Get variant assignment for analytics and debugging
 */
export async function getVariantInfo(userId: string): Promise<VariantAssignment | null> {
  try {
    const variant = await getOrAssignVariant(userId);
    
    return {
      userId,
      variant,
      assignedAt: new Date()
    };
  } catch (err) {
    logSecurityEvent('ab_variant_info_failed', userId, { error: err });
    return null;
  }
}

/**
 * Analytics helper to track A/B test effectiveness
 */
export interface ABTestMetrics {
  variantA: {
    assignments: number;
    conversions: number;
    conversionRate: number;
  };
  variantB: {
    assignments: number;
    conversions: number;
    conversionRate: number;
  };
  totalUsers: number;
  testStartDate: Date;
}

/**
 * Get A/B test metrics (for future analytics dashboard)
 * Note: This would require additional database queries in a real implementation
 */
export async function getABTestMetrics(): Promise<ABTestMetrics | null> {
  // Placeholder for future analytics implementation
  // Would query cancellations table to get actual metrics
  logSecurityEvent('ab_metrics_requested', undefined, { feature: 'analytics_placeholder' });
  
  return null;
}

/**
 * Validate variant value
 */
export function isValidVariant(variant: unknown): variant is DownsellVariant {
  return variant === 'A' || variant === 'B';
}

/**
 * Force reset variant assignment (for testing purposes only)
 * Should not be used in production
 */
export async function resetVariantForTesting(userId: string): Promise<void> {
  logSecurityEvent('ab_variant_reset', userId, { 
    warning: 'testing_only',
    environment: process.env.NODE_ENV 
  });
  
  // In a real implementation, this might clear cached variants
  // For now, we just log the reset attempt
}