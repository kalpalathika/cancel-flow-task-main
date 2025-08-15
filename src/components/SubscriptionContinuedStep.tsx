'use client';

import BaseModal from './BaseModal';

interface SubscriptionContinuedStepProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
}

export default function SubscriptionContinuedStep({ 
  isOpen, 
  onClose, 
  onFinish 
}: SubscriptionContinuedStepProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Subscription"
      showImage={true}
    >
      {/* Desktop Content */}
      <div className="hidden md:flex flex-col gap-4 lg:gap-6">
        {/* Main Heading */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#41403d] leading-tight">
            Great choice, mate!
          </h1>
        </div>
        
        {/* Sub-heading with purple text */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <div className="text-lg lg:text-xl xl:text-2xl font-normal text-[#41403d] leading-tight">
            You&apos;re still on the path to your dream role.{' '}
            <span className="text-[#8952fc] font-normal">
              Let&apos;s make it happen together!
            </span>
          </div>
        </div>
        
        {/* Details */}
        <div className="flex flex-col gap-2 lg:gap-3">
          <p className="text-sm lg:text-base font-semibold text-[#41403d] leading-relaxed">
            You&apos;ve got XX days left on your current plan.
          </p>
          <p className="text-sm lg:text-base font-semibold text-[#41403d] leading-relaxed">
            Starting from XX date, your monthly payment will be $12.50.
          </p>
        </div>
        
        {/* Fine print */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <p className="text-xs lg:text-sm font-normal text-[#62605c] leading-relaxed italic">
            You can cancel anytime before then.
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
              Land your dream role
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
                Great choice, mate!
              </h1>
              
              {/* Sub-heading with purple text */}
              <div className="text-base sm:text-lg font-normal text-[#41403d] leading-tight">
                You&apos;re still on the path to your dream role.{' '}
                <span className="text-[#8952fc] font-normal">
                  Let&apos;s make it happen together!
                </span>
              </div>
              
              {/* Divider line for mobile */}
              <div className="w-full h-px bg-gray-200" />
            </div>
            
            {/* Details */}
            <div className="flex flex-col gap-2 sm:gap-3">
              <p className="text-sm font-semibold text-[#41403d] leading-relaxed">
                You&apos;ve got XX days left on your current plan.
              </p>
              <p className="text-sm font-semibold text-[#41403d] leading-relaxed">
                Starting from XX date, your monthly payment will be $12.50.
              </p>
            </div>
            
            {/* Fine print */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <p className="text-xs font-normal text-[#62605c] leading-relaxed italic">
                You can cancel anytime before then.
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
              Land your dream role
            </span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
}