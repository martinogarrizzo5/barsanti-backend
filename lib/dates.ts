export function isValidDate(d: Date) {
  return d instanceof Date && !isNaN(d as any);
}

export function getTodayDate() {
  var date = new Date();
  date.setHours(0, 0, 0, 0);

  return date;
}

export function getDateWithoutTime(date: Date) {
  date.setHours(0, 0, 0, 0);

  return new Date(date);
}

export function getYesterdayDate() {
  var date = new Date();
  date.setDate(date.getDate() - 1);

  return date;
}
