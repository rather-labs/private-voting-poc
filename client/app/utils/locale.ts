// Convert local date to Buenos Aires timezone for storage
export function toUTCDate(date: string): string {
  // Create a date object from the input string (which is in local timezone)
  const localDate = new Date(date);
  
  // Format the date in UTC timezone
  return localDate.toISOString().replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2T$4:$5:$6');
}

// Format date for display in local timezone
export function formatLocalDate(date: string): string {
  // Create a date object from the input string (which is in UTC timezone)
  const UTCDate = new Date(date);
  
  // Format the date in local timezone for display
  return UTCDate.toLocaleString(undefined, {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
} 

