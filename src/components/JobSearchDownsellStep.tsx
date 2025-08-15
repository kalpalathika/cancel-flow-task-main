'use client';

import BaseModal from './BaseModal';

interface JobSearchDownsellStepProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onAcceptOffer: () => void;
  onDeclineOffer: () => void;
}

export default function JobSearchDownsellStep({ 
  isOpen, 
  onClose, 
  onBack, 
  onAcceptOffer, 
  onDeclineOffer 
}: JobSearchDownsellStepProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}
      title="Subscription Cancellation"
      step="Step 1 of 3"
      progress={1}
      showImage={true}
    >
      {/* Desktop Content */}
      <div className="hidden md:flex flex-col gap-4 lg:gap-6">
        {/* Main Heading */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#41403d] leading-tight">
            We built this to help you land the job, this makes it a little easier.
          </h1>
        </div>
        
        {/* Sub-heading */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <p className="text-sm lg:text-base font-normal text-[#62605c] leading-relaxed">
            We&apos;ve been there and we&apos;re here to help you.
          </p>
        </div>
        
        {/* Offer Card */}
        <div className="bg-[#f0e6ff] border-2 border-[#e0d1ff] rounded-xl p-4 lg:p-6 w-full">
          <div className="flex flex-col gap-3 lg:gap-4">
            {/* Offer heading */}
            <h2 className="text-lg lg:text-xl font-semibold text-[#41403d]">
              Here&apos;s <span className="underline">50% off</span> until you find a job.
            </h2>
            
            {/* Pricing */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-bold text-[#8952fc]">
                $12.50
              </span>
              <span className="text-sm lg:text-base text-[#62605c]">
                /month
              </span>
              <span className="text-sm lg:text-base text-[#62605c] line-through ml-2">
                $25/month
              </span>
            </div>
            
            {/* Accept button */}
            <button
              onClick={onAcceptOffer}
              className="w-full h-10 lg:h-12 bg-[#4abf71] text-white rounded-lg font-semibold text-sm lg:text-base hover:bg-[#3ea863] transition-colors"
            >
              Get 50% off
            </button>
            
            {/* Fine print */}
            <p className="text-xs lg:text-sm text-[#62605c] text-center">
              You won&apos;t be charged until your next billing date.
            </p>
          </div>
        </div>
        
        {/* Divider line */}
        <div className="w-full h-px bg-gray-200" />
        
        {/* Decline button */}
        <div className="flex flex-col gap-3 lg:gap-4 w-full">
          <button
            onClick={onDeclineOffer}
            className="h-10 lg:h-12 w-full rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <span className="text-sm lg:text-base font-semibold text-[#62605c]">
              No thanks
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
            {/* Main Heading */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#41403d] leading-tight">
                We built this to help you land the job, this makes it a little easier.
              </h1>
              
              {/* Divider line for mobile */}
              <div className="w-full h-px bg-gray-200" />
            </div>
            
            {/* Offer Card */}
            <div className="bg-[#f0e6ff] border-2 border-[#e0d1ff] rounded-xl p-4 w-full">
              <div className="flex flex-col gap-3">
                {/* Offer heading */}
                <h2 className="text-base sm:text-lg font-semibold text-[#41403d]">
                  Here&apos;s <span className="underline">50% off</span> until you find a job.
                </h2>
                
                {/* Pricing */}
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-[#8952fc]">
                    $12.50
                  </span>
                  <span className="text-sm text-[#62605c]">
                    /month
                  </span>
                  <span className="text-sm text-[#62605c] line-through ml-2">
                    $25/month
                  </span>
                </div>
                
                {/* Accept button */}
                <button
                  onClick={onAcceptOffer}
                  className="w-full h-10 bg-[#4abf71] text-white rounded-lg font-semibold text-sm hover:bg-[#3ea863] transition-colors"
                >
                  Get 50% off
                </button>
                
                {/* Fine print */}
                <p className="text-xs text-[#62605c] text-center">
                  You won&apos;t be charged until your next billing date.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decline button - Fixed at bottom with safe area */}
        <div className="bg-white border-t border-gray-100 pt-4 pb-safe px-4 sm:px-6">
          <button
            onClick={onDeclineOffer}
            className="h-12 w-full rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center"
          >
            <span className="text-base font-semibold text-[#62605c]">
              No thanks
            </span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
}