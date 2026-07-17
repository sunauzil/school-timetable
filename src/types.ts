export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const
export const LESSON_COLORS = [
  'lavender',
  'blue',
  'mint',
  'yellow',
  'orange',
  'pink',
  'green',
  'gray',
] as const

export type Weekday = (typeof WEEKDAYS)[number]
export type Period = (typeof PERIODS)[number]
export type LessonColor = (typeof LESSON_COLORS)[number]

export interface Lesson {
  id: string
  day: Weekday
  period: Period
  subject: string
  teacher: string
  room: string
  color: LessonColor
  createdAt: string
  updatedAt: string
}

export interface LessonInput {
  day: Weekday
  period: Period
  subject: string
  teacher: string
  room: string
  color: LessonColor
}

export interface StoredTimetableV1 {
  version: 1
  lessons: Lesson[]
}

export type TimetableAction =
  | { type: 'add'; lesson: Lesson }
  | { type: 'update'; lesson: Lesson }
  | { type: 'remove'; id: string }
  | { type: 'reset' }

export type EditorState =
  | { mode: 'add'; day: Weekday; period: Period }
  | { mode: 'edit'; lessonId: string; day: Weekday; period: Period }

export interface LoadResult {
  lessons: Lesson[]
  warning: string | null
}
