// src/types/cancellation.ts
// TypeScript interfaces and types for cancellation flow

export type DownsellVariant = 'A' | 'B';

export type CancellationStep = 
  | 'initial' 
  | 'survey' 
  | 'feedback' 
  | 'visa-offer' 
  | 'downsell-offer' 
  | 'job-search-downsell' 
  | 'job-search-survey' 
  | 'cancellation-reason' 
  | 'completion' 
  | 'final-cancellation';

export type CancellationOutcome = 
  | 'cancelled' 
  | 'continued' 
  | 'downsell_accepted' 
  | 'abandoned' 
  | 'error';

export type CancellationReason = 
  | 'Too expensive' 
  | 'Platform not helpful' 
  | 'Not enough relevant jobs' 
  | 'Decided not to move' 
  | 'Other';

export interface CancellationRecord {
  id: string;
  user_id: string;
  subscription_id: string;
  downsell_variant: DownsellVariant;
  
  // Journey tracking
  cancellation_step?: CancellationStep;
  job_found?: boolean;
  found_with_migrate_mate?: boolean;
  feedback_text?: string;
  reason?: string;
  visa_type?: string;
  has_lawyer?: boolean;
  accepted_downsell: boolean;
  final_outcome?: CancellationOutcome;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface CancellationSession {
  id?: string;
  userId: string;
  subscriptionId: string;
  variant: DownsellVariant;
  currentStep: CancellationStep;
  
  // User responses
  jobFound?: boolean;
  foundWithMigrateMate?: boolean;
  feedbackText?: string;
  cancellationReason?: CancellationReason;
  visaType?: string;
  hasLawyer?: boolean;
  
  // Tracking
  acceptedDownsell: boolean;
  finalOutcome?: CancellationOutcome;
  startedAt: Date;
  lastUpdated: Date;
}

export interface SurveyResponse {
  foundJob: boolean;
  foundWithMigrateMate?: boolean;
  jobTitle?: string;
  companyName?: string;
  salary?: number;
  startDate?: string;
}

export interface FeedbackResponse {
  text: string;
  step: CancellationStep;
  timestamp: Date;
}

export interface VisaOfferResponse {
  hasLawyer: boolean;
  visaType?: string;
}

export interface CancellationReasonResponse {
  reason: CancellationReason;
  details?: string;
  acceptedOffer?: boolean;
}

export interface DownsellOffer {
  type: 'percentage' | 'fixed_amount';
  originalPrice: number;
  discountedPrice: number;
  discountPercentage?: number;
  durationMonths?: number;
  description: string;
}

export interface CancellationAnalytics {
  totalCancellations: number;
  variantACount: number;
  variantBCount: number;
  downsellAcceptanceRate: number;
  commonReasons: Array<{
    reason: CancellationReason;
    count: number;
    percentage: number;
  }>;
  averageFlowDuration: number;
  stepDropoffRates: Record<CancellationStep, number>;
}

// Error types for cancellation flow
export interface CancellationError {
  code: string;
  message: string;
  step?: CancellationStep;
  userId?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

// Service response types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: CancellationError;
}

// Database update payload types
export interface CancellationUpdatePayload {
  cancellation_step?: CancellationStep;
  job_found?: boolean;
  found_with_migrate_mate?: boolean;
  feedback_text?: string;
  reason?: string;
  visa_type?: string;
  has_lawyer?: boolean;
  accepted_downsell?: boolean;
  final_outcome?: CancellationOutcome;
  updated_at?: string;
}

// Subscription update types
export interface SubscriptionUpdatePayload {
  status: 'active' | 'pending_cancellation' | 'cancelled';
  updated_at: string;
}

// Flow state management types
export interface FlowState {
  isInitialized: boolean;
  currentStep: CancellationStep;
  variant: DownsellVariant;
  sessionId?: string;
  hasErrors: boolean;
  isLoading: boolean;
}

// Constants
export const CANCELLATION_STEPS: CancellationStep[] = [
  'initial',
  'survey', 
  'feedback',
  'visa-offer',
  'downsell-offer',
  'job-search-downsell',
  'job-search-survey',
  'cancellation-reason',
  'completion',
  'final-cancellation'
];

export const CANCELLATION_REASONS: CancellationReason[] = [
  'Too expensive',
  'Platform not helpful', 
  'Not enough relevant jobs',
  'Decided not to move',
  'Other'
];

export const CANCELLATION_OUTCOMES: CancellationOutcome[] = [
  'cancelled',
  'continued',
  'downsell_accepted',
  'abandoned',
  'error'
];