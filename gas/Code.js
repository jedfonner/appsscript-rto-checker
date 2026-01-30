
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

/**************** Server-Side Functions ****************/
// These are called from the Client

/**
 * Gets the holidays and exclusions that are not counted in the required in-office day calculations
 * This is stored in Apps Script and called from the client to make exclusions easy to update
 * @param {String} country
 * @param {String} startStr
 * @param {String} endStr
 * @return {Array<String>} array of date strings representing holidays and exclusions for the specified country within the date range
 */
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
  const allEventData = createEventProjection(allEvents);
  const inOfficeDays = getInOfficeDays(start, end, allEventData);
  Logger.log("Total in office from " + start.toDateString() + " to " + end.toDateString() + ": " + inOfficeDays.length);

  // Return strings not Dates because DAte objects break GAS HTMLService communication
  return {
    inOfficeDays: inOfficeDays.map(date => date.toISOString().slice(0, 10)),
  }
}

/* ************************ RTO Helper Methods **************************** */
function getInOfficeDays(start, end, allEventData) {
  let inOfficeDays = [];
  // const weeks = getWorkWeeks(start, end);
  const weekDays = getWeekDays(start, end);

  for (let i = 0; i < weekDays.length; i++) {
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


