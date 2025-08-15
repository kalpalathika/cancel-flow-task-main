'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';

interface JobSearchSurveyStepProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onAcceptOffer: () => void;
  onComplete: () => void;
  showWarningState?: boolean;
}

interface SurveyResponses {
  rolesApplied: string | null;
  companiesEmailed: string | null;
  companiesInterviewed: string | null;
}

export default function JobSearchSurveyStep({ 
  isOpen, 
  onClose, 
  onBack, 
  onAcceptOffer, 
  onComplete,
  showWarningState = false
}: JobSearchSurveyStepProps) {
  const [responses, setResponses] = useState<SurveyResponses>({
    rolesApplied: null,
    companiesEmailed: null,
    companiesInterviewed: null
  });

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const isComplete = responses.rolesApplied !== null && 
                    responses.companiesEmailed !== null && 
                    responses.companiesInterviewed !== null;

  const handleContinue = () => {
    setHasAttemptedSubmit(true);
    if (isComplete) {
      onComplete();
    }
  };

  const showWarning = showWarningState || (!isComplete && hasAttemptedSubmit);

  const OptionButton = ({ 
    value, 
    isSelected, 
    onClick 
  }: { 
    value: string; 
    isSelected: boolean; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`
        flex-1 h-8 lg:h-10 px-3 lg:px-4 py-2 lg:py-3 rounded text-sm font-normal text-center transition-colors
        ${isSelected 
          ? 'bg-[#8952fc] text-white' 
          : 'bg-[#f6f6f6] text-[#62605c] hover:bg-gray-200'
        }
      `}
    >
      {value}
    </button>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}
      title="Subscription Cancellation"
      step="Step 2 of 3"
      progress={2}
      showImage={true}
    >
      {/* Desktop Content */}
      <div className="hidden md:flex flex-col gap-4 lg:gap-6">
        {/* Title */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#41403d] leading-tight">
            Help us understand how you were using Migrate Mate.
          </h1>
        </div>

        {/* Warning message */}
        {showWarning && (
          <div className="flex flex-col gap-2">
            <p className="text-sm lg:text-base font-normal text-red-600 leading-relaxed">
              Mind letting us know why you&apos;re cancelling?
            </p>
            <p className="text-sm lg:text-base font-normal text-red-600 leading-relaxed">
              It helps us understand your experience and improve the platform.*
            </p>
          </div>
        )}

        {/* Questions */}
        <div className="flex flex-col gap-6 lg:gap-8">
          {/* Question 1 */}
          <div className="flex flex-col gap-3 lg:gap-4">
            <h3 className="text-sm lg:text-base font-normal text-[#41403d]">
              How many roles did you apply for through Migrate Mate?{showWarning && '*'}
            </h3>
            <div className="flex gap-2">
              {['0', '1 - 5', '6 - 20', '20+'].map((option) => (
                <OptionButton
                  key={option}
                  value={option}
                  isSelected={responses.rolesApplied === option}
                  onClick={() => setResponses(prev => ({ ...prev, rolesApplied: option }))}
                />
              ))}
            </div>
          </div>

          {/* Question 2 */}
          <div className="flex flex-col gap-3 lg:gap-4">
            <h3 className="text-sm lg:text-base font-normal text-[#41403d]">
              How many companies did you <span className="underline">email</span> directly?
            </h3>
            <div className="flex gap-2">
              {['0', '1-5', '6-20', '20+'].map((option) => (
                <OptionButton
                  key={option}
                  value={option}
                  isSelected={responses.companiesEmailed === option}
                  onClick={() => setResponses(prev => ({ ...prev, companiesEmailed: option }))}
                />
              ))}
            </div>
          </div>

          {/* Question 3 */}
          <div className="flex flex-col gap-3 lg:gap-4">
            <h3 className="text-sm lg:text-base font-normal text-[#41403d]">
              How many different companies did you <span className="underline">interview</span> with?
            </h3>
            <div className="flex gap-2">
              {['0', '1-2', '3-5', '5+'].map((option) => (
                <OptionButton
                  key={option}
                  value={option}
                  isSelected={responses.companiesInterviewed === option}
                  onClick={() => setResponses(prev => ({ ...prev, companiesInterviewed: option }))}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200" />

        {/* Buttons */}
        <div className="flex flex-col gap-3 lg:gap-4 w-full">
          <button
            onClick={onAcceptOffer}
            className="h-10 lg:h-12 w-full rounded-lg bg-[#4abf71] text-white hover:bg-[#3ea863] transition-colors flex items-center justify-center"
          >
            <span className="text-sm lg:text-base font-semibold">
              Get 50% off | $12.50 <span className="line-through">$25</span>
            </span>
          </button>
          
          <button
            onClick={handleContinue}
            className={`h-10 lg:h-12 w-full rounded-lg font-semibold text-sm lg:text-base transition-colors ${
              showWarning && isComplete
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-[#e6e6e6] text-[#b5b3af] hover:bg-gray-300'
            }`}
          >
            {showWarning && isComplete ? 'Complete cancellation' : 'Continue'}
          </button>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden flex flex-col h-full">
        {/* Back button for mobile */}
        <div className="p-4 pb-0">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#62605c] hover:opacity-70 transition-opacity"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-semibold">Back</span>
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-semibold text-[#41403d] leading-tight mb-4">
            {showWarning ? "What's the main reason for cancelling?" : "Help us understand how you were using Migrate Mate."}
          </h1>

          {/* Warning message */}
          {showWarning && (
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-sm font-normal text-red-600 leading-relaxed">
                Mind letting us know why you&apos;re cancelling?
              </p>
              <p className="text-sm font-normal text-red-600 leading-relaxed">
                It helps us understand your experience and improve the platform.*
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 mb-6" />

          {/* Questions */}
          <div className="flex flex-col gap-6">
            {/* Question 1 */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-normal text-[#41403d]">
                How many roles did you apply for through Migrate Mate?{showWarning && '*'}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['0', '1 - 5', '6 - 20', '20+'].map((option) => (
                  <OptionButton
                    key={option}
                    value={option}
                    isSelected={responses.rolesApplied === option}
                    onClick={() => setResponses(prev => ({ ...prev, rolesApplied: option }))}
                  />
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-normal text-[#41403d]">
                How many companies did you <span className="underline">email</span> directly?
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['0', '1-5', '6-20', '20+'].map((option) => (
                  <OptionButton
                    key={option}
                    value={option}
                    isSelected={responses.companiesEmailed === option}
                    onClick={() => setResponses(prev => ({ ...prev, companiesEmailed: option }))}
                  />
                ))}
              </div>
            </div>

            {/* Question 3 (only show if not in warning state on mobile to save space) */}
            {!showWarning && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-normal text-[#41403d]">
                  How many different companies did you <span className="underline">interview</span> with?
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['0', '1-2', '3-5', '5+'].map((option) => (
                    <OptionButton
                      key={option}
                      value={option}
                      isSelected={responses.companiesInterviewed === option}
                      onClick={() => setResponses(prev => ({ ...prev, companiesInterviewed: option }))}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Buttons - Fixed at bottom with safe area */}
        <div className="bg-white border-t border-gray-100 pt-4 pb-safe flex flex-col gap-3 px-4 sm:px-6">
          <button
            onClick={onAcceptOffer}
            className="h-12 w-full rounded-lg bg-[#4abf71] text-white hover:bg-[#3ea863] active:bg-[#359558] transition-colors flex items-center justify-center"
          >
            <span className="text-base font-semibold">
              Get 50% off | $12.50 <span className="line-through">$25</span>
            </span>
          </button>
          
          <button
            onClick={handleContinue}
            className={`h-12 w-full rounded-lg font-semibold text-base transition-colors ${
              showWarning && isComplete
                ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
                : 'bg-[#e6e6e6] text-[#b5b3af] hover:bg-gray-300'
            }`}
          >
            {showWarning && isComplete ? 'Complete cancellation' : 'Continue'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}