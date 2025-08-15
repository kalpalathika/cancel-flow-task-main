'use client';

import { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { cancellationService } from '../lib/cancellation-service';
import type { CancellationSession } from '../types/cancellation';
import CongratsSurvey from './CongratsSurvey';
import FeedbackStep from './FeedbackStep';
import VisaOfferStep from './VisaOfferStep';
import DownsellOfferStep from './DownsellOfferStep';
import CompletionStep from './CompletionStep';
import YesLawyerCompletionStep from './YesLawyerCompletionStep';
import JobSearchDownsellStep from './JobSearchDownsellStep';
import SubscriptionContinuedStep from './SubscriptionContinuedStep';
import JobSearchSurveyStep from './JobSearchSurveyStep';
import CancellationReasonStep from './CancellationReasonStep';
import FinalCancellationStep from './FinalCancellationStep';

interface CancellationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onJobFoundResponse: (foundJob: boolean) => void;
}

type FlowStep = 'initial' | 'feedback' | 'survey' | 'visa-offer' | 'downsell-offer' | 'completion' | 'yes-lawyer-completion' | 'job-search-downsell' | 'subscription-continued' | 'job-search-survey' | 'cancellation-reason' | 'final-cancellation';

export default function CancellationFlow({ isOpen, onClose, onJobFoundResponse }: CancellationFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('initial');
  const [userFoundJob, setUserFoundJob] = useState<boolean>(false);
  const [foundWithMigrateMate, setFoundWithMigrateMate] = useState<boolean>(false);
  const [cancellationSession, setCancellationSession] = useState<CancellationSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Mock user ID - in real app this would come from auth context
  // Using the first user ID from your database
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  // Initialize cancellation session when modal opens
  useEffect(() => {
    if (isOpen && !cancellationSession && !isLoading && !error) {
      initializeCancellation();
    }
  }, [isOpen, cancellationSession, isLoading, error]);

  const initializeCancellation = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await cancellationService.initializeCancellation(userId);
      
      if (result.success && result.data) {
        setCancellationSession(result.data);
        setCurrentStep(result.data.currentStep as FlowStep);
        
        // Restore previous state if resuming session
        if (result.data.jobFound !== undefined) {
          setUserFoundJob(result.data.jobFound);
        }
        if (result.data.foundWithMigrateMate !== undefined) {
          setFoundWithMigrateMate(result.data.foundWithMigrateMate);
        }
      } else {
        setError(result.error?.message || 'Failed to initialize cancellation');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Cancellation initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    // Reset flow when modal closes
    if (currentStep !== 'initial') {
      setCurrentStep('initial');
      setCancellationSession(null);
      setError('');
    }
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <BaseModal isOpen={true} onClose={onClose} title="Loading...">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8952fc] mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing cancellation flow...</p>
          </div>
        </div>
      </BaseModal>
    );
  }

  // Show error state
  if (error) {
    return (
      <BaseModal isOpen={true} onClose={onClose} title="Error">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError('');
              initializeCancellation();
            }}
            className="px-4 py-2 bg-[#8952fc] text-white rounded-lg hover:bg-[#7b40fc] transition-colors"
          >
            Try again
          </button>
        </div>
      </BaseModal>
    );
  }

  const handleJobResponse = async (foundJob: boolean) => {
    setUserFoundJob(foundJob);
    
    // Update cancellation record with job found status
    if (cancellationSession?.id) {
      await cancellationService.updateCancellationStep(
        cancellationSession.id,
        userId,
        'initial',
        { job_found: foundJob }
      );
    }
    
    if (foundJob) {
      // If they found a job, go to congrats survey first
      setCurrentStep('survey');
    } else {
      // If they didn't find a job, show the downsell offer first
      setCurrentStep('job-search-downsell');
    }
  };

  const handleSurveyComplete = async (responses: Record<string, unknown>) => {
    console.log('Survey responses:', responses);
    const foundJobWithMM = responses.foundWithMigrateMate as boolean;
    setFoundWithMigrateMate(foundJobWithMM);
    
    // Save survey response to database
    if (cancellationSession) {
      await cancellationService.processSurveyResponse(
        cancellationSession.id!,
        userId,
        {
          foundJob: userFoundJob,
          foundWithMigrateMate: foundJobWithMM,
          jobTitle: responses.jobTitle as string,
          companyName: responses.companyName as string,
          salary: responses.salary as number,
          startDate: responses.startDate as string
        }
      );
    }
    
    // Always go to feedback step after survey, regardless of MM response
    setCurrentStep('feedback');
  };

  const handleBackToInitial = () => {
    setCurrentStep('initial');
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    console.log('Feedback submitted:', feedback);
    
    // Save feedback to database
    if (cancellationSession) {
      await cancellationService.processFeedbackResponse(
        cancellationSession.id!,
        userId,
        {
          text: feedback,
          step: 'feedback',
          timestamp: new Date()
        }
      );
    }
    
    // Check if they found job with Migrate Mate from survey
    if (userFoundJob && foundWithMigrateMate) {
      // If yes, go to visa offer step
      setCurrentStep('visa-offer');
    } else if (userFoundJob && !foundWithMigrateMate) {
      // If they found job but NOT with Migrate Mate, go to downsell offer
      setCurrentStep('downsell-offer');
    } else {
      // If they didn't find a job, complete the cancellation flow
      onJobFoundResponse(false);
    }
  };

  const handleVisaOfferComplete = async (hasLawyer: boolean, visaType?: string) => {
    console.log('Visa offer response:', hasLawyer, 'Visa type:', visaType);
    
    // Save visa offer response to database
    if (cancellationSession) {
      await cancellationService.processVisaOfferResponse(
        cancellationSession.id!,
        userId,
        {
          hasLawyer,
          visaType
        }
      );
    }
    
    // If they have a lawyer (Yes), show yes-lawyer completion screen
    if (hasLawyer) {
      setCurrentStep('yes-lawyer-completion');
    } else {
      // If they don't have a lawyer (No), show regular completion screen
      setCurrentStep('completion');
    }
  };

  const handleDownsellOfferComplete = (hasLawyer: boolean, visaType?: string) => {
    console.log('Downsell offer response:', hasLawyer, 'Visa type:', visaType);
    // If they have a lawyer (Yes), show yes-lawyer completion screen
    if (hasLawyer) {
      setCurrentStep('yes-lawyer-completion');
    } else {
      // If they don't have a lawyer (No), show regular completion screen
      setCurrentStep('completion');
    }
  };

  const handleCompletionFinish = async () => {
    // Finalize cancellation with continued outcome
    if (cancellationSession) {
      await cancellationService.finalizeCancellation(
        cancellationSession.id!,
        userId,
        'continued'
      );
    }
    
    // Complete the cancellation flow
    onJobFoundResponse(true);
  };

  const handleYesLawyerCompletionFinish = async () => {
    // Finalize cancellation with continued outcome
    if (cancellationSession) {
      await cancellationService.finalizeCancellation(
        cancellationSession.id!,
        userId,
        'continued'
      );
    }
    
    // Complete the cancellation flow
    onJobFoundResponse(true);
  };

  const handleJobSearchDownsellAccept = async () => {
    // Mark downsell as accepted
    if (cancellationSession) {
      await cancellationService.updateCancellationStep(
        cancellationSession.id!,
        userId,
        'job-search-downsell',
        { accepted_downsell: true }
      );
    }
    
    // User accepted the downsell offer, show subscription continued screen
    setCurrentStep('subscription-continued');
  };

  const handleJobSearchDownsellDecline = async () => {
    // Mark downsell as declined
    if (cancellationSession) {
      await cancellationService.updateCancellationStep(
        cancellationSession.id!,
        userId,
        'job-search-downsell',
        { accepted_downsell: false }
      );
    }
    
    // User declined the downsell offer, go to survey step
    setCurrentStep('job-search-survey');
  };

  const handleSubscriptionContinuedFinish = async () => {
    // Finalize with downsell accepted outcome
    if (cancellationSession) {
      await cancellationService.finalizeCancellation(
        cancellationSession.id!,
        userId,
        'downsell_accepted'
      );
    }
    
    // User completed the subscription continuation, go to survey step
    setCurrentStep('job-search-survey');
  };

  const handleJobSearchSurveyAcceptOffer = async () => {
    // Mark second downsell as accepted
    if (cancellationSession) {
      await cancellationService.updateCancellationStep(
        cancellationSession.id!,
        userId,
        'job-search-survey',
        { accepted_downsell: true }
      );
    }
    
    // User accepted 50% off from survey, go to subscription continued
    setCurrentStep('subscription-continued');
  };

  const handleJobSearchSurveyComplete = async () => {
    // Track survey completion
    if (cancellationSession) {
      await cancellationService.updateCancellationStep(
        cancellationSession.id!,
        userId,
        'job-search-survey',
        { cancellation_step: 'job-search-survey' }
      );
    }
    
    // User completed the survey without accepting offer, go to cancellation reason step
    setCurrentStep('cancellation-reason');
  };

  const handleCancellationReasonAcceptOffer = async () => {
    // Mark final downsell as accepted
    if (cancellationSession) {
      await cancellationService.updateCancellationStep(
        cancellationSession.id!,
        userId,
        'cancellation-reason',
        { accepted_downsell: true }
      );
    }
    
    // User accepted 50% off from cancellation reason, go to subscription continued
    setCurrentStep('subscription-continued');
  };

  const handleCancellationReasonComplete = async () => {
    // Mark subscription as pending cancellation
    if (cancellationSession) {
      await cancellationService.markSubscriptionPendingCancellation(userId);
    }
    
    // User completed cancellation reason without accepting offer, show final cancellation screen
    setCurrentStep('final-cancellation');
  };

  const handleFinalCancellationBackToJobs = async () => {
    // Finalize cancellation
    if (cancellationSession) {
      await cancellationService.finalizeCancellation(
        cancellationSession.id!,
        userId,
        'cancelled'
      );
    }
    
    // User clicked back to jobs, complete the cancellation flow
    onJobFoundResponse(false);
  };

  // Show final cancellation step
  if (currentStep === 'final-cancellation') {
    return (
      <FinalCancellationStep
        isOpen={true}
        onClose={onClose}
        onBackToJobs={handleFinalCancellationBackToJobs}
      />
    );
  }

  // Show cancellation reason step
  if (currentStep === 'cancellation-reason') {
    return (
      <CancellationReasonStep
        isOpen={true}
        onClose={onClose}
        onBack={() => setCurrentStep('job-search-survey')}
        onAcceptOffer={handleCancellationReasonAcceptOffer}
        onComplete={handleCancellationReasonComplete}
      />
    );
  }

  // Show job search survey step
  if (currentStep === 'job-search-survey') {
    return (
      <JobSearchSurveyStep
        isOpen={true}
        onClose={onClose}
        onBack={() => setCurrentStep('job-search-downsell')}
        onAcceptOffer={handleJobSearchSurveyAcceptOffer}
        onComplete={handleJobSearchSurveyComplete}
      />
    );
  }

  // Show subscription continued step
  if (currentStep === 'subscription-continued') {
    return (
      <SubscriptionContinuedStep
        isOpen={true}
        onClose={onClose}
        onFinish={handleSubscriptionContinuedFinish}
      />
    );
  }

  // Show job search downsell step
  if (currentStep === 'job-search-downsell') {
    return (
      <JobSearchDownsellStep
        isOpen={true}
        onClose={onClose}
        onBack={() => setCurrentStep('initial')}
        onAcceptOffer={handleJobSearchDownsellAccept}
        onDeclineOffer={handleJobSearchDownsellDecline}
      />
    );
  }

  // Show yes-lawyer completion step
  if (currentStep === 'yes-lawyer-completion') {
    return (
      <YesLawyerCompletionStep
        isOpen={true}
        onClose={onClose}
        onFinish={handleYesLawyerCompletionFinish}
      />
    );
  }

  // Show completion step
  if (currentStep === 'completion') {
    return (
      <CompletionStep
        isOpen={true}
        onClose={onClose}
        onFinish={handleCompletionFinish}
      />
    );
  }

  // Show visa offer step (only if they found job with Migrate Mate)
  if (currentStep === 'visa-offer') {
    return (
      <VisaOfferStep
        isOpen={true}
        onClose={onClose}
        onBack={() => setCurrentStep('feedback')}
        onComplete={handleVisaOfferComplete}
      />
    );
  }

  // Show downsell offer step (if they found job but NOT with Migrate Mate)
  if (currentStep === 'downsell-offer') {
    return (
      <DownsellOfferStep
        isOpen={true}
        onClose={onClose}
        onBack={() => setCurrentStep('feedback')}
        onComplete={handleDownsellOfferComplete}
      />
    );
  }

  // Show feedback step
  if (currentStep === 'feedback') {
    const handleFeedbackBack = () => {
      if (userFoundJob) {
        // If they found a job, go back to survey
        setCurrentStep('survey');
      } else {
        // If they didn't find a job, go back to initial
        setCurrentStep('initial');
      }
    };

    // Determine step number based on flow
    let stepNumber: number;
    let stepText: string;
    
    if (userFoundJob && foundWithMigrateMate) {
      // Path: Initial → Survey → Feedback → Visa Offer (step 3 of 4) 
      stepNumber = 3;
      stepText = "Step 3 of 4";
    } else if (userFoundJob && !foundWithMigrateMate) {
      // Path: Initial → Survey → Feedback → Downsell Offer (step 3 of 4)
      stepNumber = 3;
      stepText = "Step 3 of 4";
    } else if (userFoundJob) {
      // Path: Initial → Survey → Feedback (step 3 of 3) - fallback
      stepNumber = 3;
      stepText = "Step 3 of 3";
    } else {
      // Path: Initial → Feedback (step 2 of 2)
      stepNumber = 2;
      stepText = "Step 2 of 2";
    }

    return (
      <FeedbackStep
        isOpen={true}
        onClose={onClose}
        onBack={handleFeedbackBack}
        onContinue={handleFeedbackSubmit}
        stepNumber={stepNumber}
        stepText={stepText}
      />
    );
  }

  // Show survey if user said they found a job
  if (currentStep === 'survey') {
    return (
      <CongratsSurvey
        isOpen={true}
        onClose={onClose}
        onBack={handleBackToInitial}
        onContinue={handleSurveyComplete}
      />
    );
  }

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Subscription Cancellation"
    >
      {/* Desktop Content */}
      <div className="hidden md:flex flex-col gap-4 lg:gap-6">
        {/* Heading */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <div className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#41403d] leading-tight">
            <p className="mb-0">Hey mate,</p>
            <p>Quick one before you go.</p>
          </div>
          <div className="text-2xl lg:text-3xl xl:text-4xl font-semibold italic text-[#41403d] leading-tight">
            <p>Have you found a job yet?</p>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm lg:text-base font-semibold text-[#62605c] leading-relaxed max-w-md">
          Whatever your answer, we just want to help you take the next step. 
          With visa support, or by hearing how we can do better.
        </p>
        
        {/* Divider line */}
        <div className="w-full h-px bg-gray-200" />
        
        {/* Buttons */}
        <div className="flex flex-col gap-3 lg:gap-4 w-full">
          <button
            onClick={() => handleJobResponse(true)}
            className="h-10 lg:h-12 w-full rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <span className="text-sm lg:text-base font-semibold text-[#62605c]">
              Yes, I&apos;ve found a job
            </span>
          </button>
          
          <button
            onClick={() => handleJobResponse(false)}
            className="h-10 lg:h-12 w-full rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <span className="text-sm lg:text-base font-semibold text-[#62605c]">
              Not yet - I&apos;m still looking
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden flex flex-col h-full">
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Image */}
          <div className="w-full h-32 sm:h-40 relative rounded-lg overflow-hidden shadow-lg mb-4 sm:mb-6">
            <img 
              src="/skyline.png" 
              alt="City skyline"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 rounded-lg border-t-2 border-white/30" />
            <div className="absolute inset-0 shadow-inner" />
          </div>
          
          {/* Content */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Heading */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="text-xl sm:text-2xl font-semibold text-[#41403d] leading-tight">
                <p className="mb-1 sm:mb-2">Hey mate,</p>
                <p>Quick one before you go.</p>
              </div>
              <div className="text-xl sm:text-2xl font-semibold italic text-[#41403d] leading-tight">
                <p>Have you found a job yet?</p>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm font-semibold text-[#62605c] leading-relaxed">
            Whatever your answer, we just want to help you take the next step. 
            With visa support, or by hearing how we can do better.
          </p>
        </div>
        
        {/* Buttons - Fixed at bottom with safe area */}
        <div className="bg-white border-t border-gray-100 pt-4 pb-safe flex flex-col gap-3 px-4 sm:px-6">
          <button
            onClick={() => handleJobResponse(true)}
            className="h-12 w-full rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center"
          >
            <span className="text-base font-semibold text-[#62605c]">
              Yes, I&apos;ve found a job
            </span>
          </button>
          
          <button
            onClick={() => handleJobResponse(false)}
            className="h-12 w-full rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center"
          >
            <span className="text-base font-semibold text-[#62605c]">
              Not yet - I&apos;m still looking
            </span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
}