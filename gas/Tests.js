
function testGetInOfficeDays() {
  const calendarIdToUse = Session.getActiveUser().getEmail();
  const calendar = CalendarApp.getCalendarById(calendarIdToUse);
  const now = new Date();
  const startOfRange = incrementDateByWeeks(now, -1 * 6);
  const endOfRange = incrementDateByWeeks(now, 4) // look 4 weeks into the future
  const allEvents = calendar.getEvents(startOfRange, endOfRange);

  const start = new Date(2025, 11, 8); //Dec 15
  const end = new Date(2025, 11, 31) // Dec 20
  const result = getInOfficeDays(start, end, allEvents);
  result.forEach(day => Logger.log("In office on " + day.toDateString()))
}

function testIsOutOfOfficeDay() {
  const calendarIdToUse = Session.getActiveUser().getEmail();
  const calendar = CalendarApp.getCalendarById(calendarIdToUse);
  const now = new Date();
  const startOfRange = incrementDateByWeeks(now, -1 * 8);
  const endOfRange = incrementDateByWeeks(now, 4) // look 4 weeks into the future
  const allEvents = calendar.getEvents(startOfRange, endOfRange);
  const nonFullDayOOO = new Date(2025, 11, 2);
  let isOOO = isOutOfOfficeDay(nonFullDayOOO,allEvents);
  Logger.log(nonFullDayOOO.toDateString() + " is ooo? " + isOOO);
  if(isOOO != false) Logger.log("isOutOfOfficeDay() failed for non-full day ooo");
  const fullDayOOO = new Date(2025, 11, 18);
  isOOO = isOutOfOfficeDay(fullDayOOO,allEvents);
  Logger.log(fullDayOOO.toDateString() + " is ooo? " + isOOO);
  if(isOOO != true) Logger.log("isOutOfOfficeDay() failed for full day ooo");
}

function testGetWeekDays() {
  const start = new Date(2025, 11, 15);
  const end = new Date(2025, 11, 20)
  const weekDays = getWeekDays(start, end);
  weekDays.forEach(day => Logger.log(day))
}

function testGetWorkWeeks() {
  const end = new Date();
  const start = new Date(end.getTime() - (1000 * 60 * 60 * 24 * 7 * 13)); // 13 weeks
  const workWeeks = getWorkWeeks(start, end);
  workWeeks.forEach(({monday, friday}) => {
    Logger.log('Monday ' + monday + ' -- Friday ' + friday);
  })
}