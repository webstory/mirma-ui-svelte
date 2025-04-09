/// Calendar functions

export interface CalendarDay {
  year: number;
  month: number;
  day: number;
  week: number;
  dayOfWeek: number;
  dayOfWeekStr: string;
  dateString: string;
}

export function buildCalendar(year: number, locale: string = 'en-US') {
  const day = new Date(year, 0, 1);

  if(day.getDay() !== 0) {
    day.setDate(day.getDate() - day.getDay());
  }

  const days: CalendarDay[] = [];

  while (day.getFullYear() <= year || day.getDay() !== 0) {
    const week = getWeek(day);
    days.push({
      year: day.getFullYear(),
      month: day.getMonth() + 1,
      day: day.getDate(),
      week: week,
      dayOfWeek: day.getDay(),
      dayOfWeekStr: Intl.DateTimeFormat(locale, { weekday: 'long' }).format(day),
      dateString: day.toISOString().split('T')[0],
    });
    day.setDate(day.getDate() + 1);
  }

  return days;
}

export function getWeek(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.floor(days / 7) + 1;
}

export class Calendar {
  private readonly year: number;
  private readonly days: CalendarDay[];

  constructor(year: number) {
    this.year = year;
    this.days = buildCalendar(year);
  }

  getDays(): CalendarDay[] {
    return this.days;
  }

  getDaysInMonth(month: number): CalendarDay[] {
    return this.days.filter(day => day.month === month);
  }

  getDaysInWeek(week: number): CalendarDay[] {
    return this.days.filter(day => day.week === week);
  }

  groupByMonth(): Record<number, CalendarDay[]> {
    const months: Record<number, CalendarDay[]> = {};
    this.days.forEach(day => {
      if (!months[day.month]) {
        months[day.month] = [];
      }
      months[day.month].push(day);
    });
    return months;
  }

  groupByWeek(): Record<number, CalendarDay[]> {
    const weeks: Record<number, CalendarDay[]> = {};
    this.days.forEach(day => {
      if (!weeks[day.week]) {
        weeks[day.week] = [];
      }
      weeks[day.week].push(day);
    });
    return weeks;
  }

  getYear(): number {
    return this.year;
  }
}