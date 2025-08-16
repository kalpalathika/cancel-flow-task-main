'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';
import { validateFeedback, logSecurityEvent } from '../lib/validation';

interface FeedbackStepProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onContinue: (feedback: string) => void;
  stepNumber?: number;
  stepText?: string;
  defaultFeedback?: string;
}

export default function FeedbackStep({ isOpen, onClose, onBack, onContinue, stepNumber = 2, stepText = "Step 2 of 3", defaultFeedback = '' }: FeedbackStepProps) {
  const [feedback, setFeedback] = useState(defaultFeedback);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    try {
      const validatedFeedback = validateFeedback(feedback);
      setError('');
      onContinue(validatedFeedback);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid feedback input';
      setError(errorMessage);
      logSecurityEvent('feedback_validation_failed', undefined, { error: errorMessage, inputLength: feedback.length });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 2000) {
      setFeedback(value);
      if (error) setError(''); // Clear error when user starts typing
    }
  };

  const isValid = feedback.length >= 25 && feedback.length <= 2000;
  const characterCount = feedback.length;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}
      title="Subscription Cancellation"
      step={stepText}
      progress={stepNumber}
      showImage={true}
    >
      {/* Desktop Content */}
      <div className="hidden md:flex flex-col gap-4 lg:gap-6">
        {/* Heading */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#41403d] leading-tight">
            What&apos;s one thing you wish we could&apos;ve helped you with?
          </h1>
        </div>
        
        {/* Description */}
        <p className="text-sm lg:text-base font-normal text-[#41403d] leading-relaxed max-w-md">
          We&apos;re always looking to improve, your thoughts can help us make Migrate Mate more useful for others.*
        </p>
        
        {/* Text Area */}
        <div className="w-full">
          <textarea
            value={feedback}
            onChange={handleInputChange}
            placeholder="Share your thoughts..."
            className={`w-full h-32 lg:h-40 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:border-transparent text-sm lg:text-base text-gray-900 placeholder:text-gray-500 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-[#62605c] focus:ring-[#4abf71]'
            }`}
            maxLength={2000}
            aria-describedby="feedback-help"
          />
          <div className="flex justify-between items-center mt-2">
            {error && (
              <span className="text-xs text-red-500">
                {error}
              </span>
            )}
            <span className={`text-xs ml-auto ${characterCount >= 25 ? 'text-green-600' : 'text-[#62605c]'}`}>
              Min 25 characters ({characterCount}/2000)
            </span>
          </div>
        </div>
        
        {/* Divider line */}
        <div className="w-full h-px bg-gray-200" />
        
        {/* Continue Button */}
        <div className="flex flex-col gap-3 lg:gap-4 w-full">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`h-10 lg:h-12 w-full rounded-lg transition-colors flex items-center justify-center ${
              isValid 
                ? 'bg-[#4abf71] text-white hover:bg-[#3ea863]' 
                : 'bg-[#e6e6e6] text-[#b5b3af] cursor-not-allowed'
            }`}
          >
            <span className="text-sm lg:text-base font-semibold">
              Continue
            </span>
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
          {/* Content */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Heading */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#41403d] leading-tight">
                What&apos;s one thing you wish we could&apos;ve helped you with?
              </h1>
              
              {/* Divider line for mobile */}
              <div className="w-full h-px bg-gray-200" />
            </div>
            
            {/* Description */}
            <p className="text-sm font-semibold text-[#41403d] leading-relaxed">
              We&apos;re always looking to improve, your thoughts can help us make Migrate Mate more useful for others.*
            </p>
            
            {/* Text Area */}
            <div className="w-full">
              <textarea
                value={feedback}
                onChange={handleInputChange}
                placeholder="Share your thoughts..."
                className={`w-full h-32 sm:h-40 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-500 ${
                  error ? 'border-red-500 focus:ring-red-500' : 'border-[#62605c] focus:ring-[#4abf71]'
                }`}
                maxLength={2000}
                aria-describedby="feedback-help"
              />
              <div className="flex justify-between items-center mt-2">
                {error && (
                  <span className="text-xs text-red-500">
                    {error}
                  </span>
                )}
                <span className={`text-xs ml-auto ${characterCount >= 25 ? 'text-green-600' : 'text-[#62605c]'}`}>
                  Min 25 characters ({characterCount}/2000)
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Continue Button - Fixed at bottom with safe area */}
        <div className="bg-white border-t border-gray-100 pt-4 pb-safe px-4 sm:px-6">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`h-12 w-full rounded-lg transition-colors flex items-center justify-center ${
              isValid 
                ? 'bg-[#4abf71] text-white hover:bg-[#3ea863] active:bg-[#359558]' 
                : 'bg-[#e6e6e6] text-[#b5b3af] cursor-not-allowed'
            }`}
          >
            <span className="text-base font-semibold">
              Continue
            </span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
}