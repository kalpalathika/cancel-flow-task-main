'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';

interface VisaOfferStepProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onComplete: (hasLawyer: boolean, visaType?: string) => void;
  onCompleteCancellation: () => void;
  onUpdateData: (hasLawyer: boolean, visaType?: string) => void;
  defaultHasLawyer?: boolean;
  defaultVisaType?: string;
}

export default function VisaOfferStep({ isOpen, onClose, onBack, onComplete, onCompleteCancellation, onUpdateData, defaultHasLawyer, defaultVisaType = '' }: VisaOfferStepProps) {
  const [selectedOption, setSelectedOption] = useState<'yes' | 'no' | null>(
    defaultHasLawyer !== undefined ? (defaultHasLawyer ? 'yes' : 'no') : null
  );
  const [visaType, setVisaType] = useState(defaultVisaType);

  const handleSubmit = () => {
    if (selectedOption && (selectedOption === 'no' || visaType.trim())) {
      onComplete(selectedOption === 'yes', visaType.trim() || undefined);
    }
  };

  const handleCompleteCancellation = () => {
    if (!isValid) return;
    
    if (selectedOption) {
      onComplete(selectedOption === 'yes', visaType.trim() || undefined);
    }
  };

  const isValid = selectedOption !== null && (selectedOption === 'no' || visaType.trim().length > 0);

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
      <div className="hidden md:flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col gap-3 lg:gap-4">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#41403d] leading-tight">
            We helped you land the job, now let&apos;s help you secure your visa.
          </h1>
        </div>
        
        <div className="flex flex-col gap-3 lg:gap-4">
          <p className="text-sm lg:text-base font-semibold text-[#62605c] leading-relaxed">
            Is your company providing an immigration lawyer to help with your visa?
          </p>
        </div>
        
        <div className="flex flex-col gap-3 lg:gap-4 w-full">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="hasLawyer"
              value="yes"
              checked={selectedOption === 'yes'}
              onChange={() => setSelectedOption('yes')}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selectedOption === 'yes' 
                ? 'border-[#4abf71] bg-[#4abf71]' 
                : 'border-[#62605c] group-hover:border-[#4abf71]'
            }`}>
              {selectedOption === 'yes' && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span className="text-sm lg:text-base font-medium text-[#62605c] group-hover:text-[#41403d] transition-colors">
              Yes
            </span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="hasLawyer"
              value="no"
              checked={selectedOption === 'no'}
              onChange={() => setSelectedOption('no')}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selectedOption === 'no' 
                ? 'border-[#4abf71] bg-[#4abf71]' 
                : 'border-[#62605c] group-hover:border-[#4abf71]'
            }`}>
              {selectedOption === 'no' && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span className="text-sm lg:text-base font-medium text-[#62605c] group-hover:text-[#41403d] transition-colors">
              No
            </span>
          </label>
        </div>

        {selectedOption === 'yes' && (
          <div className="flex flex-col gap-3 lg:gap-4 w-full">
            <p className="text-sm lg:text-base font-normal text-[#41403d] leading-relaxed">
              What visa will you be applying for?*
            </p>
            <input
              type="text"
              value={visaType}
              onChange={(e) => setVisaType(e.target.value)}
              placeholder="Enter visa type..."
              className="w-full h-10 lg:h-12 px-3 border border-[#62605c] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4abf71] focus:border-transparent text-sm lg:text-base text-gray-900 placeholder:text-gray-500"
            />
          </div>
        )}

        {selectedOption === 'no' && (
          <div className="flex flex-col gap-3 lg:gap-4 w-full">
            <p className="text-sm lg:text-base font-normal text-[#41403d] leading-relaxed">
              We can connect you with one of our trusted partners. Which visa would you like to apply for?*
            </p>
            <input
              type="text"
              value={visaType}
              onChange={(e) => setVisaType(e.target.value)}
              placeholder="Enter visa type..."
              className="w-full h-10 lg:h-12 px-3 border border-[#62605c] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4abf71] focus:border-transparent text-sm lg:text-base text-gray-900 placeholder:text-gray-500"
            />
          </div>
        )}
        
        <div className="w-full h-px bg-gray-200" />
        
        <div className="flex flex-col gap-3 lg:gap-4 w-full">
          <button
            onClick={handleCompleteCancellation}
            disabled={!isValid}
            className={`h-10 lg:h-12 w-full rounded-lg transition-colors flex items-center justify-center ${
              isValid 
                ? 'bg-[#4abf71] text-white hover:bg-[#3ea863]' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="text-sm lg:text-base font-semibold">
              Complete cancellation
            </span>
          </button>
        </div>
      </div>

      <div className="md:hidden flex flex-col h-full">
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
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#41403d] leading-tight">
                We helped you land the job, now let&apos;s help you secure your visa.
              </h1>
              
              <div className="w-full h-px bg-gray-200" />
            </div>
            
            <p className="text-sm sm:text-base font-semibold text-[#41403d] leading-relaxed">
              Is your company providing an immigration lawyer to help with your visa?*
            </p>
            
            <div className="flex flex-col gap-2 sm:gap-3 w-full">
              <label className="flex items-center gap-3 cursor-pointer group py-2">
                <input
                  type="radio"
                  name="hasLawyer"
                  value="yes"
                  checked={selectedOption === 'yes'}
                  onChange={() => setSelectedOption('yes')}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedOption === 'yes' 
                    ? 'border-[#4abf71] bg-[#4abf71]' 
                    : 'border-[#62605c] group-hover:border-[#4abf71]'
                }`}>
                  {selectedOption === 'yes' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-sm font-medium text-[#62605c] group-hover:text-[#41403d] transition-colors">
                  Yes
                </span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group py-2">
                <input
                  type="radio"
                  name="hasLawyer"
                  value="no"
                  checked={selectedOption === 'no'}
                  onChange={() => setSelectedOption('no')}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedOption === 'no' 
                    ? 'border-[#4abf71] bg-[#4abf71]' 
                    : 'border-[#62605c] group-hover:border-[#4abf71]'
                }`}>
                  {selectedOption === 'no' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-sm font-medium text-[#62605c] group-hover:text-[#41403d] transition-colors">
                  No
                </span>
              </label>
            </div>

            {selectedOption === 'yes' && (
              <div className="flex flex-col gap-3 w-full mt-4">
                <p className="text-sm sm:text-base font-normal text-[#41403d] leading-relaxed">
                  What visa will you be applying for?*
                </p>
                <input
                  type="text"
                  value={visaType}
                  onChange={(e) => setVisaType(e.target.value)}
                  placeholder="Enter visa type..."
                  className="w-full h-10 px-3 border border-[#62605c] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4abf71] focus:border-transparent text-sm text-gray-900 placeholder:text-gray-500"
                />
              </div>
            )}

            {selectedOption === 'no' && (
              <div className="flex flex-col gap-3 w-full mt-4">
                <p className="text-sm sm:text-base font-normal text-[#41403d] leading-relaxed">
                  We can connect you with one of our trusted partners. Which visa would you like to apply for?*
                </p>
                <input
                  type="text"
                  value={visaType}
                  onChange={(e) => setVisaType(e.target.value)}
                  placeholder="Enter visa type..."
                  className="w-full h-10 px-3 border border-[#62605c] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4abf71] focus:border-transparent text-sm text-gray-900 placeholder:text-gray-500"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Complete Button - Fixed at bottom with safe area */}
        <div className="bg-white border-t border-gray-100 pt-4 pb-safe px-4 sm:px-6">
          <button
            onClick={handleCompleteCancellation}
            disabled={!isValid}
            className={`h-12 w-full rounded-lg transition-colors flex items-center justify-center ${
              isValid 
                ? 'bg-[#4abf71] text-white hover:bg-[#3ea863] active:bg-[#359558]' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="text-base font-semibold">
              Complete cancellation
            </span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
}