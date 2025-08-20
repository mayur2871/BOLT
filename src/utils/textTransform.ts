/**
 * Utility functions for text transformation
 */

/**
 * Converts text to uppercase and trims whitespace
 */
export function toUpperCase(text: string): string {
  return text.trim().toUpperCase();
}

/**
 * Converts form data object to uppercase for text fields
 */
export function transformFormDataToUppercase(data: Record<string, any>): Record<string, any> {
  const transformed: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Don't transform date fields or numeric fields
      if (key.toLowerCase().includes('date') || key.toLowerCase().includes('amount') || 
          key.toLowerCase().includes('rate') || key.toLowerCase().includes('weight') ||
          key.toLowerCase().includes('charge') || key.toLowerCase().includes('commission') ||
          key.toLowerCase().includes('total') || key.toLowerCase().includes('advance') ||
          key.toLowerCase().includes('day') || key.toLowerCase().includes('hold')) {
        transformed[key] = value.trim();
      } else {
        transformed[key] = toUpperCase(value);
      }
    } else {
      transformed[key] = value;
    }
  }
  
  return transformed;
}

/**
 * Validates and transforms input based on field type
 */
export function validateAndTransformInput(value: string, fieldType: 'text' | 'number' | 'date' = 'text'): string {
  const trimmed = value.trim();
  
  switch (fieldType) {
    case 'text':
      return trimmed.toUpperCase();
    case 'number':
    case 'date':
      return trimmed;
    default:
      return trimmed.toUpperCase();
  }
}