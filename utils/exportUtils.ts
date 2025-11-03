/**
 * Utility functions for exporting data to various formats
 */

export type ExportFormat = 'csv' | 'json' | 'excel';

/**
 * Convert array of objects to CSV string
 */
export const convertToCSV = (data: any[], headers?: string[]): string => {
  if (data.length === 0) return '';

  const csvHeaders = headers || Object.keys(data[0]);
  const headerRow = csvHeaders.map(escapeCSVValue).join(',');
  const dataRows = data.map(row => 
    csvHeaders.map(header => escapeCSVValue(row[header])).join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Escape special characters in CSV values
 */
const escapeCSVValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Download data as CSV file
 */
export const exportToCSV = (data: any[], filename: string = 'export.csv', headers?: string[]): void => {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
};

/**
 * Download data as JSON file
 */
export const exportToJSON = (data: any[], filename: string = 'export.json', pretty: boolean = true): void => {
  const json = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename);
};

/**
 * Export to Excel-compatible format
 */
export const exportToExcel = (data: any[], filename: string = 'export.csv', headers?: string[]): void => {
  const csv = convertToCSV(data, headers);
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
};

/**
 * Generic blob download function
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format data for export by flattening nested objects
 */
export const flattenForExport = (data: any[]): any[] => {
  return data.map(item => {
    const flattened: any = {};
    Object.keys(item).forEach(key => {
      const value = item[key];
      if (Array.isArray(value)) {
        flattened[key] = value.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join('; ');
      } else if (typeof value === 'object' && value !== null) {
        Object.keys(value).forEach(nestedKey => {
          flattened[`${key}_${nestedKey}`] = value[nestedKey];
        });
      } else {
        flattened[key] = value;
      }
    });
    return flattened;
  });
};
