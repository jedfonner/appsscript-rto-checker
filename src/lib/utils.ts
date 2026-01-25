export const formatDate = (dateStr: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long', // "Thursday"
    year: 'numeric', // "2026"
    month: 'long', // "January"
    day: 'numeric', // "15"
    timeZone: 'UTC',
  };
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', options);
};