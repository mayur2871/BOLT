/**
 * Utility functions for date calculations
 */

/**
 * Calculate the difference in days between two dates
 */
export function getDaysDifference(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Format date to YYYY-MM-DD format
 */
export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return formatDateForInput(new Date());
}

export function convertDDMMYYYYToISO(dateString) {
  if (!dateString || typeof dateString !== 'string' || dateString.length < 8) return '';
  const parts = dateString.trim().split('-');
  if (parts.length !== 3) return '';
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy || yyyy.length !== 4) return '';
  // Validate all parts are numeric
  if (isNaN(dd) || isNaN(mm) || isNaN(yyyy)) return '';
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}
