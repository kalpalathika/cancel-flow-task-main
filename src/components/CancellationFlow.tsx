'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface FlowData {
  jobFound?: boolean;
  foundWithMigrateMate?: boolean;
  feedbackText?: string;
  visaType?: string;
  hasLawyer?: boolean;
  acceptedDownsell?: boolean;
  cancellationReason?: string;
  cancellationReasonDetails?: string;
  // Survey-specific fields
  rolesApplied?: string;
  companiesEmailed?: string;
  companiesInterviewed?: string;
}

export default function CancellationFlow({ isOpen, onClose, onJobFoundResponse }: CancellationFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('initial');
  const [cancellationSession, setCancellationSession] = useState<CancellationSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [flowData, setFlowData] = useState<FlowData>({});

  const userId = '550e8400-e29b-41d4-a716-446655440001';

  const initializeCancellation = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await cancellationService.initializeCancellation(userId);
      
      if (result.success && result.data) {
        setCancellationSession(result.data);
        
      } else {
        setError(result.error?.message || 'Failed to initialize cancellation');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Cancellation initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && !cancellationSession && !isLoading && !error) {
      initializeCancellation();
    }
  }, [isOpen, cancellationSession, isLoading, error, initializeCancellation]);

  const updateFlowData = (updates: Partial<FlowData>) => {
    setFlowData(prev => ({ ...prev, ...updates }));
  };

  const persistFinalData = async (outcome: 'cancelled' | 'continued' | 'downsell_accepted' | 'pending-cancellation') => {
    if (cancellationSession?.id) {
      await cancellationService.finalizeCancellation(
        cancellationSession.id,
        userId,
        outcome,
        flowData
      );
    }
  };

  if (!isOpen) {
    if (currentStep !== 'initial') {
      setCurrentStep('initial');
      setCancellationSession(null);
      setFlowData({});
      setError('');
    }
    return null;
  }

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

  const handleJobResponse = (foundJob: boolean) => {
    console.log('Job response:', foundJob);
    updateFlowData({ jobFound: foundJob });
    
    if (foundJob) {
      setCurrentStep('survey');
    } else {
      if (cancellationSession?.variant === 'B') {
        setCurrentStep('job-search-downsell');
      } else {
        setCurrentStep('job-search-survey');
      }
    }
  };

  const handleSurveyComplete = (responses: Record<string, unknown>) => {
    console.log('Survey responses:', responses);
    updateFlowData({ 
      foundWithMigrateMate: responses.foundWithMigrateMate as boolean,
      rolesApplied: responses.rolesApplied as string,
      companiesEmailed: responses.companiesEmailed as string,
      companiesInterviewed: responses.companiesInterviewed as string
    });
    
    setCurrentStep('feedback');
  };

  const handleFeedbackSubmit = (feedback: string) => {
    console.log('Feedback submitted:', feedback);
    updateFlowData({ feedbackText: feedback });
    
    if (flowData.foundWithMigrateMate) {
      setCurrentStep('visa-offer');
    } else {
      setCurrentStep('downsell-offer');
    }
  };

  const handleVisaOfferComplete = (hasLawyer: boolean, visaType?: string) => {
    console.log('Visa offer response:', hasLawyer, 'Visa type:', visaType);
    updateFlowData({ hasLawyer, visaType });
    
    if (hasLawyer) {
      setCurrentStep('yes-lawyer-completion');
    } else {
      setCurrentStep('completion');
    }
  };

  const handleDownsellOfferComplete = (hasLawyer: boolean, visaType?: string) => {
    console.log('Downsell offer response:', hasLawyer, 'Visa type:', visaType);
    updateFlowData({ hasLawyer, visaType });
    
    if (hasLawyer) {
      setCurrentStep('yes-lawyer-completion');
    } else {
      setCurrentStep('completion');
    }
  };

  const handleCompletionFinish = async () => {
    await persistFinalData('pending-cancellation');
    onJobFoundResponse(true);
  };

  const handleYesLawyerCompletionFinish = async () => {
    await persistFinalData('pending-cancellation');
    onJobFoundResponse(true);
  };

  const handleJobSearchDownsellAccept = () => {
    updateFlowData({ acceptedDownsell: true });
    setCurrentStep('subscription-continued');
  };

  const handleJobSearchDownsellDecline = () => {
    updateFlowData({ acceptedDownsell: false });
    setCurrentStep('job-search-survey');
  };

  const handleSubscriptionContinuedFinish = async () => {
    await persistFinalData('downsell_accepted');
    setCurrentStep('job-search-survey');
  };

  const handleJobSearchSurveyAcceptOffer = () => {
    updateFlowData({ acceptedDownsell: true });
    setCurrentStep('subscription-continued');
  };

  const handleJobSearchSurveyComplete = () => {
    setCurrentStep('cancellation-reason');
  };

  const handleCancellationReasonAcceptOffer = () => {
    updateFlowData({ acceptedDownsell: true });
    setCurrentStep('subscription-continued');
  };

  const handleCancellationReasonComplete = (reason?: string, details?: string) => {
    updateFlowData({ 
      cancellationReason: reason,
      cancellationReasonDetails: details 
    });
    setCurrentStep('final-cancellation');
  };

  const handleFinalCancellationBackToJobs = async () => {
    onJobFoundResponse(false);
  };

  const handleCompleteCancellation = async () => {
    await persistFinalData('pending-cancellation');
    setCurrentStep('final-cancellation');
  };

  const updateVisaData = (hasLawyer: boolean, visaType?: string) => {
    updateFlowData({ hasLawyer, visaType });
  };

  if (currentStep === 'final-cancellation') {
    return (
      <FinalCancellationStep
        isOpen={true}
        onClose={onClose}
        onBackToJobs={handleFinalCancellationBackToJobs}
      />
    );
  }

  if (currentStep === 'cancellation-reason') {
    return (
      <CancellationReasonStep
        isOpen={true}
        onClose={onClose}
        onBack={() => setCurrentStep('job-search-survey')}
        onAcceptOffer={handleCancellationReasonAcceptOffer}
        onComplete={handleCancellationReasonComplete}
        defaultReason={flowData.cancellationReason}
        defaultDetails={flowData.cancellationReasonDetails}
      />
    );
  }

  if (currentStep === 'job-search-survey') {
    return (
      <JobSearchSurveyStep
        isOpen={true}
        onClose={onClose}
        onBack={() => {
          if (cancellationSession?.variant === 'B') {
            setCurrentStep('job-search-downsell');
          } else {
            setCurrentStep('initial');
          }
        }}
        onAcceptOffer={handleJobSearchSurveyAcceptOffer}
        onComplete={handleJobSearchSurveyComplete}
        onCompleteCancellation={handleCompleteCancellation}
        variant={cancellationSession?.variant}
      />
    );
  }

  if (currentStep === 'subscription-continued') {
    return (
      <SubscriptionContinuedStep
        isOpen={true}
        onClose={onClose}
        onFinish={handleSubscriptionContinuedFinish}
      />
    );
  }

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

  if (currentStep === 'yes-lawyer-completion') {
    return (
      <YesLawyerCompletionStep
        isOpen={true}
        onClose={onClose}
        onFinish={handleYesLawyerCompletionFinish}
      />
    );
  }

  if (currentStep === 'completion') {
    return (
      <CompletionStep
        isOpen={true}
        onClose={onClose}
        onFinish={handleCompletionFinish}
      />
    );
  }

  if (currentStep === 'visa-offer') {
    return (
      <VisaOfferStep
        isOpen={true}
        onClose={onClose}
        onBack={() => setCurrentStep('feedback')}
        onComplete={handleVisaOfferComplete}
        onCompleteCancellation={handleCompleteCancellation}
        onUpdateData={updateVisaData}
        defaultHasLawyer={flowData.hasLawyer}
        defaultVisaType={flowData.visaType}
      />
    );
  }

  if (currentStep === 'downsell-offer') {
    return (
      <DownsellOfferStep
        isOpen={true}
        onClose={onClose}
        onBack={() => setCurrentStep('feedback')}
        onComplete={handleDownsellOfferComplete}
        onCompleteCancellation={handleCompleteCancellation}
        onUpdateData={updateVisaData}
        defaultHasLawyer={flowData.hasLawyer}
        defaultVisaType={flowData.visaType}
      />
    );
  }

  if (currentStep === 'feedback') {
    const handleFeedbackBack = () => {
      setCurrentStep('survey');
    };

    return (
      <FeedbackStep
        isOpen={true}
        onClose={onClose}
        onBack={handleFeedbackBack}
        onContinue={handleFeedbackSubmit}
        stepNumber={3}
        stepText="Step 3 of 4"
        defaultFeedback={flowData.feedbackText}
      />
    );
  }

  if (currentStep === 'survey') {
    return (
      <CongratsSurvey
        isOpen={true}
        onClose={onClose}
        onBack={() => setCurrentStep('initial')}
        onContinue={handleSurveyComplete}
        defaultResponses={{
          foundWithMigrateMate: flowData.foundWithMigrateMate,
          rolesApplied: flowData.rolesApplied,
          companiesEmailed: flowData.companiesEmailed,
          companiesInterviewed: flowData.companiesInterviewed
        }}
      />
    );
  }

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Subscription Cancellation"
    >
      <div className="hidden md:flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col gap-3 lg:gap-4">
          <div className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#41403d] leading-tight">
            <p className="mb-0">Hey mate,</p>
            <p>Quick one before you go.</p>
          </div>
          <div className="text-2xl lg:text-3xl xl:text-4xl font-semibold italic text-[#41403d] leading-tight">
            <p>Have you found a job yet?</p>
          </div>
        </div>
        
        <p className="text-sm lg:text-base font-semibold text-[#62605c] leading-relaxed max-w-md">
          Whatever your answer, we just want to help you take the next step. 
          With visa support, or by hearing how we can do better.
        </p>
        
        <div className="w-full h-px bg-gray-200" />
        
        <div className="flex flex-col gap-3 lg:gap-4 w-full">
          <button
            onClick={() => handleJobResponse(true)}
            className={`h-10 lg:h-12 w-full rounded-lg border-2 transition-colors flex items-center justify-center ${
              flowData.jobFound === true
                ? 'border-[#8952fc] bg-[#8952fc] text-white'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <span className={`text-sm lg:text-base font-semibold ${
              flowData.jobFound === true ? 'text-white' : 'text-[#62605c]'
            }`}>
              Yes, I&apos;ve found a job
            </span>
          </button>
          
          <button
            onClick={() => handleJobResponse(false)}
            className={`h-10 lg:h-12 w-full rounded-lg border-2 transition-colors flex items-center justify-center ${
              flowData.jobFound === false
                ? 'border-[#8952fc] bg-[#8952fc] text-white'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <span className={`text-sm lg:text-base font-semibold ${
              flowData.jobFound === false ? 'text-white' : 'text-[#62605c]'
            }`}>
              Not yet - I&apos;m still looking
            </span>
          </button>
        </div>
      </div>

      <div className="md:hidden flex flex-col h-full">
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="w-full h-32 sm:h-40 relative rounded-lg overflow-hidden shadow-lg mb-4 sm:mb-6">
            <img 
              src="/skyline.png" 
              alt="City skyline"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 rounded-lg border-t-2 border-white/30" />
            <div className="absolute inset-0 shadow-inner" />
          </div>
          
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
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
          
          <p className="text-sm font-semibold text-[#62605c] leading-relaxed">
            Whatever your answer, we just want to help you take the next step. 
            With visa support, or by hearing how we can do better.
          </p>
        </div>
        
        <div className="bg-white border-t border-gray-100 pt-4 pb-safe flex flex-col gap-3 px-4 sm:px-6">
          <button
            onClick={() => handleJobResponse(true)}
            className={`h-12 w-full rounded-lg border-2 transition-colors flex items-center justify-center ${
              flowData.jobFound === true
                ? 'border-[#8952fc] bg-[#8952fc] text-white'
                : 'border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            <span className={`text-base font-semibold ${
              flowData.jobFound === true ? 'text-white' : 'text-[#62605c]'
            }`}>
              Yes, I&apos;ve found a job
            </span>
          </button>
          
          <button
            onClick={() => handleJobResponse(false)}
            className={`h-12 w-full rounded-lg border-2 transition-colors flex items-center justify-center ${
              flowData.jobFound === false
                ? 'border-[#8952fc] bg-[#8952fc] text-white'
                : 'border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            <span className={`text-base font-semibold ${
              flowData.jobFound === false ? 'text-white' : 'text-[#62605c]'
            }`}>
              Not yet - I&apos;m still looking
            </span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
}