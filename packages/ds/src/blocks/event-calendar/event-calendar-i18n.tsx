// Title: Event Calendar I18n
// Description: Default UI texts, date-format strings, and formatter functions for the event calendar, fully overridable per key.

import { format, isSameMonth, isSameYear, subMilliseconds } from "@/lib/date-fns-compat/index";
import {
  type DictionaryNamespace,
  type NamespaceOverrides,
  resolveNamespace,
} from "@/lib/i18n/i18n";
import type { CalendarView, EventCalendarDateRange } from "./event-calendar-types";

type EventCalendarI18nConfig = {
  labels: {
    today: string;
    previous: string;
    next: string;
    addEvent: string;
    /** Aria-label of a day's add button; `date` is formatted with `formats.dayAria`. */
    addEventOn: (date: string) => string;
    allDay: string;
    more: (count: number) => string;
    noEvents: string;
    loading: string;
    event: string;
    events: (count: number) => string;
    selectView: string;
    week: (weekNumber: number) => string;
    resources: string;
    goToDate: string;
    /** Cursor hint while a drag/resize hovers a rejected position. */
    dropNotAllowed: string;
    /** Aria-label suffix on chip segments that continue past the cell. */
    continues: string;
    /** Agenda label for the first day of a multi-day event. */
    timeFrom: (time: string) => string;
    /** Agenda label for the last day of a multi-day event. */
    timeUntil: (time: string) => string;
    /** View-switcher shortcut hint characters, per view. */
    viewShortcuts: Record<CalendarView, string>;
    /** Aria-label of the agenda day collapse/expand toggle. */
    toggleDayEvents: (count: number, expanded: boolean) => string;
    /** Aria-label of the agenda event details toggle. */
    eventDetails: (title: string) => string;
    /** Compact "+N" overflow (agenda summary dot stack). */
    moreCompact: (count: number) => string;
    /** Joins a bounded from-to time span. */
    timeRange: (from: string, to: string) => string;
  };
  viewNames: {
    month: string;
    week: string;
    day: string;
    days: (count: number) => string;
    agenda: string;
    resource: string;
  };
  /** date-fns format strings, applied with the calendar `locale`. */
  formats: {
    monthTitle: string;
    /** Undefined = smart cross-month range via functions.formatTitle. */
    weekTitle?: string;
    dayTitle: string;
    /** Undefined = smart range label via functions.formatTitle. */
    agendaTitle?: string;
    monthDayHeader: string;
    /** Narrow variant used by the month view below the compact breakpoint. */
    monthDayHeaderNarrow: string;
    timeGridDayHeader: string;
    agendaDayHeader: string;
    /** Agenda date-gutter day number. */
    agendaDayNumber: string;
    /** Agenda date-gutter weekday label. */
    agendaWeekday: string;
    /** "+N more" popover day header. */
    moreDayHeader: string;
    /** Month cell aria-label date. */
    monthCellAriaLabel: string;
    /** Time-grid day column aria-label date. */
    dayAria: string;
    /** Undefined = the resource view title falls back to dayTitle. */
    resourceTitle?: string;
    timeGutter: string;
    /** Sub-hour gutter labels (interval below 60 minutes). */
    timeGutterMinute: string;
    eventTime: string;
    monthCellDay: string;
    /** A range label inside one month: its start and end. */
    rangeMonthStart: string;
    rangeMonthEnd: string;
    /** A range label inside one year: its start. */
    rangeYearStart: string;
    /** The ends of a range label that crosses years, and the end inside one year. */
    rangeFull: string;
    /** The date of a multi-day event, and of a day range. */
    shortDate: string;
  };
  functions: {
    formatTitle: (
      view: CalendarView,
      ctx: {
        date: Date;
        activeRange: EventCalendarDateRange;
        visibleRange: EventCalendarDateRange;
        locale?: string;
      },
    ) => string;
    formatEventTime: (
      start: Date,
      end: Date,
      allDay: boolean,
      /** date-fns options (the calendar `locale`); trailing so a 3-arg override still fits. */
      opts?: { locale?: string },
    ) => string;
    formatDayRange: (range: EventCalendarDateRange, opts?: { locale?: string }) => string;
    /** Chip native tooltip text; return undefined to drop the attribute. */
    formatEventLabel?: (title: string, timeLabel: string) => string | undefined;
    /** Chip aria-label composition. */
    formatEventAriaLabel?: (title: string, timeLabel: string, continues: boolean) => string;
  };
};

