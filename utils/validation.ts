/**
 * Validation utilities for form inputs and data
 */

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message: string = 'This field is required'): ValidationRule => ({
    validate: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return !isNaN(value);
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length >= min,
    message: message || `Must be at least ${min} characters`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length <= max,
    message: message || `Must be at most ${max} characters`
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value: number) => value >= min,
    message: message || `Must be at least ${min}`
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value: number) => value <= max,
    message: message || `Must be at most ${max}`
  }),

  email: (message: string = 'Invalid email address'): ValidationRule => ({
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  phone: (message: string = 'Invalid phone number'): ValidationRule => ({
    validate: (value: string) => /^[\d\s\-\+\(\)]+$/.test(value),
    message
  }),

  positive: (message: string = 'Must be a positive number'): ValidationRule => ({
    validate: (value: number) => value > 0,
    message
  }),

  integer: (message: string = 'Must be a whole number'): ValidationRule => ({
    validate: (value: number) => Number.isInteger(value),
    message
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value: string) => regex.test(value),
    message
  }),

  custom: (validator: (value: any) => boolean, message: string): ValidationRule => ({
    validate: validator,
    message
  })
};

/**
 * Validate a single value against multiple rules
 */
export function validateField(value: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate an entire form object
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, ValidationRule[]>
): Record<keyof T, ValidationResult> {
  const results = {} as Record<keyof T, ValidationResult>;

  for (const field in schema) {
    results[field] = validateField(data[field], schema[field]);
  }

  return results;
}

/**
 * Check if form validation results are all valid
 */
export function isFormValid<T extends Record<string, any>>(
  results: Record<keyof T, ValidationResult>
): boolean {
  return Object.values(results).every(result => result.isValid);
}

/**
 * Item-specific validations
 */
export const itemValidation = {
  itemName: [
    validationRules.required('Item name is required'),
    validationRules.minLength(2, 'Item name must be at least 2 characters'),
    validationRules.maxLength(100, 'Item name must be less than 100 characters')
  ],
  quantity: [
    validationRules.required('Quantity is required'),
    validationRules.integer('Quantity must be a whole number'),
    validationRules.min(0, 'Quantity cannot be negative')
  ],
  unit: [
    validationRules.required('Unit is required'),
    validationRules.minLength(1, 'Unit must be specified')
  ],
  supplier: [
    validationRules.required('Supplier is required'),
    validationRules.minLength(2, 'Supplier name must be at least 2 characters')
  ]
};

/**
 * User-specific validations
 */
export const userValidation = {
  username: [
    validationRules.required('Username is required'),
    validationRules.minLength(3, 'Username must be at least 3 characters'),
    validationRules.maxLength(20, 'Username must be less than 20 characters'),
    validationRules.pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  ],
  password: [
    validationRules.required('Password is required'),
    validationRules.minLength(6, 'Password must be at least 6 characters')
  ]
};

/**
 * Supplier-specific validations
 */
export const supplierValidation = {
  name: [
    validationRules.required('Supplier name is required'),
    validationRules.minLength(2, 'Supplier name must be at least 2 characters')
  ],
  email: [
    validationRules.email('Invalid email address')
  ],
  phone: [
    validationRules.phone('Invalid phone number')
  ]
};

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: string[]): string {
  return errors.join('. ');
}

/**
 * Get first error from validation result
 */
export function getFirstError(result: ValidationResult): string | null {
  return result.errors.length > 0 ? result.errors[0] : null;
}
