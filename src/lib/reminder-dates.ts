// Helper function to generate relative dates for reminders
export function getRelativeDate(daysFromNow: number, hours: number = 10, minutes: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function getTodayAt(hours: number, minutes: number = 0): Date {
  return getRelativeDate(0, hours, minutes);
}

export function getTomorrowAt(hours: number, minutes: number = 0): Date {
  return getRelativeDate(1, hours, minutes);
}

export function getYesterdayAt(hours: number, minutes: number = 0): Date {
  return getRelativeDate(-1, hours, minutes);
}

export function getThisWeek(dayOffset: number, hours: number = 10): Date {
  return getRelativeDate(dayOffset, hours);
}

export function getNextWeek(dayOffset: number, hours: number = 10): Date {
  return getRelativeDate(7 + dayOffset, hours);
}