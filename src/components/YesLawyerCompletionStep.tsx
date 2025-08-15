'use client';

import BaseModal from './BaseModal';

interface YesLawyerCompletionStepProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
}

export default function YesLawyerCompletionStep({ isOpen, onClose, onFinish }: YesLawyerCompletionStepProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Subscription Cancelled"
      step="Completed"
      progress={4}
      showImage={true}
    >
      {/* Desktop Content */}
      <div className="hidden md:flex flex-col gap-4 lg:gap-6">
        {/* Main Heading */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#41403d] leading-tight">
            All done, your cancellation&apos;s been processed.
          </h1>
        </div>
        
        {/* Message */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <p className="text-sm lg:text-base font-normal text-[#41403d] leading-relaxed">
            We&apos;re stoked to hear you&apos;ve landed a job and sorted your visa. Big congrats from the team.🙌
          </p>
        </div>
        
        {/* Divider line */}
        <div className="w-full h-px bg-gray-200" />
        
        {/* Finish Button */}
        <div className="flex flex-col gap-3 lg:gap-4 w-full">
          <button
            onClick={onFinish}
            className="h-10 lg:h-12 w-full rounded-lg bg-[#8952fc] text-white hover:bg-[#7b40fc] transition-colors flex items-center justify-center"
          >
            <span className="text-sm lg:text-base font-semibold">
              Finish
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden flex flex-col h-full">
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Image for mobile - shows at top */}
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
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Main Heading */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#41403d] leading-tight">
                All done, your cancellation&apos;s been processed.
              </h1>
              
              {/* Divider line for mobile */}
              <div className="w-full h-px bg-gray-200" />
            </div>
            
            {/* Message */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <p className="text-sm font-normal text-[#41403d] leading-relaxed">
                We&apos;re stoked to hear you&apos;ve landed a job and sorted your visa. Big congrats from the team.🙌
              </p>
            </div>
          </div>
        </div>
        
        {/* Finish Button - Fixed at bottom with safe area */}
        <div className="bg-white border-t border-gray-100 pt-4 pb-safe px-4 sm:px-6">
          <button
            onClick={onFinish}
            className="h-12 w-full rounded-lg bg-[#8952fc] text-white hover:bg-[#7b40fc] active:bg-[#6d32f0] transition-colors flex items-center justify-center"
          >
            <span className="text-base font-semibold">
              Finish
            </span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
}