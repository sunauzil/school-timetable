import {
  LESSON_COLORS,
  PERIODS,
  WEEKDAYS,
  type Lesson,
  type LessonInput,
  type Period,
  type TimetableAction,
  type Weekday,
} from '../types'

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: '월요일',
  tue: '화요일',
  wed: '수요일',
  thu: '목요일',
  fri: '금요일',
}

export const SHORT_WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
}

export const COLOR_LABELS = {
  lavender: '라벤더',
  blue: '블루',
  mint: '민트',
  yellow: '옐로',
  orange: '오렌지',
  pink: '핑크',
  green: '그린',
  gray: '그레이',
} as const

export interface LessonValidationErrors {
  subject?: string
  teacher?: string
  room?: string
}

export function timetableReducer(lessons: Lesson[], action: TimetableAction): Lesson[] {
  switch (action.type) {
    case 'add':
      return [...lessons, action.lesson]
    case 'update':
      return lessons.map((lesson) => (lesson.id === action.lesson.id ? action.lesson : lesson))
    case 'remove':
      return lessons.filter((lesson) => lesson.id !== action.id)
    case 'reset':
      return []
  }
}

export function normalizeLessonInput(input: LessonInput): LessonInput {
  return {
    ...input,
    subject: input.subject.trim(),
    teacher: input.teacher.trim(),
    room: input.room.trim(),
  }
}

export function validateLessonInput(input: LessonInput): LessonValidationErrors {
  const normalized = normalizeLessonInput(input)
  const errors: LessonValidationErrors = {}

  if (!normalized.subject) {
    errors.subject = '과목명을 입력해주세요.'
  } else if (normalized.subject.length > 30) {
    errors.subject = '과목명은 30자 이하로 입력해주세요.'
  }

  if (!normalized.teacher) {
    errors.teacher = '선생님 이름을 입력해주세요.'
  } else if (normalized.teacher.length > 20) {
    errors.teacher = '선생님 이름은 20자 이하로 입력해주세요.'
  }

  if (!normalized.room) {
    errors.room = '교실을 입력해주세요.'
  } else if (normalized.room.length > 30) {
    errors.room = '교실은 30자 이하로 입력해주세요.'
  }

  return errors
}

export function hasValidationErrors(errors: LessonValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

export function hasSlotConflict(
  lessons: Lesson[],
  day: Weekday,
  period: Period,
  excludedLessonId?: string,
): boolean {
  return lessons.some(
    (lesson) =>
      lesson.day === day && lesson.period === period && lesson.id !== excludedLessonId,
  )
}

export function findLesson(
  lessons: Lesson[],
  day: Weekday,
  period: Period,
): Lesson | undefined {
  return lessons.find((lesson) => lesson.day === day && lesson.period === period)
}

export function findFirstEmptySlot(lessons: Lesson[]): { day: Weekday; period: Period } | null {
  for (const period of PERIODS) {
    for (const day of WEEKDAYS) {
      if (!hasSlotConflict(lessons, day, period)) {
        return { day, period }
      }
    }
  }

  return null
}

export function createLesson(input: LessonInput): Lesson {
  const now = new Date().toISOString()
  return {
    ...normalizeLessonInput(input),
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
}

export function updateLesson(existing: Lesson, input: LessonInput): Lesson {
  return {
    ...existing,
    ...normalizeLessonInput(input),
    updatedAt: new Date().toISOString(),
  }
}

export function isWeekday(value: unknown): value is Weekday {
  return typeof value === 'string' && WEEKDAYS.includes(value as Weekday)
}

export function isPeriod(value: unknown): value is Period {
  return typeof value === 'number' && PERIODS.includes(value as Period)
}

export function isLesson(value: unknown): value is Lesson {
  if (!value || typeof value !== 'object') {
    return false
  }

  const lesson = value as Record<string, unknown>
  return (
    typeof lesson.id === 'string' &&
    isWeekday(lesson.day) &&
    isPeriod(lesson.period) &&
    typeof lesson.subject === 'string' &&
    lesson.subject.trim().length > 0 &&
    lesson.subject.length <= 30 &&
    typeof lesson.teacher === 'string' &&
    lesson.teacher.trim().length > 0 &&
    lesson.teacher.length <= 20 &&
    typeof lesson.room === 'string' &&
    lesson.room.trim().length > 0 &&
    lesson.room.length <= 30 &&
    typeof lesson.color === 'string' &&
    LESSON_COLORS.includes(lesson.color as Lesson['color']) &&
    typeof lesson.createdAt === 'string' &&
    typeof lesson.updatedAt === 'string'
  )
}

export function deduplicateLessons(lessons: Lesson[]): Lesson[] {
  const bySlot = new Map<string, Lesson>()
  for (const lesson of lessons) {
    bySlot.set(`${lesson.day}-${lesson.period}`, lesson)
  }
  return Array.from(bySlot.values())
}
