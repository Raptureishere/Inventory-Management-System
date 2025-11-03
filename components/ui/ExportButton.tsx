import React, { useState } from 'react';
import { exportToCSV, exportToJSON, exportToExcel, ExportFormat } from '../../utils/exportUtils';

interface ExportButtonProps {
  data: any[];
  filename?: string;
  headers?: string[];
  className?: string;
  variant?: 'icon' | 'button' | 'dropdown';
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  data, 
  filename = 'export',
  headers,
  className = '',
  variant = 'dropdown'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: ExportFormat) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${timestamp}`;

    switch (format) {
      case 'csv':
        exportToCSV(data, `${fullFilename}.csv`, headers);
        break;
      case 'json':
        exportToJSON(data, `${fullFilename}.json`);
        break;
      case 'excel':
        exportToExcel(data, `${fullFilename}.csv`, headers);
        break;
    }
    setIsOpen(false);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={() => handleExport('csv')}
        className={`p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200 ${className}`}
        title="Export to CSV"
      >
        <i className="fas fa-download"></i>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={() => handleExport('csv')}
        className={`px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center space-x-2 ${className}`}
      >
        <i className="fas fa-download"></i>
        <span>Export</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 bg-white border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors duration-200 flex items-center space-x-2 ${className}`}
      >
        <i className="fas fa-download"></i>
        <span>Export</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-xs`}></i>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
            <button
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-3 text-left hover:bg-teal-50 transition-colors duration-200 flex items-center space-x-3"
            >
              <i className="fas fa-file-csv text-green-600"></i>
              <span className="text-sm font-medium text-slate-700">Export as CSV</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="w-full px-4 py-3 text-left hover:bg-teal-50 transition-colors duration-200 flex items-center space-x-3 border-t border-slate-100"
            >
              <i className="fas fa-file-excel text-green-700"></i>
              <span className="text-sm font-medium text-slate-700">Export as Excel</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full px-4 py-3 text-left hover:bg-teal-50 transition-colors duration-200 flex items-center space-x-3 border-t border-slate-100"
            >
              <i className="fas fa-file-code text-blue-600"></i>
              <span className="text-sm font-medium text-slate-700">Export as JSON</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
