/**
 * Format a price in cents to a human-readable USD string.
 *
 * @param cents - Price in cents (e.g., 15000 = $150.00)
 * @returns Formatted currency string (e.g., "$150.00")
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

/**
 * Format a duration in minutes to a human-readable string.
 *
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "45 min", "1h 30min", "2h")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) {
    return '0 min'
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes} min`
  }

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}min`
}
