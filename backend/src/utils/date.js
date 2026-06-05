export const toDateOnly = (dateValue) => {
  const date = dateValue instanceof Date ? dateValue : new Date(`${dateValue}T00:00:00.000Z`);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const todayDateOnly = () => toDateOnly(new Date());
