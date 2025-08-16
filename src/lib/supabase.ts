


// src/lib/supabase.ts
// Supabase client configuration with security enhancements

import { createClient } from '@supabase/supabase-js';
import { sanitizeForDatabase, logSecurityEvent } from './validation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only validate on server-side or when we actually have the variables
if (typeof window === 'undefined') {
  // Server-side: strict validation
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables');
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key', 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10, // Rate limiting for realtime events
      },
    },
  }
);

// Server-side client with service role key for admin operations
// Only create admin client if we have the service role key (server-side only)
export const supabaseAdmin = (() => {
  if (typeof window !== 'undefined') {
    // Client-side, no admin client
    return null;
  }
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found for admin client');
    return null;
  }
  
  return createClient(supabaseUrl || 'https://placeholder.supabase.co', serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
})();

// Database types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  monthly_price: number;
  status: 'active' | 'pending_cancellation' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Cancellation {
  id: string;
  user_id: string;
  subscription_id: string;
  downsell_variant: 'A' | 'B';
  reason: string | null;
  accepted_downsell: boolean;
  job_found: boolean | null;
  found_with_migrate_mate: boolean | null;
  feedback_text: string | null;
  visa_type: string | null;
  has_lawyer: boolean | null;
  final_outcome: string | null;
  roles_applied: string | null;
  companies_emailed: string | null;
  companies_interviewed: string | null;
  created_at: string;
  updated_at?: string;
}

// Secure database operations
export class SecureDatabase {
  private client = supabase;
  private adminClient = supabaseAdmin;
  
  // Get user with validation
  async getUser(userId: string): Promise<User | null> {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }

      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logSecurityEvent('database_error', userId, { operation: 'getUser', error: error.message });
        return null;
      }

      return data;
    } catch (err) {
      logSecurityEvent('database_exception', userId, { operation: 'getUser', error: err });
      return null;
    }
  }

  // Get subscription with validation
  async getSubscription(userId: string): Promise<Subscription | null> {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }

      const { data, error } = await this.client
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logSecurityEvent('database_error', userId, { operation: 'getSubscription', error: error.message });
        return null;
      }

      return data;
    } catch (err) {
      logSecurityEvent('database_exception', userId, { operation: 'getSubscription', error: err });
      return null;
    }
  }

  // Update subscription status securely
  async updateSubscriptionStatus(userId: string, status: Subscription['status']): Promise<boolean> {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }

      if (!['active', 'pending_cancellation', 'cancelled'].includes(status)) {
        throw new Error('Invalid subscription status');
      }

      const { error } = await this.client
        .from('subscriptions')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId);

      if (error) {
        logSecurityEvent('database_error', userId, { operation: 'updateSubscriptionStatus', error: error.message });
        return false;
      }

      logSecurityEvent('subscription_status_updated', userId, { newStatus: status });
      return true;
    } catch (err) {
      logSecurityEvent('database_exception', userId, { operation: 'updateSubscriptionStatus', error: err });
      return false;
    }
  }

  // Create cancellation record securely
  async createCancellation(data: {
    user_id: string;
    subscription_id: string;
    downsell_variant: 'A' | 'B';
    reason?: string;
    accepted_downsell: boolean;
  }): Promise<Cancellation | null> {
    try {
      // Sanitize input data
      const sanitizedData = sanitizeForDatabase(data);

      // Validate required fields
      if (!sanitizedData.user_id || !sanitizedData.subscription_id) {
        throw new Error('Missing required cancellation data');
      }

      if (!['A', 'B'].includes(sanitizedData.downsell_variant as string)) {
        throw new Error('Invalid downsell variant');
      }

      const { data: cancellation, error } = await this.client
        .from('cancellations')
        .insert([{
          ...sanitizedData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        logSecurityEvent('database_error', data.user_id, { operation: 'createCancellation', error: error.message });
        return null;
      }

      logSecurityEvent('cancellation_created', data.user_id, { 
        variant: data.downsell_variant,
        acceptedDownsell: data.accepted_downsell 
      });
      
      return cancellation;
    } catch (err) {
      logSecurityEvent('database_exception', data.user_id, { operation: 'createCancellation', error: err });
      return null;
    }
  }

  // Get existing cancellation for variant persistence
  async getCancellation(userId: string): Promise<Cancellation | null> {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }

      const { data, error } = await this.client
        .from('cancellations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logSecurityEvent('database_error', userId, { operation: 'getCancellation', error: error.message });
        return null;
      }

      return data;
    } catch (err) {
      logSecurityEvent('database_exception', userId, { operation: 'getCancellation', error: err });
      return null;
    }
  }

  // Update cancellation record
  async updateCancellation(cancellationId: string, userId: string, updateData: Record<string, unknown>): Promise<boolean> {
    try {
      if (!cancellationId || !userId) {
        throw new Error('Invalid cancellation ID or user ID');
      }

      // Sanitize input data
      const sanitizedData = sanitizeForDatabase(updateData);

      const { error } = await this.client
        .from('cancellations')
        .update({
          ...sanitizedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', cancellationId)
        .eq('user_id', userId);

      if (error) {
        logSecurityEvent('database_error', userId, { operation: 'updateCancellation', error: error.message });
        return false;
      }

      logSecurityEvent('cancellation_updated', userId, { cancellationId });
      return true;
    } catch (err) {
      logSecurityEvent('database_exception', userId, { operation: 'updateCancellation', error: err });
      return false;
    }
  }
}

// Export singleton instance
export const secureDb = new SecureDatabase(); 