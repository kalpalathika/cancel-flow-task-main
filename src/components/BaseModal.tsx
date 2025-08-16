'use client';

import { ReactNode } from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  title: string;
  step?: string;
  progress?: number;
  showImage?: boolean;
  children: ReactNode;
}

export default function BaseModal({ 
  isOpen, 
  onClose, 
  onBack, 
  title, 
  step, 
  progress,
  showImage = true,
  children 
}: BaseModalProps) {
  if (!isOpen) return null;

  const ProgressBar = () => {
    // Determine max steps from step text (e.g., "Step 3 of 4")
    const maxSteps = step ? parseInt(step.split(' of ')[1]) || 3 : 3;
    const currentStepNum = progress || 1;
    
    return (
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {Array.from({ length: maxSteps }, (_, i) => {
            const stepIndex = i + 1;
            let bgColor = 'bg-[#e6e6e6]'; // default
            
            if (stepIndex < currentStepNum) {
              bgColor = 'bg-[#4abf71]'; // completed
            } else if (stepIndex === currentStepNum) {
              bgColor = 'bg-[#b5b3af]'; // current
            }
            
            return (
              <div
                key={i}
                className={`h-2 w-6 rounded-full ${bgColor}`}
              />
            );
          })}
        </div>
        {step && (
          <span className="text-xs lg:text-sm text-[#62605c] font-normal">{step}</span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay with backdrop */}
      <div className="absolute inset-0 bg-[#b5b3af] backdrop-blur-[10px]" />
      
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url('/api/placeholder/1677/865')`,
          backgroundPosition: 'center 28px'
        }}
      />
      
      {/* Modal content - Desktop */}
      <div className="relative z-10 hidden md:block max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-center px-4 lg:px-6 py-4 lg:py-5 border-b border-gray-200 relative">
            {/* Back button */}
            {onBack && (
              <button
                onClick={onBack}
                className="absolute left-4 lg:left-6 flex items-center gap-2 text-[#62605c] hover:opacity-70 transition-opacity"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm lg:text-base font-semibold">Back</span>
              </button>
            )}
            
            {/* Title and Progress */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#41403d] text-center">
                {title}
              </h2>
              {(step || progress) && (
                <div className="flex justify-center mt-2 lg:mt-0">
                  <ProgressBar />
                </div>
              )}
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 lg:right-6 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                <path
                  d="M9 3L3 9M3 3L9 9"
                  stroke="#41403d"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex flex-col lg:flex-row p-4 lg:p-6 gap-4 lg:gap-6">
            {/* Side image - moved before content for proper column order */}
            {showImage && (
              <div className="w-full lg:w-80 xl:w-96 h-64 lg:h-auto lg:order-2">
                <div className="w-full h-full relative rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src="/skyline.png" 
                    alt="City skyline"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 rounded-xl border-t-2 border-white/30" />
                  <div className="absolute inset-0 shadow-inner" />
                </div>
              </div>
            )}
            
            {/* Main content */}
            <div className="flex-1 lg:order-1">
              {children}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal content - Mobile */}
      <div className="relative z-10 md:hidden w-full h-full flex flex-col justify-end px-2 sm:px-4">
        <div className="bg-white rounded-t-2xl shadow-2xl w-full min-h-[60vh] max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex flex-col px-4 py-4 sm:py-5 border-b border-gray-200 bg-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#41403d] text-center flex-1">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
              >
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M9 3L3 9M3 3L9 9"
                    stroke="#41403d"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            
            {/* Progress on mobile */}
            {(step || progress) && (
              <div className="flex justify-center mt-2">
                <ProgressBar />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}