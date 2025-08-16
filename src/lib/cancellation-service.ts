// src/lib/cancellation-service.ts
// Comprehensive service for managing cancellation lifecycle and data persistence

import { secureDb } from './supabase';
import { getOrAssignVariant } from './ab-testing';
import { logSecurityEvent, sanitizeForDatabase } from './validation';
import type {
  CancellationSession,
  CancellationStep,
  CancellationOutcome,
  CancellationUpdatePayload,
  ServiceResponse,
  SurveyResponse,
  FeedbackResponse,
  VisaOfferResponse,
  CancellationReasonResponse
} from '../types/cancellation';

export class CancellationService {
  /**
   * Initialize a new cancellation session
   * Assigns A/B variant and creates initial database record
   */
  async initializeCancellation(userId: string): Promise<ServiceResponse<CancellationSession>> {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }

      // Get user's subscription
      const subscription = await secureDb.getSubscription(userId);
      if (!subscription) {
        throw new Error('No active subscription found for user');
      }

      // Check if user already has an active cancellation session
      const existingCancellation = await secureDb.getCancellation(userId);

      // Assign A/B testing variant (pass existing cancellation to avoid duplicate DB call)
      const variant = await getOrAssignVariant(userId, existingCancellation);
      
      if (existingCancellation) {
        // Reuse existing cancellation object preserving all data
        // Only ensure downsell variant consistency
        const existingVariant = existingCancellation.downsell_variant;
        
        // Verify the variant matches what would be assigned (should always match due to deterministic assignment)
        if (existingVariant !== variant) {
          logSecurityEvent('variant_mismatch_detected', userId, { 
            existingVariant,
            calculatedVariant: variant,
            cancellationId: existingCancellation.id
          });
          // Use the existing variant to maintain consistency
        }

        const session: CancellationSession = {
          id: existingCancellation.id,
          userId,
          subscriptionId: subscription.id,
          variant: existingVariant, // Always use the existing variant
          currentStep: 'initial', // Always start from initial step for UX
          jobFound: existingCancellation.job_found,
          foundWithMigrateMate: existingCancellation.found_with_migrate_mate,
          feedbackText: existingCancellation.feedback_text || undefined,
          visaType: existingCancellation.visa_type || undefined,
          hasLawyer: existingCancellation.has_lawyer,
          acceptedDownsell: existingCancellation.accepted_downsell,
          finalOutcome: existingCancellation.final_outcome as CancellationOutcome,
          startedAt: new Date(existingCancellation.created_at),
          lastUpdated: new Date(existingCancellation.updated_at || existingCancellation.created_at)
        };

        logSecurityEvent('cancellation_session_resumed', userId, { 
          sessionId: session.id,
          variant: existingVariant,
          currentStep: 'initial',
          hasExistingData: !!(session.jobFound !== null || session.feedbackText || session.finalOutcome)
        });

        return { success: true, data: session };
      }

      // Create new cancellation record
      const cancellationData = {
        user_id: userId,
        subscription_id: subscription.id,
        downsell_variant: variant,
        cancellation_step: 'initial' as CancellationStep,
        accepted_downsell: false
      };

      const cancellation = await secureDb.createCancellation(cancellationData);
      
      if (!cancellation) {
        throw new Error('Failed to create cancellation record');
      }

      const session: CancellationSession = {
        id: cancellation.id,
        userId,
        subscriptionId: subscription.id,
        variant,
        currentStep: 'initial',
        acceptedDownsell: false,
        startedAt: new Date(cancellation.created_at),
        lastUpdated: new Date(cancellation.created_at)
      };

      logSecurityEvent('cancellation_session_initialized', userId, { 
        sessionId: session.id,
        variant,
        subscriptionPrice: subscription.monthly_price 
      });

