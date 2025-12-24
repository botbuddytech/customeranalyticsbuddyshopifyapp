import React from 'react';
import { StoreIcon, StarIcon, RobotIcon, EnvelopeIcon } from './icons';

interface ProgressBarProps {
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Connect Store Data', icon: StoreIcon },
    { id: 2, label: 'Upgrade Plan', icon: StarIcon },
    { id: 3, label: 'Test AI & Report', icon: RobotIcon },
    { id: 4, label: 'Connect Email', icon: EnvelopeIcon },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Background Line */}
      <div style={{ position: 'absolute', top: '20px', left: 0, width: '100%', height: '2px', backgroundColor: '#E5E7EB', zIndex: 0 }}></div>
      
      {/* Active Line */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          left: 0, 
          height: '2px', 
          backgroundColor: '#008060', 
          transition: 'width 0.5s',
          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          zIndex: 0
        }}
      ></div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between' }}>
        {steps.map((step) => {
          const isActive = step.id <= currentStep;
          const isCurrent = step.id === currentStep;
          const IconComponent = step.icon;

          return (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: isActive ? '#008060' : '#D1D5DB',
                backgroundColor: 'white',
                transition: 'all 0.3s',
                boxShadow: isCurrent ? '0 0 0 4px rgba(0, 128, 96, 0.1)' : 'none',
                color: isActive ? '#008060' : '#D1D5DB',
              }}>
                <IconComponent />
              </div>
              <span style={{
                marginTop: '12px',
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'color 0.3s',
                color: isActive ? '#008060' : '#9CA3AF',
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
