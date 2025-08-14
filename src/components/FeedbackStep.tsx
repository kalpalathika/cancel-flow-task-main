'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';

interface FeedbackStepProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onContinue: (feedback: string) => void;
  stepNumber?: number;
  stepText?: string;
}

export default function FeedbackStep({ isOpen, onClose, onBack, onContinue, stepNumber = 2, stepText = "Step 2 of 3" }: FeedbackStepProps) {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (feedback.length >= 25) {
      onContinue(feedback);
    }
  };

  const isValid = feedback.length >= 25;
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
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full h-32 lg:h-40 p-3 border border-[#62605c] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#4abf71] focus:border-transparent text-sm lg:text-base"
          />
          <div className="flex justify-end mt-2">
            <span className="text-xs text-[#62605c]">
              Min 25 characters ({characterCount}/25)
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
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full h-32 sm:h-40 p-3 border border-[#62605c] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#4abf71] focus:border-transparent text-sm"
              />
              <div className="flex justify-end mt-2">
                <span className="text-xs text-[#62605c]">
                  Min 25 characters ({characterCount}/25)
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