declare global {
  interface FmaNamespaces {
    eventCalendar: EventCalendarI18nConfig;
  }
}

const DEFAULT_LABELS: EventCalendarI18nConfig["labels"] = {
  today: "Today",
  previous: "Previous",
  next: "Next",
  addEvent: "Add event",
  addEventOn: (date) => `Add event on ${date}`,
  allDay: "All day",
  more: (count) => `+${count} more`,
  noEvents: "No events",
  loading: "Loading events",
  event: "event",
  events: (count) => (count === 1 ? "1 event" : `${count} events`),
  selectView: "Select view",
  week: (weekNumber) => `W${weekNumber}`,
  resources: "Resources",
  goToDate: "Go to date",
  dropNotAllowed: "Can't place here",
  continues: "continues",
  timeFrom: (time) => `From ${time}`,
  timeUntil: (time) => `Until ${time}`,
  viewShortcuts: {
    month: "M",
    week: "W",
    day: "D",
    days: "5",
    agenda: "A",
    resource: "R",
  },
  toggleDayEvents: (count) => (count === 1 ? "1 event" : `${count} events`),
  eventDetails: (title) => title,
  moreCompact: (count) => `+${count}`,
  timeRange: (from, to) => `${from} - ${to}`,
};

const DEFAULT_VIEW_NAMES: EventCalendarI18nConfig["viewNames"] = {
  month: "Month",
  week: "Week",
  day: "Day",
  days: (count) => (count === 1 ? "1 day" : `${count} days`),
  agenda: "Agenda",
  resource: "Resources",
};

const DEFAULT_FORMATS: EventCalendarI18nConfig["formats"] = {
  monthTitle: "MMMM yyyy",
  weekTitle: undefined,
  dayTitle: "EEEE, MMMM d, yyyy",
  agendaTitle: undefined,
  monthDayHeader: "EEE",
  monthDayHeaderNarrow: "EEEEE",
  timeGridDayHeader: "EEE d",
  agendaDayHeader: "EEEE, MMMM d",
  agendaDayNumber: "d",
  agendaWeekday: "EEE",
  moreDayHeader: "EEEE, MMMM d",
  monthCellAriaLabel: "PPPP",
  dayAria: "PPPP",
  resourceTitle: undefined,
  timeGutter: "h a",
  timeGutterMinute: "h:mm a",
  eventTime: "h:mm a",
  monthCellDay: "d",
  rangeMonthStart: "MMMM d",
  rangeMonthEnd: "d, yyyy",
  rangeYearStart: "MMM d",
  rangeFull: "MMM d, yyyy",
  shortDate: "MMM d",
};

/**
 * Default formatting functions BOUND to a config's labels/formats, so that
 * `formats` overrides flow into the default renderers (a consumer overriding
 * formats.monthTitle without replacing formatTitle still sees it applied).
 */
