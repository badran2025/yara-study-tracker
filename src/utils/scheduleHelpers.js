// Schedule & Time Helper Utilities for Yara's Study Tracker

export const DAYS_OF_WEEK = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة"
];

// Mapping Arabic day name to JS Date getDay() index (0=Sunday ... 6=Saturday)
export const DAY_TO_JS_DAY = {
  "الأحد": 0,
  "الاثنين": 1,
  "الثلاثاء": 2,
  "الأربعاء": 3,
  "الخميس": 4,
  "الجمعة": 5,
  "السبت": 6
};

export const JS_DAY_TO_NAME = {
  0: "الأحد",
  1: "الاثنين",
  2: "الثلاثاء",
  3: "الأربعاء",
  4: "الخميس",
  5: "الجمعة",
  6: "السبت"
};

/**
 * Split time range into start and end parts safely
 * Handles: "10:00 ص - 11:00 ص", "10:00 ص إلى 11:00 ص", "10:00 ص", etc.
 */
export function splitTimeRange(timeStr) {
  if (!timeStr) return { start: '', end: '', raw: '' };
  
  const clean = timeStr.trim();
  // Split on dash, en-dash, em-dash, or arabic "إلى" / "حتى"
  const parts = clean.split(/[-–—]|(?:\s+إلى\s+)|\s+حتى\s+/);

  if (parts.length >= 2) {
    return {
      start: parts[0].trim(),
      end: parts[1].trim(),
      raw: clean
    };
  }

  return {
    start: clean,
    end: '',
    raw: clean
  };
}

/**
 * Parses a single time string like "10:00 ص", "01:30 م", "12:00 م" into minutes from midnight (0 - 1439)
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;

  // Convert Arabic-Indic numerals (٠-٩) to Western (0-9)
  const normalized = timeStr
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .trim();

  // Match hour, minute, and optional period (ص/م or am/pm)
  const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(ص|م|am|pm)?/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3] ? match[3].toLowerCase() : '';

  const isPM = period === 'م' || period === 'pm';
  const isAM = period === 'ص' || period === 'am';

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Sorts an array of classes chronologically from earliest to latest in the day
 */
export function sortClassesChronologically(classes) {
  if (!Array.isArray(classes)) return [];
  return [...classes].sort((a, b) => {
    const aStart = parseTimeToMinutes(splitTimeRange(a.time).start);
    const bStart = parseTimeToMinutes(splitTimeRange(b.time).start);
    return aStart - bStart;
  });
}

/**
 * Formats a time string cleanly for display without BiDi reversal bugs
 */
export function formatTimeDisplay(timeStr) {
  const { start, end } = splitTimeRange(timeStr);
  if (!start) return { start: '', end: '', label: timeStr || '' };
  if (!end) return { start, end: '', label: `الساعة ${start}` };
  return {
    start,
    end,
    label: `من ${start} إلى ${end}`
  };
}

/**
 * Computes the real-time NEXT upcoming tutoring class relative to the current clock
 */
export function getNextUpcomingClass(schedule, subjects = [], targetSubjectId = null) {
  if (!Array.isArray(schedule) || schedule.length === 0) return null;

  let filtered = schedule;
  if (targetSubjectId) {
    filtered = schedule.filter(c => c.subjectId === targetSubjectId);
    if (filtered.length === 0) return null;
  }

  const now = new Date();
  const currentJsDay = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Score each class by how many minutes in the future it is
  const scored = filtered.map(cls => {
    const classJsDay = DAY_TO_JS_DAY[cls.day] !== undefined ? DAY_TO_JS_DAY[cls.day] : 6;
    let daysDiff = (classJsDay - currentJsDay + 7) % 7;

    const { start, end } = splitTimeRange(cls.time);
    const startMinutes = parseTimeToMinutes(start);
    const endMinutes = end ? parseTimeToMinutes(end) : (startMinutes + 60);

    let isToday = daysDiff === 0;
    let isOngoing = false;
    let minutesUntil = 0;

    if (isToday) {
      if (currentMinutes < startMinutes) {
        // Today, later
        minutesUntil = startMinutes - currentMinutes;
      } else if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        // Happening right now!
        isOngoing = true;
        minutesUntil = -1; // Prioritize ongoing
      } else {
        // Already ended today, next occurrence is next week
        daysDiff = 7;
        minutesUntil = (7 * 24 * 60) + (startMinutes - currentMinutes);
      }
    } else {
      minutesUntil = (daysDiff * 24 * 60) + (startMinutes - currentMinutes);
    }

    return {
      cls,
      daysDiff,
      minutesUntil,
      isToday,
      isOngoing,
      startMinutes
    };
  });

  // Sort by minutesUntil: ongoing first (-1), then upcoming positive smallest
  scored.sort((a, b) => {
    if (a.isOngoing && !b.isOngoing) return -1;
    if (!a.isOngoing && b.isOngoing) return 1;
    return a.minutesUntil - b.minutesUntil;
  });

  const next = scored[0];
  if (!next) return null;

  const sub = subjects.find(s => s.id === next.cls.subjectId);
  const { start, end } = splitTimeRange(next.cls.time);

  let relativeDay = "";
  if (next.isOngoing) {
    relativeDay = "جارية الآن 🔴";
  } else if (next.daysDiff === 0) {
    relativeDay = `اليوم (${next.cls.day})`;
  } else if (next.daysDiff === 1) {
    relativeDay = `غداً (${next.cls.day})`;
  } else if (next.daysDiff === 2) {
    relativeDay = `بعد غد (${next.cls.day})`;
  } else {
    relativeDay = `يوم ${next.cls.day} القادم`;
  }

  return {
    ...next.cls,
    id: next.cls.id,
    subjectName: sub?.name || next.cls.subjectId,
    teacher: next.cls.teacher || sub?.teacherName || 'معلم المادة',
    startTime: start,
    endTime: end,
    formattedTime: end ? `من ${start} إلى ${end}` : start,
    relativeDay,
    isOngoing: next.isOngoing,
    isToday: next.isToday,
    daysDiff: next.daysDiff
  };
}
