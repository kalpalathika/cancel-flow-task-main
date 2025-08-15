'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';
import { validateCancellationReason, logSecurityEvent } from '../lib/validation';

interface CancellationReasonStepProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onAcceptOffer: () => void;
  onComplete: () => void;
}

type CancellationReason = 'too-expensive' | 'platform-not-helpful' | 'not-enough-jobs' | 'decided-not-to-move' | 'other';

export default function CancellationReasonStep({ 
  isOpen, 
  onClose, 
  onBack, 
  onAcceptOffer, 
  onComplete 
}: CancellationReasonStepProps) {
  const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [textFeedback, setTextFeedback] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [error, setError] = useState('');

  const showWarning = !selectedReason && hasAttemptedSubmit;
  const showPriceInput = selectedReason === 'too-expensive';
  const showTextArea = selectedReason && selectedReason !== 'too-expensive';
  const textAreaValid = textFeedback.trim().length >= 25;
  const showTextAreaWarning = showTextArea && !textAreaValid && hasAttemptedSubmit;

  const canComplete = selectedReason && 
    (!showPriceInput || priceInput.trim()) && 
    (!showTextArea || textAreaValid);

  const getTextAreaQuestion = (reason: CancellationReason | null) => {
    switch (reason) {
      case 'platform-not-helpful':
        return 'What can we change to make the platform more helpful?*';
      case 'not-enough-jobs':
        return 'In which way can we make the jobs more relevant?*';
      case 'decided-not-to-move':
        return 'What changed for you to decide to not move?*';
      case 'other':
        return 'What would have helped you the most?*';
      default:
        return '';
    }
  };

  const handleContinue = () => {
    setHasAttemptedSubmit(true);
    if (canComplete && selectedReason) {
      try {
        const reasonMap: Record<CancellationReason, string> = {
          'too-expensive': 'Too expensive',
          'platform-not-helpful': 'Platform not helpful', 
          'not-enough-jobs': 'Not enough relevant jobs',
          'decided-not-to-move': 'Decided not to move',
          'other': 'Other'
        };
        
        const details = showTextArea ? textFeedback : (showPriceInput ? priceInput : undefined);
        validateCancellationReason(reasonMap[selectedReason], details);
        
        setError('');
        onComplete();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Invalid input';
        setError(errorMessage);
        logSecurityEvent('cancellation_reason_validation_failed', undefined, { 
          error: errorMessage, 
          reason: selectedReason,
          detailsLength: textFeedback.length 
        });
      }
    }
  };


  const radioOptions = [
    { id: 'too-expensive', label: 'Too expensive' },
    { id: 'platform-not-helpful', label: 'Platform not helpful' },
    { id: 'not-enough-jobs', label: 'Not enough relevant jobs' },
    { id: 'decided-not-to-move', label: 'Decided not to move' },
    { id: 'other', label: 'Other' }
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}
      title="Subscription Cancellation"
      step="Step 3 of 3"
      progress={3}
      showImage={true}
    >
      {/* Desktop Content */}
      <div className="hidden md:flex flex-col gap-4 lg:gap-6">
        {/* Title */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#41403d] leading-tight">
            What&apos;s the main reason for cancelling?
          </h1>
          <p className="text-sm lg:text-base font-normal text-[#62605c] leading-relaxed">
            Please take a minute to let us know why:
          </p>
        </div>

        {/* Warning message */}
        {(showWarning || error) && (
          <div className="flex flex-col gap-2">
            {showWarning && (
              <p className="text-sm lg:text-base font-normal text-red-600 leading-relaxed">
                To help us understand your experience, please select a reason for cancelling*
              </p>
            )}
            {error && (
              <p className="text-sm lg:text-base font-normal text-red-600 leading-relaxed">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Radio Options with inline inputs */}
        <div className="flex flex-col gap-3 lg:gap-4">
          {radioOptions.map((option) => (
            <div key={option.id} className="flex flex-col gap-3 lg:gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="cancellation-reason"
                  value={option.id}
                  checked={selectedReason === option.id}
                  onChange={() => {
                    setSelectedReason(option.id as CancellationReason);
                    // Reset inputs when changing selection
                    setPriceInput('');
                    setTextFeedback('');
                  }}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedReason === option.id 
                    ? 'border-[#41403d] bg-[#41403d]' 
                    : 'border-[#62605c] group-hover:border-[#41403d]'
                }`}>
                  {selectedReason === option.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-sm lg:text-base font-normal text-[#41403d] group-hover:text-[#41403d] transition-colors">
                  {option.label}
                </span>
              </label>

              {/* Price Input for "Too expensive" */}
              {selectedReason === option.id && option.id === 'too-expensive' && (
                <div className="flex flex-col gap-3 lg:gap-4 ml-8">
                  <p className="text-sm lg:text-base font-normal text-[#41403d] leading-relaxed">
                    What would be the maximum you would be willing to pay?*
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm lg:text-base text-[#62605c]">
                      $
                    </span>
                    <input
                      type="text"
                      value={priceInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 50) {
                          setPriceInput(value);
                          if (error) setError('');
                        }
                      }}
                      placeholder=""
                      maxLength={50}
                      className={`w-full h-10 lg:h-12 pl-8 pr-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm lg:text-base ${
                        error ? 'border-red-500 focus:ring-red-500' : 'border-[#62605c] focus:ring-[#4abf71]'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Text Area for other options */}
              {selectedReason === option.id && option.id !== 'too-expensive' && (
                <div className="flex flex-col gap-3 lg:gap-4 ml-8">
                  <p className="text-sm lg:text-base font-normal text-[#41403d] leading-relaxed">
                    {getTextAreaQuestion(selectedReason)}
                  </p>
                  {showTextAreaWarning && (
                    <p className="text-sm lg:text-base font-normal text-red-600 leading-relaxed">
                      Please enter at least 25 characters so we can understand your feedback.*
                    </p>
                  )}
                  <textarea
                    value={textFeedback}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 500) {
                        setTextFeedback(value);
                        if (error) setError('');
                      }
                    }}
                    placeholder=""
                    rows={4}
                    maxLength={500}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm lg:text-base resize-none ${
                      error ? 'border-red-500 focus:ring-red-500' : 'border-[#62605c] focus:ring-[#4abf71]'
                    }`}
                  />
                  <p className="text-xs text-[#62605c]">
                    Min 25 characters ({textFeedback.length}/25)
                  </p>
                </div>
              )}
            </div>
          ))}
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
              canComplete
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-[#e6e6e6] text-[#b5b3af] cursor-not-allowed'
            }`}
            disabled={!canComplete}
          >
            Complete cancellation
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
          <h1 className="text-xl sm:text-2xl font-semibold text-[#41403d] leading-tight mb-2">
            What&apos;s the main reason for cancelling?
          </h1>
          <p className="text-sm font-normal text-[#62605c] leading-relaxed mb-4">
            Please take a minute to let us know why:
          </p>

          {/* Warning message */}
          {showWarning && (
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-sm font-normal text-red-600 leading-relaxed">
                To help us understand your experience, please select a reason for cancelling*
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 mb-6" />

          {/* Radio Options with inline inputs */}
          <div className="flex flex-col gap-3 mb-6">
            {radioOptions.map((option) => (
              <div key={option.id} className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group py-2">
                  <input
                    type="radio"
                    name="cancellation-reason"
                    value={option.id}
                    checked={selectedReason === option.id}
                    onChange={() => {
                      setSelectedReason(option.id as CancellationReason);
                      // Reset inputs when changing selection
                      setPriceInput('');
                      setTextFeedback('');
                    }}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedReason === option.id 
                      ? 'border-[#41403d] bg-[#41403d]' 
                      : 'border-[#62605c] group-hover:border-[#41403d]'
                  }`}>
                    {selectedReason === option.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm font-normal text-[#41403d] group-hover:text-[#41403d] transition-colors">
                    {option.label}
                  </span>
                </label>

                {/* Price Input for "Too expensive" */}
                {selectedReason === option.id && option.id === 'too-expensive' && (
                  <div className="flex flex-col gap-3 ml-8">
                    <p className="text-sm font-normal text-[#41403d] leading-relaxed">
                      What would be the maximum you would be willing to pay?*
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-[#62605c]">
                        $
                      </span>
                      <input
                        type="text"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        placeholder=""
                        className="w-full h-10 pl-8 pr-3 border border-[#62605c] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4abf71] focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Text Area for other options */}
                {selectedReason === option.id && option.id !== 'too-expensive' && (
                  <div className="flex flex-col gap-3 ml-8">
                    <p className="text-sm font-normal text-[#41403d] leading-relaxed">
                      {getTextAreaQuestion(selectedReason)}
                    </p>
                    {showTextAreaWarning && (
                      <p className="text-sm font-normal text-red-600 leading-relaxed">
                        Please enter at least 25 characters so we can understand your feedback.*
                      </p>
                    )}
                    <textarea
                      value={textFeedback}
                      onChange={(e) => setTextFeedback(e.target.value)}
                      placeholder=""
                      rows={4}
                      className="w-full p-3 border border-[#62605c] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4abf71] focus:border-transparent text-sm resize-none"
                    />
                    <p className="text-xs text-[#62605c]">
                      Min 25 characters ({textFeedback.length}/25)
                    </p>
                  </div>
                )}
              </div>
            ))}
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
              canComplete
                ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
                : 'bg-[#e6e6e6] text-[#b5b3af] cursor-not-allowed'
            }`}
            disabled={!canComplete}
          >
            Complete cancellation
          </button>
        </div>
      </div>
    </BaseModal>
  );
}