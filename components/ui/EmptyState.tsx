import React from 'react';
import { PrimaryButton, SecondaryButton } from './Controls';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Empty state component for when there's no data to display
 * Shows icon, message, and optional action buttons
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'fa-inbox',
  title,
  description,
  action,
  secondaryAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <i className={`fas ${icon} text-4xl text-slate-400`}></i>
      </div>
      
      <h3 className="text-xl font-semibold text-slate-800 mb-2 text-center">
        {title}
      </h3>
      
      {description && (
        <p className="text-slate-600 text-center max-w-md mb-6">
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex items-center space-x-3">
          {action && (
            action.variant === 'secondary' ? (
              <SecondaryButton onClick={action.onClick}>
                {action.label}
              </SecondaryButton>
            ) : (
              <PrimaryButton onClick={action.onClick}>
                {action.label}
              </PrimaryButton>
            )
          )}
          
          {secondaryAction && (
            <SecondaryButton onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </SecondaryButton>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