function makeDefaultFunctions(
  cfg: Pick<EventCalendarI18nConfig, "labels" | "formats">,
): EventCalendarI18nConfig["functions"] {
  return {
    formatTitle: (view, { date, activeRange, locale }) => {
      const opts = { locale };
      if (view === "month") {
        return format(date, cfg.formats.monthTitle, opts);
      }
      if (view === "resource") {
        return format(date, cfg.formats.resourceTitle ?? cfg.formats.dayTitle, opts);
      }
      if (view === "day") {
        return format(date, cfg.formats.dayTitle, opts);
      }
      if (view === "week" && cfg.formats.weekTitle) {
        return format(date, cfg.formats.weekTitle, opts);
      }
      if (view === "agenda" && cfg.formats.agendaTitle) {
        return format(date, cfg.formats.agendaTitle, opts);
      }
      // week / days / agenda: smart range label, last day is activeRange.end - 1ms.
      // subMilliseconds keeps the zoned date type (a plain new Date(ms)
      // would flip the label to the machine zone near midnight)
      const rangeEnd = subMilliseconds(activeRange.end, 1);
      const start = activeRange.start;
      if (isSameMonth(start, rangeEnd)) {
        return `${format(start, cfg.formats.rangeMonthStart, opts)} - ${format(rangeEnd, cfg.formats.rangeMonthEnd, opts)}`;
      }
      if (isSameYear(start, rangeEnd)) {
        return `${format(start, cfg.formats.rangeYearStart, opts)} - ${format(rangeEnd, cfg.formats.rangeFull, opts)}`;
      }
      return `${format(start, cfg.formats.rangeFull, opts)} - ${format(rangeEnd, cfg.formats.rangeFull, opts)}`;
    },
    formatEventTime: (start, end, allDay, opts) => {
      if (allDay) return cfg.labels.allDay;
      const fmt = cfg.formats.eventTime;
      // Multi-day timed events carry the date on both sides. Compare calendar
      // days off the last rendered instant (end is exclusive, so a 14:00 to
      // midnight event still ends on the start day). Elapsed ms would miss an
      // exactly-24h event and a DST day that only runs 23 hours.
      const lastInstant = end.getTime() - 1 >= start.getTime() ? subMilliseconds(end, 1) : start;
      if (format(start, "yyyy-MM-dd") !== format(lastInstant, "yyyy-MM-dd")) {
        const dated = `${cfg.formats.shortDate}, ${fmt}`;
        return `${format(start, dated, opts)} - ${format(end, dated, opts)}`;
      }
      return `${format(start, fmt, opts)} - ${format(end, fmt, opts)}`;
    },
    formatDayRange: (range, opts) => {
      // subMilliseconds keeps the zoned date type, same reason as formatTitle
      const rangeEnd = subMilliseconds(range.end, 1);
      const day = cfg.formats.shortDate;
      return `${format(range.start, day, opts)} - ${format(rangeEnd, day, opts)}`;
    },
  };
}

export const eventCalendarEn: DictionaryNamespace<EventCalendarI18nConfig> = {
  labels: DEFAULT_LABELS,
  viewNames: DEFAULT_VIEW_NAMES,
  formats: DEFAULT_FORMATS,
  functions: makeDefaultFunctions,
};

const DEFAULT_EVENT_CALENDAR_I18N = resolveNamespace<EventCalendarI18nConfig>([eventCalendarEn]);

/**
 * One level deeper than `Partial`, because the merge below is per nested
 * section: overriding a single label must not force a consumer to restate the
 * other 22. Unknown keys are still rejected by the excess property check.
 */
type EventCalendarI18nOverrides = NamespaceOverrides<EventCalendarI18nConfig>;

/**
 * Shallow merge per nested object, matching the filters.tsx i18n contract:
 * a partial override replaces individual keys, never whole sections. Default
 * functions are re-bound to the MERGED labels/formats; explicit `functions`
 * overrides still win.
 */
function mergeEventCalendarI18n(overrides?: EventCalendarI18nOverrides): EventCalendarI18nConfig {
  return resolveNamespace<EventCalendarI18nConfig>([eventCalendarEn], [overrides]);
}

export type { EventCalendarI18nConfig, EventCalendarI18nOverrides };
export { DEFAULT_EVENT_CALENDAR_I18N, mergeEventCalendarI18n };
