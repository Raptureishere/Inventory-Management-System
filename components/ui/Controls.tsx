import React from 'react';

export const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { className?: string }> = ({ className, ...props }) => (
    <input
        className={`block w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${className}`}
        {...props}
    />
);

export const StyledSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string; children: React.ReactNode }> = ({ className, children, ...props }) => (
    <select
        className={`block w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${className}`}
        {...props}
    >
        {children}
    </select>
);

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
    <button
        className={`px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 ${props.className || ''}`}
    >
        {children}
    </button>
);

export const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
    <button
        className={`px-4 py-2.5 rounded-lg text-sm font-medium text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 ${props.className || ''}`}
    >
        {children}
    </button>
);


