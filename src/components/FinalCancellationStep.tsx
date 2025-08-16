'use client';

import BaseModal from './BaseModal';

interface FinalCancellationStepProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToJobs: () => void;
}

export default function FinalCancellationStep({ 
  isOpen, 
  onClose, 
  onBackToJobs 
}: FinalCancellationStepProps) {
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
            Sorry to see you go, mate.
          </h1>
        </div>
        
        {/* Sub-heading */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <p className="text-lg lg:text-xl font-normal text-[#41403d] leading-tight">
            Thanks for being with us, and you&apos;re always welcome back.
          </p>
        </div>
        
        {/* Subscription details */}
        <div className="flex flex-col gap-2 lg:gap-3">
          <p className="text-sm lg:text-base font-normal text-[#41403d] leading-relaxed">
            Your subscription is set to end on XX date.
          </p>
          <p className="text-sm lg:text-base font-normal text-[#41403d] leading-relaxed">
            You&apos;ll still have full access until then. No further charges after that.
          </p>
        </div>
        
        {/* Reactivation message */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <p className="text-sm lg:text-base font-normal text-[#62605c] leading-relaxed">
            Changed your mind? You can reactivate anytime before your end date.
          </p>
        </div>
        
        {/* Divider line */}
        <div className="w-full h-px bg-gray-200" />
        
        {/* Back to Jobs Button */}
        <div className="flex flex-col gap-3 lg:gap-4 w-full">
          <button
            onClick={onBackToJobs}
            className="h-10 lg:h-12 w-full rounded-lg bg-[#8952fc] text-white hover:bg-[#7b40fc] transition-colors flex items-center justify-center"
          >
            <span className="text-sm lg:text-base font-semibold">
              Back to Jobs
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
                Sorry to see you go, mate.
              </h1>
              
              {/* Sub-heading */}
              <p className="text-base sm:text-lg font-normal text-[#41403d] leading-tight">
                Thanks for being with us, and you&apos;re always welcome back.
              </p>
              
              {/* Divider line for mobile */}
              <div className="w-full h-px bg-gray-200" />
            </div>
            
            {/* Subscription details */}
            <div className="flex flex-col gap-2 sm:gap-3">
              <p className="text-sm font-normal text-[#41403d] leading-relaxed">
                Your subscription is set to end on XX date.
              </p>
              <p className="text-sm font-normal text-[#41403d] leading-relaxed">
                You&apos;ll still have full access until then. No further charges after that.
              </p>
            </div>
            
            {/* Reactivation message */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <p className="text-sm font-normal text-[#62605c] leading-relaxed">
                Changed your mind?
              </p>
              <p className="text-sm font-normal text-[#62605c] leading-relaxed">
                You can reactivate anytime before your end date.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border-t border-gray-100 pt-4 pb-safe px-4 sm:px-6">
          <button
            onClick={onBackToJobs}
            className="h-12 w-full rounded-lg bg-[#8952fc] text-white hover:bg-[#7b40fc] active:bg-[#6d32f0] transition-colors flex items-center justify-center"
          >
            <span className="text-base font-semibold">
              Back to Jobs
            </span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
}