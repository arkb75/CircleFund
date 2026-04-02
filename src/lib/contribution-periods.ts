const periodLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function parseDateOnlyString(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const [, yearPart, monthPart, dayPart] = match;
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function isValidDateOnlyString(value: string) {
  return parseDateOnlyString(value) !== null;
}

export function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getContributionPeriodStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function getCurrentContributionPeriodStart(now = new Date()) {
  return getContributionPeriodStart(now);
}

export function formatContributionPeriodLabel(date: Date) {
  return periodLabelFormatter.format(date);
}

export function getTodayDateInputValue(now = new Date()) {
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}
