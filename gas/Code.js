
/**************** Web Handling Code ****************/
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('RTO Tracker')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setFaviconUrl('https://cdn-icons-png.flaticon.com/512/17434/17434197.png');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**************** RTO Code ****************/

 const EXCLUSIONS = {
  'US':[
    '2025-09-01', // Labor Day
    '2025-10-13', // Columbus Day
    '2025-11-11', // Veterans Day
    '2025-11-24',
    '2025-11-25',
    '2025-11-26',
    '2025-11-27', // Thanksgiving
    '2025-11-28',
    '2025-12-22',
    '2025-12-23',
    '2025-12-24',
    '2025-12-25', // Christmas
    '2025-12-26',
    '2025-12-29',
    '2025-12-30',
    '2025-12-31', // New Year's Eve
    '2026-01-01', // New Year's Day
    '2026-01-02',
    '2026-01-19', // MLK Day
    '2026-02-16', // Presidents Day
    '2026-05-25', // Memorial Day
    '2026-06-19', // Juneteenth
    '2026-06-29',
    '2026-06-30',
    '2026-07-01',
    '2026-07-02',
    '2026-07-03', // Independence Day observed
    '2026-09-07', // Labor Day
    '2026-10-12', // Columbus Day
    '2026-11-11', // Veterans Day
    '2026-11-23',
    '2026-11-24',
    '2026-11-25',
    '2026-11-26', // Thanksgiving
    '2026-11-27',
  ]
}

// Returns array of date strings representing holidays and exclusions for the specified country within the date range
// This is stored in Apps Script and called from the client to make exclusions easy to update
function getHolidaysAndExclusions(country, startStr, endStr) {
  Logger.log("Getting holidays and exclusions for %s from %s to %s", country, startStr, endStr);
  const result = EXCLUSIONS[country] || [];
  return result.filter(dateStr => {
    const date = new Date(dateStr);
    const start = new Date(startStr);
    const end = new Date(endStr);
    return date >= start && date <= end;
  });
}

/*
Uses string params not dates because "Requests fail if you attempt to pass a Date..."
from the docs: https://developers.google.com/apps-script/guides/html/reference/run#myFunction(...)
*/
function checkRTO(startStr, endStr) {
  Logger.log("Checking RTO from %s to %s", startStr, endStr);
  const start = new Date(startStr);
  const end = new Date(endStr);
  const calendarIdToUse = Session.getActiveUser().getEmail();
  const calendar = CalendarApp.getCalendarById(calendarIdToUse);

  const now = new Date();
  Logger.log("Getting all events from %s to %s", start, end);
  const allEvents = calendar.getEvents(start, end);

  /* Making a repeated getXYZ() calls in the helper methods is slow. Faster to get all data once here. */
  const allEventData = allEvents.map(event => {
    const title = event.getTitle();
    const startTime = event.getStartTime();
    const endTime = event.getEndTime();
    const eventType = event.getEventType();
    const isAllDayEvent = event.isAllDayEvent();
    const isRecurringEvent = event.isRecurringEvent();

    return {
      title: title,
      startTime: startTime,
      endTime: endTime,
      eventType: eventType,
      isAllDayEvent: isAllDayEvent,
      isRecurringEvent: isRecurringEvent
    }
  });

  const inOfficeDays = getInOfficeDays(start, end, allEventData);
  Logger.log("Total in office from " + start.toDateString() + " to " + end.toDateString() + ": "+ inOfficeDays.length);

  // Return strings not Dates because DAte objects break GAS HTMLService communication
  return {
    inOfficeDays: inOfficeDays.map(date => date.toISOString().slice(0,10)),
  }
}

function getInOfficeDays(start, end, allEventData) {
  let inOfficeDays = [];
  // const weeks = getWorkWeeks(start, end);
  const weekDays = getWeekDays(start, end);

  for(let i = 0; i < weekDays.length; i++){
    const day = weekDays[i];
    const isOOO = isOutOfOfficeDay(day, allEventData);
    const inOffice = isInOfficeDay(day, allEventData);
    // Logger.log("%s -> [isOOO: %s] [inOffice: %s]", day, isOOO, inOffice);
    if (!isOOO && inOffice) {
      inOfficeDays.push(day);
    }
  }
  // Logger.log("Total of %s inOfficeDays", inOfficeDays.length)
  return inOfficeDays;
}

/**
 * Checks if there is an Out of Office calendar event on the specified day
 * @param {Date} the specified day
 * @param {Array} the list of calendar events including the specified day
 * @returns {Boolean} true if there is an Out of Office event including the specified day
 */
function isOutOfOfficeDay(day, allEventData) {
  const dayStart = day;
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayStart.getDate() + 1);
  const matchingOOOs = allEventData.filter(event => {
    if (event.eventType != CalendarApp.EventType.OUT_OF_OFFICE) return false;
    const eventStart = event.startTime;
    const eventEnd = event.endTime;
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
function isInOfficeDay(day, allEventData) {
  const dayStart = day;
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayStart.getDate() + 1);
  const workLocations = allEventData.filter(event => {
    if (!event.isAllDayEvent) return false;
    if (event.eventType != CalendarApp.EventType.WORKING_LOCATION) return false;
    const eventStart = event.startTime;
    const eventEnd = event.endTime;
    const inRange = eventStart >= dayStart && eventEnd <= dayEnd;
    return inRange;
  })
  if (workLocations.length == 0) {
    return false;
  } else if (workLocations.length == 1) {
    const isOffice = workLocations[0].title.includes("Office");
    if (isOffice) return true;
  } else {
    const nonRecurring = workLocations.filter(event => !event.isRecurringEvent);
    if (nonRecurring.length == 1) {
      const isOffice = nonRecurring[0].title.includes("Office");
      if (isOffice) return true;
    }
  }
  return false;
}


