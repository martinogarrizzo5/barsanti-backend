export function isValidDate(d: Date) {
  return d instanceof Date && !isNaN(d as any);
}

export function getYesterdayDate() {
  var date = new Date();
  date.setDate(date.getDate() - 1);

  return date;
}
