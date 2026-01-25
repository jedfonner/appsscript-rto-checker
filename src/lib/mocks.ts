const EXCLUSIONS: Record<string, string[]> = {
  'US': [
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

// Add your server functions here
export const mocks: ServerFunctions = {
  getHolidaysAndExclusions: (country, startStr, endStr) => {
    const result = (EXCLUSIONS[country] || []).filter(dateStr => dateStr >= startStr && dateStr <= endStr);
    // console.log('[MOCK] Server function getHolidaysAndExclusions completed:', result);
    return result;
  },
  checkRTO(startStr, endStr) {
    const result = {
      inOfficeDays: [
        '2025-10-20',
        '2025-10-21',
        '2025-10-23',
        '2025-10-27',
        '2025-10-28',
        '2025-10-30',
        '2025-11-03',
        '2025-11-04',
        '2025-11-06',
        '2025-11-12',
        '2025-11-13',
        '2025-11-18',
        '2025-11-22',
        '2025-11-23',
        '2025-12-01',
        '2025-12-02',
        '2025-12-04',
        '2025-12-08',
        '2025-12-09',
        '2025-12-11',
        '2025-12-16',
        '2026-01-06',
        '2026-01-08',
        '2026-01-12',
        '2026-01-13',
        '2026-01-18'].filter(dateStr => dateStr >= startStr && dateStr <= endStr)
    } // Mocked RTO dates
    // console.log('[MOCK] Server function checkRTO completed:', result);
    return result;
  }
  // You can add more mock server functions here as needed
}
