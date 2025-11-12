// Global type declarations for external libraries

declare global {
  interface Window {
    XLSX: {
      read: (data: any, options?: any) => any;
      utils: {
        json_to_sheet: (data: any[]) => any;
        sheet_to_json: (worksheet: any) => any[];
        book_new: () => any;
        book_append_sheet: (workbook: any, worksheet: any, name: string) => void;
      };
      writeFile: (workbook: any, filename: string) => void;
    };
    jsPDF: new () => {
      text: (text: string, x: number, y: number) => void;
      setFontSize: (size: number) => void;
      addPage: () => void;
      autoTable: (options: any) => void;
      save: (filename: string) => void;
    };
  }
}

export {};

declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
