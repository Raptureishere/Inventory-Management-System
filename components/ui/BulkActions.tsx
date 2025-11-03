import React from 'react';

interface BulkAction {
  id: string;
  label: string;
  icon: string;
  onClick: (selectedIds: number[]) => void;
  variant?: 'primary' | 'danger' | 'secondary';
  requiresConfirm?: boolean;
}

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  actions: BulkAction[];
  selectedIds: number[];
  onSelectAll: () => void;
  onClearSelection: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  totalCount,
  actions,
  selectedIds,
  onSelectAll,
  onClearSelection
}) => {
  if (selectedCount === 0) return null;

  const handleAction = (action: BulkAction) => {
    if (action.requiresConfirm) {
      if (window.confirm(`Are you sure you want to ${action.label.toLowerCase()} ${selectedCount} item(s)?`)) {
        action.onClick(selectedIds);
      }
    } else {
      action.onClick(selectedIds);
    }
  };

  const getButtonClass = (variant: string = 'secondary') => {
    const baseClass = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2';
    switch (variant) {
      case 'primary':
        return `${baseClass} bg-teal-600 text-white hover:bg-teal-700`;
      case 'danger':
        return `${baseClass} bg-red-600 text-white hover:bg-red-700`;
      default:
        return `${baseClass} bg-white border border-slate-300 text-slate-700 hover:bg-slate-50`;
    }
  };

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4 animate-slideDown">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-check-circle text-teal-600 text-xl"></i>
            <span className="font-semibold text-slate-800">
              {selectedCount} of {totalCount} selected
            </span>
          </div>
          
          {selectedCount < totalCount && (
            <button
              onClick={onSelectAll}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium underline"
            >
              Select all {totalCount}
            </button>
          )}
          
          <button
            onClick={onClearSelection}
            className="text-sm text-slate-600 hover:text-slate-700 font-medium underline"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              className={getButtonClass(action.variant)}
            >
              <i className={`fas ${action.icon}`}></i>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BulkActions;
