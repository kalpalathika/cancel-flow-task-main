'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';
import CongratsSurvey from './CongratsSurvey';
import FeedbackStep from './FeedbackStep';
import VisaOfferStep from './VisaOfferStep';
import DownsellOfferStep from './DownsellOfferStep';
import CompletionStep from './CompletionStep';
import YesLawyerCompletionStep from './YesLawyerCompletionStep';

interface CancellationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onJobFoundResponse: (foundJob: boolean) => void;
}

type FlowStep = 'initial' | 'feedback' | 'survey' | 'visa-offer' | 'downsell-offer' | 'completion' | 'yes-lawyer-completion';

export default function CancellationFlow({ isOpen, onClose, onJobFoundResponse }: CancellationFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('initial');
  const [userFoundJob, setUserFoundJob] = useState<boolean>(false);
  const [foundWithMigrateMate, setFoundWithMigrateMate] = useState<boolean>(false);

  if (!isOpen) {
    // Reset flow when modal closes
    if (currentStep !== 'initial') {
      setCurrentStep('initial');
    }
    return null;
  }

  const handleJobResponse = (foundJob: boolean) => {
    setUserFoundJob(foundJob);
    if (foundJob) {
      // If they found a job, go to congrats survey first
      setCurrentStep('survey');
    } else {
      // If they didn't find a job, go directly to feedback
      setCurrentStep('feedback');
    }
  };

  const handleSurveyComplete = (responses: Record<string, unknown>) => {
    console.log('Survey responses:', responses);
    const foundJobWithMM = responses.foundWithMigrateMate as boolean;
    setFoundWithMigrateMate(foundJobWithMM);
    
    // Always go to feedback step after survey, regardless of MM response
    setCurrentStep('feedback');
  };

  const handleBackToInitial = () => {
    setCurrentStep('initial');
  };

  const handleFeedbackSubmit = (feedback: string) => {
    console.log('Feedback submitted:', feedback);
    
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

  const handleVisaOfferComplete = (hasLawyer: boolean, visaType?: string) => {
    console.log('Visa offer response:', hasLawyer, 'Visa type:', visaType);
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

  const handleCompletionFinish = () => {
    // Complete the cancellation flow
    onJobFoundResponse(true);
  };

  const handleYesLawyerCompletionFinish = () => {
    // Complete the cancellation flow
    onJobFoundResponse(true);
  };

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