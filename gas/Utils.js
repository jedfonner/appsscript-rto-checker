/**
 * Returns a date that is incremented by the specified number of weeks
 * @param {Date} dt the starting date
 * @param {int} number of weeks to add. Can be negative to decrement weeks
 * @returns {Date} new date
 */
function incrementDateByWeeks(dt, weeksToAdd) {
  const result = new Date(dt.getTime() + (1000 * 60 * 60 * 24 * 7 * weeksToAdd));
  return result;
}

/**
 * Generates a list of weekdays (Mon-Fri) between two dates.
 * Does not remove holidays, exclusions, etc.
 * @param {Date} start
 * @param {Date} end
 * @returns {Array} List of date objects representing week days
 */
function getWeekDays(start, end) {
  let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const stopDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const weekDays = [];
  // Helper to format date as M/D/YYYY
  while (current <= stopDate) {
    const dayOfWeek = current.getDay(); // 0 (Sun) to 6 (Sat)
    // If it's a weekday (Mon-Fri)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // const yyyymmdd = dayOfWeek.toLocaleDateString("en-US", {year: "numeric", month: "2-digit", day: "2-digit"});
      // if(!EXCLUSIONS_US.includes(yyyymmdd)) {
        weekDays.push(new Date(current.getTime()));
      // }
    }
    current.setDate(current.getDate() + 1);
  }
  return weekDays;
}


/**
 * Generates a list of work week ranges (Mon-Fri) between two dates.
 * @param {Date} start
 * @param {Date} end
 * @returns {Array} List of formatted week strings
 */
function getWorkWeeks(start, end) {
  let current = new Date(start);
  const stopDate = new Date(end);
  const weeks = [];
  // Helper to format date as M/D/YYYY
  while (current <= stopDate) {
    const dayOfWeek = current.getDay(); // 0 (Sun) to 6 (Sat)
    // If it's a weekday (Mon-Fri)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Find Monday of this week
      const monday = new Date(current);
      monday.setDate(current.getDate() - (dayOfWeek - 1));
      monday.setHours(0);
      monday.setMinutes(0);
      monday.setSeconds(0);

      // Find Friday of this week
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      friday.setHours(23);
      friday.setMinutes(59);
      friday.setSeconds(59);

      // Add to list if not already added
      weeks.push({monday, friday});

      // Jump to the following Monday
      current.setDate(monday.getDate() + 7);
    } else {
      // If it's a weekend, move to the next day
      current.setDate(current.getDate() + 1);
    }
  }
  return weeks;
}