import React, { useRef } from 'react';

interface PrintTemplateProps {
  title: string;
  children: React.ReactNode;
  headerInfo?: { label: string; value: string }[];
  showPrintButton?: boolean;
  className?: string;
}

const PrintTemplate: React.FC<PrintTemplateProps> = ({ 
  title, 
  children, 
  headerInfo = [],
  showPrintButton = true,
  className = ''
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 20mm;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
              }
              .no-print {
                display: none !important;
              }
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #14b8a6;
              padding-bottom: 20px;
            }
            .print-title {
              font-size: 24px;
              font-weight: bold;
              color: #14b8a6;
              margin-bottom: 10px;
            }
            .print-subtitle {
              font-size: 14px;
              color: #666;
            }
            .header-info {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 8px;
              background: #f8f9fa;
              border-radius: 4px;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .info-value {
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #14b8a6;
              color: white;
              font-weight: bold;
            }
            tr:hover {
              background-color: #f5f5f5;
            }
            .print-footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className={className}>
      {showPrintButton && (
        <div className="mb-4 flex justify-end no-print">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <i className="fas fa-print"></i>
            <span>Print</span>
          </button>
        </div>
      )}

      <div ref={printRef}>
        <div className="print-header">
          <div className="print-title">{title}</div>
          <div className="print-subtitle">Clinic Inventory Management System</div>
        </div>

        {headerInfo.length > 0 && (
          <div className="header-info">
            {headerInfo.map((info, index) => (
              <div key={index} className="info-item">
                <span className="info-label">{info.label}:</span>
                <span className="info-value">{info.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="print-content">
          {children}
        </div>

        <div className="print-footer">
          <p>Generated on {new Date().toLocaleString()}</p>
          <p>Clinic Inventory Management System</p>
        </div>
      </div>
    </div>
  );
};

export default PrintTemplate;
