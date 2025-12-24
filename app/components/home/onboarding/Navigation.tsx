import React from 'react';

interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentStep, totalSteps, onNext, onPrev }) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <>
      <button
        onClick={onPrev}
        disabled={isFirstStep}
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '600',
          borderRadius: '6px',
          transition: 'all 0.2s',
          border: '1px solid',
          ...(isFirstStep
            ? {
                color: '#D1D5DB',
                cursor: 'not-allowed',
                borderColor: '#E5E7EB',
                backgroundColor: '#F9FAFB',
              }
            : {
                color: '#374151',
                backgroundColor: 'white',
                borderColor: '#D1D5DB',
                cursor: 'pointer',
              }),
        }}
        onMouseEnter={(e) => {
          if (!isFirstStep) {
            e.currentTarget.style.backgroundColor = '#F9FAFB';
          }
        }}
        onMouseLeave={(e) => {
          if (!isFirstStep) {
            e.currentTarget.style.backgroundColor = 'white';
          }
        }}
        onMouseDown={(e) => {
          if (!isFirstStep) {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
          }
        }}
        onMouseUp={(e) => {
          if (!isFirstStep) {
            e.currentTarget.style.backgroundColor = '#F9FAFB';
          }
        }}
      >
        Back
      </button>

      <button
        onClick={onNext}
        style={{
          padding: '8px 20px',
          fontSize: '14px',
          fontWeight: '600',
          color: 'white',
          backgroundColor: '#008060',
          borderRadius: '6px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s',
          minWidth: '100px',
          cursor: 'pointer',
          border: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#006e52';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#008060';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.backgroundColor = '#005a44';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.backgroundColor = '#006e52';
        }}
      >
        {isLastStep ? 'Finish' : 'Next Step'}
      </button>
    </>
  );
};

export default Navigation;