      return { success: true, data: session };

    } catch (err) {
      const error = {
        code: 'INITIALIZATION_FAILED',
        message: err instanceof Error ? err.message : 'Failed to initialize cancellation',
        step: 'initial' as CancellationStep,
        userId,
        timestamp: new Date()
      };

      logSecurityEvent('cancellation_initialization_failed', userId, { error });
      return { success: false, error };
    }
  }

  /**
   * Update cancellation data for a specific step
   */
  async updateCancellationStep(
    sessionId: string, 
    userId: string, 
    step: CancellationStep, 
    data: Partial<CancellationUpdatePayload>
  ): Promise<ServiceResponse<boolean>> {
    try {
      if (!sessionId || !userId || !step) {
        throw new Error('Missing required parameters for step update');
      }

      // Sanitize the update data
      const sanitizedData = sanitizeForDatabase({
        ...data,
        cancellation_step: step,
        updated_at: new Date().toISOString()
      });

      // Update using the secure database client
      const success = await secureDb.updateCancellation(sessionId, userId, sanitizedData);

      if (!success) {
        throw new Error('Database update failed');
      }

      logSecurityEvent('cancellation_step_updated', userId, { 
        sessionId,
        step,
        updateFields: Object.keys(data) 
      });

      return { success: true, data: true };

    } catch (err) {
      const error = {
        code: 'STEP_UPDATE_FAILED',
        message: err instanceof Error ? err.message : 'Failed to update cancellation step',
        step,
        userId,
        timestamp: new Date()
      };

      logSecurityEvent('cancellation_step_update_failed', userId, { error, sessionId });
      return { success: false, error };
    }
  }

  /**
   * Process survey response and update cancellation record
   */
  async processSurveyResponse(
    sessionId: string, 
    userId: string, 
    response: SurveyResponse
  ): Promise<ServiceResponse<boolean>> {
    try {
      const updateData: CancellationUpdatePayload = {
        job_found: response.foundJob,
        found_with_migrate_mate: response.foundWithMigrateMate,
        cancellation_step: 'survey'
      };

      return await this.updateCancellationStep(sessionId, userId, 'survey', updateData);

    } catch (err) {
      const error = {
        code: 'SURVEY_PROCESSING_FAILED',
        message: err instanceof Error ? err.message : 'Failed to process survey response',
        step: 'survey' as CancellationStep,
        userId,
        timestamp: new Date()
      };

      return { success: false, error };
    }
  }

  /**
   * Process feedback response and update cancellation record
   */
  async processFeedbackResponse(
    sessionId: string, 
    userId: string, 
    response: FeedbackResponse
  ): Promise<ServiceResponse<boolean>> {
    try {
      const updateData: CancellationUpdatePayload = {
        feedback_text: response.text,
        cancellation_step: 'feedback'
      };

      return await this.updateCancellationStep(sessionId, userId, 'feedback', updateData);

    } catch (err) {
      const error = {
        code: 'FEEDBACK_PROCESSING_FAILED',
        message: err instanceof Error ? err.message : 'Failed to process feedback response',
        step: 'feedback' as CancellationStep,
        userId,
        timestamp: new Date()
      };

      return { success: false, error };
    }
  }

  /**
   * Process visa offer response and update cancellation record
   */
  async processVisaOfferResponse(
    sessionId: string, 
    userId: string, 
    response: VisaOfferResponse
  ): Promise<ServiceResponse<boolean>> {
    try {
      const updateData: CancellationUpdatePayload = {
        has_lawyer: response.hasLawyer,
        visa_type: response.visaType,
        cancellation_step: 'visa-offer'
      };

      return await this.updateCancellationStep(sessionId, userId, 'visa-offer', updateData);

    } catch (err) {
      const error = {
        code: 'VISA_OFFER_PROCESSING_FAILED',
        message: err instanceof Error ? err.message : 'Failed to process visa offer response',
        step: 'visa-offer' as CancellationStep,
        userId,
        timestamp: new Date()
      };

      return { success: false, error };
    }
  }

  /**
   * Process cancellation reason and update record
   */
  async processCancellationReason(
    sessionId: string, 
    userId: string, 
    response: CancellationReasonResponse
  ): Promise<ServiceResponse<boolean>> {
    try {
      const updateData: CancellationUpdatePayload = {
        reason: response.details ? `${response.reason}: ${response.details}` : response.reason,
        accepted_downsell: response.acceptedOffer || false,
        cancellation_step: 'cancellation-reason'
      };

      return await this.updateCancellationStep(sessionId, userId, 'cancellation-reason', updateData);

    } catch (err) {
      const error = {
        code: 'REASON_PROCESSING_FAILED',
        message: err instanceof Error ? err.message : 'Failed to process cancellation reason',
        step: 'cancellation-reason' as CancellationStep,
        userId,
        timestamp: new Date()
      };

      return { success: false, error };
    }
  }

  /**
   * Mark subscription as pending cancellation
   */
  async markSubscriptionPendingCancellation(userId: string): Promise<ServiceResponse<boolean>> {
    try {
      const success = await secureDb.updateSubscriptionStatus(userId, 'pending_cancellation');
      
      if (!success) {
        throw new Error('Failed to update subscription status');
      }

      logSecurityEvent('subscription_marked_pending_cancellation', userId);
      return { success: true, data: true };

    } catch (err) {
      const error = {
        code: 'SUBSCRIPTION_UPDATE_FAILED',
        message: err instanceof Error ? err.message : 'Failed to mark subscription as pending cancellation',
        userId,
        timestamp: new Date()
      };

      return { success: false, error };
    }
  }

  /**
   * Finalize cancellation with outcome
   */
  async finalizeCancellation(
    sessionId: string, 
    userId: string, 
    outcome: CancellationOutcome
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Update cancellation record with final outcome
      const updateResult = await this.updateCancellationStep(sessionId, userId, 'final-cancellation', {
        final_outcome: outcome
      });

      if (!updateResult.success) {
        throw new Error('Failed to update cancellation with final outcome');
      }

      // Update subscription status based on outcome
      if (outcome === 'cancelled') {
        await secureDb.updateSubscriptionStatus(userId, 'cancelled');
      } else if (outcome === 'continued' || outcome === 'downsell_accepted') {
        await secureDb.updateSubscriptionStatus(userId, 'active');
      }

      logSecurityEvent('cancellation_finalized', userId, { 
        sessionId,
        outcome 
      });

      return { success: true, data: true };

    } catch (err) {
      const error = {
        code: 'FINALIZATION_FAILED',
        message: err instanceof Error ? err.message : 'Failed to finalize cancellation',
        step: 'final-cancellation' as CancellationStep,
        userId,
        timestamp: new Date()
      };

      return { success: false, error };
    }
  }

  /**
   * Get current cancellation session for a user
   */
  async getCancellationSession(userId: string): Promise<ServiceResponse<CancellationSession | null>> {
    try {
      const cancellation = await secureDb.getCancellation(userId);
      
      if (!cancellation) {
        return { success: true, data: null };
      }

      const subscription = await secureDb.getSubscription(userId);
      if (!subscription) {
        throw new Error('Subscription not found for cancellation');
      }

      const session: CancellationSession = {
        id: cancellation.id,
        userId,
        subscriptionId: subscription.id,
        variant: cancellation.downsell_variant,
        currentStep: (cancellation.cancellation_step as CancellationStep) || 'initial',
        jobFound: cancellation.job_found,
        foundWithMigrateMate: cancellation.found_with_migrate_mate,
        feedbackText: cancellation.feedback_text || undefined,
        visaType: cancellation.visa_type || undefined,
        hasLawyer: cancellation.has_lawyer,
        acceptedDownsell: cancellation.accepted_downsell,
        finalOutcome: cancellation.final_outcome as CancellationOutcome,
        startedAt: new Date(cancellation.created_at),
        lastUpdated: new Date(cancellation.updated_at || cancellation.created_at)
      };

      return { success: true, data: session };

    } catch (err) {
      const error = {
        code: 'SESSION_RETRIEVAL_FAILED',
        message: err instanceof Error ? err.message : 'Failed to retrieve cancellation session',
        userId,
        timestamp: new Date()
      };

      return { success: false, error };
    }
  }
}

// Export singleton instance
export const cancellationService = new CancellationService();