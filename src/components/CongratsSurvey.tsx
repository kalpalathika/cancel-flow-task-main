'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';

interface CongratsSurveyProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onContinue: (responses: SurveyResponses) => void;
  defaultResponses?: Partial<SurveyResponses>;
}

interface SurveyResponses {
  foundWithMigrateMate: boolean | null;
  rolesApplied: string | null;
  companiesEmailed: string | null;
  companiesInterviewed: string | null;
}

export default function CongratsSurvey({ isOpen, onClose, onBack, onContinue, defaultResponses = {} }: CongratsSurveyProps) {
  const [responses, setResponses] = useState<SurveyResponses>({
    foundWithMigrateMate: defaultResponses.foundWithMigrateMate ?? null,
    rolesApplied: defaultResponses.rolesApplied ?? null,
    companiesEmailed: defaultResponses.companiesEmailed ?? null,
    companiesInterviewed: defaultResponses.companiesInterviewed ?? null
  });

  const isComplete = responses.foundWithMigrateMate !== null && 
                    responses.rolesApplied !== null && 
                    responses.companiesEmailed !== null && 
                    responses.companiesInterviewed !== null;

  const handleContinue = () => {
    if (isComplete) {
      onContinue(responses);
    }
  };

  const OptionButton = ({ 
    isSelected, 
    onClick, 
    children 
  }: { 
    isSelected: boolean; 
    onClick: () => void; 
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`
        flex-1 h-8 lg:h-10 px-3 lg:px-6 py-2 lg:py-3 rounded text-sm font-normal text-center transition-colors
        ${isSelected 
          ? 'bg-[#41403d] text-white' 
          : 'bg-[#f6f6f6] text-[#62605c] hover:bg-gray-200'
        }
      `}
    >
      {children}
    </button>
  );

  const YesNoButton = ({ 
    isYes, 
    isSelected, 
    onClick 
  }: { 
    isYes: boolean; 
    isSelected: boolean; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`
        flex-1 h-8 lg:h-10 px-3 lg:px-6 py-2 lg:py-3 rounded text-sm font-normal text-center transition-colors
        ${isSelected 
          ? 'bg-[#41403d] text-white' 
          : 'bg-[#f6f6f6] text-[#62605c] hover:bg-gray-200'
        }
      `}
    >
      {isYes ? 'Yes' : 'No'}
    </button>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}
      title="Subscription Cancellation"
      step="Step 1 of 3"
      progress={1}
    >
      {/* Desktop Content */}
      <div className="hidden md:flex flex-col gap-4 lg:gap-6">
        {/* Title */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#41403d] leading-tight">
            Congrats on the new role! 🎉
          </h1>
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-6 lg:gap-8">
          {/* Question 1 */}
          <div className="flex flex-col gap-3 lg:gap-4">
            <h3 className="text-sm lg:text-base font-semibold text-[#62605c] max-w-md">
              Did you find this job with MigrateMate?*
            </h3>
            <div className="flex gap-2">
              <YesNoButton
                isYes={true}
                isSelected={responses.foundWithMigrateMate === true}
                onClick={() => setResponses(prev => ({ ...prev, foundWithMigrateMate: true }))}
              />
              <YesNoButton
                isYes={false}
                isSelected={responses.foundWithMigrateMate === false}
                onClick={() => setResponses(prev => ({ ...prev, foundWithMigrateMate: false }))}
              />
            </div>
          </div>

          {/* Question 2 */}
          <div className="flex flex-col gap-3 lg:gap-4">
            <h3 className="text-sm lg:text-base font-semibold text-[#62605c] max-w-md">
              How many roles did you <span className="underline">apply</span> for through Migrate Mate?*
            </h3>
            <div className="flex gap-2">
              {['0', '1 - 5', '6 - 20', '20+'].map((option) => (
                <OptionButton
                  key={option}
                  isSelected={responses.rolesApplied === option}
                  onClick={() => setResponses(prev => ({ ...prev, rolesApplied: option }))}
                >
                  {option}
                </OptionButton>
              ))}
            </div>
          </div>

          {/* Question 3 */}
          <div className="flex flex-col gap-3 lg:gap-4">
            <h3 className="text-sm lg:text-base font-semibold text-[#62605c] max-w-md">
              How many companies did you <span className="underline">email</span> directly?*
            </h3>
            <div className="flex gap-2">
              {['0', '1-5', '6-20', '20+'].map((option) => (
                <OptionButton
                  key={option}
                  isSelected={responses.companiesEmailed === option}
                  onClick={() => setResponses(prev => ({ ...prev, companiesEmailed: option }))}
                >
                  {option}
                </OptionButton>
              ))}
            </div>
          </div>

          {/* Question 4 */}
          <div className="flex flex-col gap-3 lg:gap-4">
            <h3 className="text-sm lg:text-base font-semibold text-[#62605c] max-w-md">
              How many different companies did you <span className="underline">interview</span> with?*
            </h3>
            <div className="flex gap-2">
              {['0', '1-2', '3-5', '5+'].map((option) => (
                <OptionButton
                  key={option}
                  isSelected={responses.companiesInterviewed === option}
                  onClick={() => setResponses(prev => ({ ...prev, companiesInterviewed: option }))}
                >
                  {option}
                </OptionButton>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200" />

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!isComplete}
          className={`h-10 lg:h-12 w-full rounded-lg font-semibold text-sm lg:text-base transition-colors ${
            isComplete
              ? 'bg-[#8952fc] text-white hover:bg-[#7b40fc]'
              : 'bg-[#e6e6e6] text-[#b5b3af] cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden flex flex-col h-full">
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#62605c] hover:opacity-70 transition-opacity mb-4"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-semibold">Back</span>
          </button>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-semibold text-[#41403d] leading-tight mb-4">
            Congrats on the new role! 🎉
          </h1>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 mb-6" />

          {/* Questions */}
          <div className="flex flex-col gap-6">
            {/* Question 1 */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-[#62605c]">
                Did you find this job with MigrateMate?*
              </h3>
              <div className="flex gap-2">
                <YesNoButton
                  isYes={true}
                  isSelected={responses.foundWithMigrateMate === true}
                  onClick={() => setResponses(prev => ({ ...prev, foundWithMigrateMate: true }))}
                />
                <YesNoButton
                  isYes={false}
                  isSelected={responses.foundWithMigrateMate === false}
                  onClick={() => setResponses(prev => ({ ...prev, foundWithMigrateMate: false }))}
                />
              </div>
            </div>

            {/* Question 2 */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-[#62605c]">
                How many roles did you <span className="underline">apply</span> for through Migrate Mate?
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['0', '1 - 5', '6 - 20', '20+'].map((option) => (
                  <OptionButton
                    key={option}
                    isSelected={responses.rolesApplied === option}
                    onClick={() => setResponses(prev => ({ ...prev, rolesApplied: option }))}
                  >
                    {option}
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* Question 3 */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-[#62605c]">
                How many companies did you <span className="underline">email</span> directly?
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['0', '1-5', '6-20', '20+'].map((option) => (
                  <OptionButton
                    key={option}
                    isSelected={responses.companiesEmailed === option}
                    onClick={() => setResponses(prev => ({ ...prev, companiesEmailed: option }))}
                  >
                    {option}
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* Question 4 */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-[#62605c]">
                How many different companies did you <span className="underline">interview</span> with?
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['0', '1-2', '3-5', '5+'].map((option) => (
                  <OptionButton
                    key={option}
                    isSelected={responses.companiesInterviewed === option}
                    onClick={() => setResponses(prev => ({ ...prev, companiesInterviewed: option }))}
                  >
                    {option}
                  </OptionButton>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button - Fixed at bottom */}
        <div className="bg-white border-t border-gray-100 pt-4 pb-safe flex flex-col gap-3 px-4 sm:px-6">
          <button
            onClick={handleContinue}
            disabled={!isComplete}
            className={`h-12 w-full rounded-lg font-semibold text-base transition-colors ${
              isComplete
                ? 'bg-[#8952fc] text-white hover:bg-[#7b40fc] active:bg-[#6d32f0]'
                : 'bg-[#e6e6e6] text-[#b5b3af] cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </BaseModal>
  );
}