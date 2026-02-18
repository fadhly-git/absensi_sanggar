/* eslint-disable prefer-const */
/**
 * Date utility functions for attendance system
 * Sanggar only operates on Sundays
 */

/**
 * Get nearest Sunday from a given date
 * - If today is Sunday, return today
 * - If today is Monday-Wednesday, return last Sunday
 * - If today is Thursday-Saturday, return next Sunday
 *
 * @param date - Reference date (default: today)
 * @returns Date object set to nearest Sunday
 */
export function getNearestSunday(date: Date = new Date()): Date {
  const dayOfWeek = date.getDay()
  const sunday = new Date(date)

  if (dayOfWeek === 0) {
    // Already Sunday
    return sunday
  } else if (dayOfWeek <= 3) {
    // Monday to Wednesday - get last Sunday
    sunday.setDate(date.getDate() - dayOfWeek)
  } else {
    // Thursday to Saturday - get next Sunday
    sunday.setDate(date.getDate() + (7 - dayOfWeek))
  }

  sunday.setHours(0, 0, 0, 0)
  return sunday
}

/**
 * Check if a date is Sunday
 *
 * @param date - Date to check
 * @returns true if date is Sunday
 */
export function isSunday(date: Date): boolean {
  return date.getDay() === 0
}

/**
 * Get nearest Sunday as ISO date string (YYYY-MM-DD)
 *
 * @param date - Reference date (default: today)
 * @returns ISO date string
 */
export function getNearestSundayString(date: Date = new Date()): string {
  return getNearestSunday(date).toISOString().slice(0, 10)
}

/**
 * Get all Sundays in a given month
 *
 * @param year - Year
 * @param month - Month (1-12)
 * @returns Array of Sunday dates
 */
export function getSundaysInMonth(year: number, month: number): Date[] {
  const sundays: Date[] = []
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  // Find first Sunday
  let current = new Date(firstDay)
  while (current.getDay() !== 0) {
    current.setDate(current.getDate() + 1)
  }

  // Collect all Sundays
  while (current <= lastDay) {
    sundays.push(new Date(current))
    current.setDate(current.getDate() + 7)
  }

  return sundays
}

/**
 * Get all Sundays in a date range
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of Sunday dates
 */
export function getSundaysInRange(startDate: Date, endDate: Date): Date[] {
  const sundays: Date[] = []
  const current = new Date(startDate)

  // Find first Sunday
  while (current.getDay() !== 0 && current <= endDate) {
    current.setDate(current.getDate() + 1)
  }

  // Collect all Sundays in range
  while (current <= endDate) {
    sundays.push(new Date(current))
    current.setDate(current.getDate() + 7)
  }

  return sundays
}

/**
 * Get previous Sunday from given date
 *
 * @param date - Reference date (default: today)
 * @returns Previous Sunday date
 */
export function getPreviousSunday(date: Date = new Date()): Date {
  const dayOfWeek = date.getDay()
  const previousSunday = new Date(date)

  if (dayOfWeek === 0) {
    // If today is Sunday, get last Sunday
    previousSunday.setDate(date.getDate() - 7)
  } else {
    // Get previous Sunday
    previousSunday.setDate(date.getDate() - dayOfWeek)
  }

  previousSunday.setHours(0, 0, 0, 0)
  return previousSunday
}

/**
 * Get next Sunday from given date
 *
 * @param date - Reference date (default: today)
 * @returns Next Sunday date
 */
export function getNextSunday(date: Date = new Date()): Date {
  const dayOfWeek = date.getDay()
  const nextSunday = new Date(date)

  if (dayOfWeek === 0) {
    // If today is Sunday, get next Sunday
    nextSunday.setDate(date.getDate() + 7)
  } else {
    // Get next Sunday
    nextSunday.setDate(date.getDate() + (7 - dayOfWeek))
  }

  nextSunday.setHours(0, 0, 0, 0)
  return nextSunday
}

/**
 * Format date to Indonesian day name
 *
 * @param date - Date to format
 * @returns Indonesian day name (e.g., "Minggu")
 */
export function getIndonesianDayName(date: Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  return days[date.getDay()]
}

/**
 * Validate if date string is a Sunday
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns true if date is Sunday
 */
export function isDateStringSunday(dateString: string): boolean {
  try {
    const date = new Date(dateString)
    return isSunday(date)
  } catch {
    return false
  }
}
