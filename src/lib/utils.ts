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

export const getWorkDaysBetween = (
  startStr: string,
  endStr: string,
  exclusions: string[],
): number => {
  // Calculates the number of workdays (Mon-Fri) between two dates, excluding specified dates
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  let workDaysCount = 0;
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getUTCDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dateStr = currentDate.toISOString().slice(0, 10);
      if (!exclusions || !exclusions.includes(dateStr)) {
        console.log('Counting workday:', dateStr);
        workDaysCount++;
      } else {
        console.log('Excluding date:', dateStr);
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return workDaysCount;
};