import React, { useState } from 'react';
import { SecondaryButton, PrimaryButton } from './Controls';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'daterange' | 'number';
  options?: FilterOption[];
  placeholder?: string;
}

export interface FilterValues {
  [key: string]: any;
}

interface AdvancedFilterProps {
  filters: FilterConfig[];
  onApply: (values: FilterValues) => void;
  onReset: () => void;
  initialValues?: FilterValues;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ 
  filters, 
  onApply, 
  onReset,
  initialValues = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>(initialValues);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleFilterChange = (filterId: string, value: any) => {
    setFilterValues(prev => ({ ...prev, [filterId]: value }));
  };

  const handleApply = () => {
    const activeCount = Object.values(filterValues).filter(v => 
      v !== undefined && v !== '' && v !== null && (Array.isArray(v) ? v.length > 0 : true)
    ).length;
    setActiveFiltersCount(activeCount);
    onApply(filterValues);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilterValues({});
    setActiveFiltersCount(0);
    onReset();
  };

  const renderFilterInput = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'select':
        return (
          <select
            value={filterValues[filter.id] || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">{filter.placeholder || 'Select...'}</option>
            {filter.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2 max-h-40 overflow-y-auto border border-teal-200 rounded-lg p-2">
            {filter.options?.map(opt => (
              <label key={opt.value} className="flex items-center space-x-2 cursor-pointer hover:bg-teal-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={(filterValues[filter.id] || []).includes(opt.value)}
                  onChange={(e) => {
                    const current = filterValues[filter.id] || [];
                    const updated = e.target.checked
                      ? [...current, opt.value]
                      : current.filter((v: string) => v !== opt.value);
                    handleFilterChange(filter.id, updated);
                  }}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'daterange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">From</label>
              <input
                type="date"
                value={filterValues[`${filter.id}_from`] || ''}
                onChange={(e) => handleFilterChange(`${filter.id}_from`, e.target.value)}
                className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">To</label>
              <input
                type="date"
                value={filterValues[`${filter.id}_to`] || ''}
                onChange={(e) => handleFilterChange(`${filter.id}_to`, e.target.value)}
                className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Min</label>
              <input
                type="number"
                value={filterValues[`${filter.id}_min`] || ''}
                onChange={(e) => handleFilterChange(`${filter.id}_min`, e.target.value)}
                placeholder="Min"
                className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Max</label>
              <input
                type="number"
                value={filterValues[`${filter.id}_max`] || ''}
                onChange={(e) => handleFilterChange(`${filter.id}_max`, e.target.value)}
                placeholder="Max"
                className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <i className="fas fa-filter text-teal-600"></i>
        <span className="font-medium text-slate-700">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="bg-teal-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-slate-400 text-xs`}></i>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Advanced Filters</h3>
            </div>
            
            <div className="p-4 space-y-4">
              {filters.map(filter => (
                <div key={filter.id}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {filter.label}
                  </label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-between space-x-3">
              <SecondaryButton onClick={handleReset} className="flex-1">
                <i className="fas fa-redo mr-2"></i>
                Reset
              </SecondaryButton>
              <PrimaryButton onClick={handleApply} className="flex-1">
                <i className="fas fa-check mr-2"></i>
                Apply
              </PrimaryButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdvancedFilter;
