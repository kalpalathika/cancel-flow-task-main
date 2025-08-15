'use client';

import BaseModal from './BaseModal';

interface CompletionStepProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
}

export default function CompletionStep({ isOpen, onClose, onFinish }: CompletionStepProps) {
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
            Your cancellation&apos;s all sorted, mate, no more charges.
          </h1>
        </div>
        
        {/* Profile section */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#4abf71] flex items-center justify-center">
              <span className="text-white font-semibold text-sm lg:text-base">
                MB
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm lg:text-base font-semibold text-[#41403d]">
                Mihailo Bozic
              </span>
              <span className="text-xs lg:text-sm text-[#62605c]">
                &lt;mihailo@migratemate.co&gt;
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 lg:gap-4">
            <p className="text-sm lg:text-base font-normal text-[#41403d] leading-relaxed">
              I&apos;ll be reaching out soon to help with the visa side of things.
            </p>
            
            <p className="text-sm lg:text-base font-normal text-[#62605c] leading-relaxed">
              We&apos;ve got your back, whether it&apos;s questions, paperwork, or just figuring out your options.
            </p>
            
            <p className="text-sm lg:text-base font-normal text-[#62605c] leading-relaxed">
              Keep an eye on your inbox, I&apos;ll be in touch{' '}
              <span className="underline">shortly</span>.
            </p>
          </div>
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
          {/* Content */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Main Heading */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#41403d] leading-tight">
                Your cancellation&apos;s all sorted, mate, no more charges.
              </h1>
              
              {/* Divider line for mobile */}
              <div className="w-full h-px bg-gray-200" />
            </div>
            
            {/* Profile section */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4abf71] flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    MB
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#41403d]">
                    Mihailo Bozic
                  </span>
                  <span className="text-xs text-[#62605c]">
                    &lt;mihailo@migratemate.co&gt;
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 sm:gap-4">
                <p className="text-sm font-normal text-[#41403d] leading-relaxed">
                  I&apos;ll be reaching out soon to help with the visa side of things.
                </p>
                
                <p className="text-sm font-normal text-[#62605c] leading-relaxed">
                  We&apos;ve got your back, whether it&apos;s questions, paperwork, or just figuring out your options.
                </p>
                
                <p className="text-sm font-normal text-[#62605c] leading-relaxed">
                  Keep an eye on your inbox, I&apos;ll be in touch{' '}
                  <span className="underline">shortly</span>.
                </p>
              </div>
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