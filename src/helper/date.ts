import dayjs, { Dayjs } from "dayjs";

export const SECOND = 1;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;
export const MONTH = 30 * DAY;
export const YEAR = 365 * DAY;

const months: Record<number, string> = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "Desember",
};

export function birthDateToDayjs(day?: number, month?: number, year?: number): Dayjs | null {
  if (day && month && year) {
    return dayjs()
      .set("M", month - 1)
      .set("year", year)
      .set("D", day);
  }

  return null;
}

export const getMonthString = (month: number) => {
  return months[month];
};

export const getDate = (year?: number, month?: number, day?: number) => {
  return year && year > 0
    ? month && month > 0
      ? day && day > 0
        ? `${day} ${getMonthString(month)} ${year}`
        : `${getMonthString(month)} ${year}`
      : `${year}`
    : undefined;
};

export const getAge = (year?: number, month?: number, day?: number): [number, string] => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentDay = new Date().getDate();

  if (year && year > 0) {
    if (month && month > 0) {
      if (currentMonth < month - 1) {
        const age = currentYear - year - 1;
        if (age <= 0) {
          return getMonthAge(month, day);
        }

        if (age === 1) {
          return [age, "year"];
        }

        return [age, "years"];
      }

      if (day && day > 0) {
        if (currentDay < day) {
          const age = currentYear - year - 1;
          if (age <= 0) {
            return getMonthAge(month, day);
          }

          if (age === 1) {
            return [age, "year"];
          }

          return [age, "years"];
        }
      }
    }

    const age = currentYear - year;
    if (age === 1) {
      return [age, "year"];
    }

    return [age, "years"];
  }

  return [0, "year"];
};

export const getMonthAge = (month: number, day?: number): [number, string] => {
  const currentMonth = new Date().getMonth();
  const currentDay = new Date().getDate();

  if (currentMonth > month - 1) {
    const age = currentMonth - month - 1;
    if (age === 1) {
      return [age, "month"];
    }

    return [age, "months"];
  }

  if (currentMonth < month - 1) {
    const age = 12 + currentMonth - month;
    if (age === 1) {
      return [age, "month"];
    }

    return [age, "months"];
  }

  if (day) {
    if (currentDay > day) {
      const age = currentDay - day;
      if (age === 1) {
        return [age, "day"];
      }

      return [age, "days"];
    }
  }

  return [0, "month"];
};
