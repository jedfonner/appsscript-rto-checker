
/**************** Web Handling Code ****************/
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('RTO Tracker')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**************** RTO Code ****************/

function checkRTO(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const calendarIdToUse = Session.getActiveUser().getEmail();
  const calendar = CalendarApp.getCalendarById(calendarIdToUse);

  const now = new Date();

  const allEvents = calendar.getEvents(start, end);
  const inOfficeDays = getInOfficeDays(start, end, allEvents);
  Logger.log("Total in office from " + start.toDateString() + " to " + end.toDateString() + ": "+ inOfficeDays.length);

  return {
    inOfficeDays: inOfficeDays,
  }
}

function getInOfficeDays(start, end, allEvents) {
  let inOfficeDays = [];
  // const weeks = getWorkWeeks(start, end);
  const weekDays = getWeekDays(start, end);

  for(let i = 0; i < weekDays.length; i++){
    const day = weekDays[i];
    const isOOO = isOutOfOfficeDay(day, allEvents);
    const inOffice = isInOfficeDay(day, allEvents);
    Logger.log("%s -> [isOOO: %s] [inOffice: %s]", day, isOOO, inOffice);
    if (!isOOO && inOffice) {
      inOfficeDays.push(day);
    }
  }
  Logger.log("Total of %s inOfficeDays", inOfficeDays.length)
  return inOfficeDays;
}

/**
 * Checks if there is an Out of Office calendar event on the specified day
 * @param {Date} the specified day
 * @param {Array} the list of calendar events including the specified day
 * @returns {Boolean} true if there is an Out of Office event including the specified day
 */
function isOutOfOfficeDay(day, allEvents) {
  const dayStart = day;
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayStart.getDate() + 1);
  const allOOOs = allEvents.filter(event => event.getEventType() == CalendarApp.EventType.OUT_OF_OFFICE);
  const matchingOOOs = allOOOs.filter(event => {
    // Logger.log(event.getTitle() + " on " + event.getStartTime());
    // const isAllDay = event.isAllDayEvent();
    const eventStart = event.getStartTime();
    const eventEnd = event.getEndTime();
    const inRange = dayStart >= eventStart && dayEnd <= eventEnd
    const fullDay = (eventEnd - eventStart) / (1000 * 60 * 60) >= 8;
    return inRange && fullDay;
  })
  return matchingOOOs.length >= 1;
}

/**
 * Checks the Work Location calendar event on the specified day to see if it represents an in-office day
 * @param {Date} the specified day
 * @param {Array} the list of calendar events including the specified day
 * @returns {Boolean} true if the Work Location for the specified day is in the office
 */
function isInOfficeDay(day, allEvents) {
  const dayStart = day;
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayStart.getDate() + 1);
  const workLocations = allEvents.filter(event => {
    const isAllDay = event.isAllDayEvent();
    const isWorkLocation = event.getEventType() == CalendarApp.EventType.WORKING_LOCATION;
    const eventStart = event.getStartTime();
    const eventEnd = event.getEndTime();
    const inRange = eventStart >= dayStart && eventEnd <= dayEnd;
    return isAllDay && isWorkLocation && inRange;
  })
  if (workLocations.length == 0) {
    return false;
  } else if (workLocations.length == 1) {
    const isOffice = workLocations[0].getTitle().includes("Office");
    if (isOffice) return true;
  } else {
    const nonRecurring = workLocations.filter(event => !event.isRecurringEvent());
    if (nonRecurring.length == 1) {
      const isOffice = nonRecurring[0].getTitle().includes("Office");
      if (isOffice) return true;
    }
  }
  return false;
}


