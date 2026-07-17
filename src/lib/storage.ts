import type { LoadResult, StoredTimetableV1 } from '../types'
import { deduplicateLessons, isLesson } from './timetable'

export const STORAGE_KEY = 'school-timetable:v1'

const LOAD_WARNING = '일부 저장 데이터를 읽지 못해 유효한 수업만 불러왔어요.'
const ROOT_WARNING = '저장된 시간표를 읽지 못해 빈 시간표로 시작했어요.'

export function loadTimetable(storage: Storage = window.localStorage): LoadResult {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) {
      return { lessons: [], warning: null }
    }

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return { lessons: [], warning: ROOT_WARNING }
    }

    const value = parsed as Partial<StoredTimetableV1>
    if (value.version !== 1 || !Array.isArray(value.lessons)) {
      return { lessons: [], warning: ROOT_WARNING }
    }

    const validLessons = value.lessons.filter(isLesson)
    const lessons = deduplicateLessons(validLessons)
    const recovered = validLessons.length !== value.lessons.length || lessons.length !== validLessons.length

    return { lessons, warning: recovered ? LOAD_WARNING : null }
  } catch {
    return { lessons: [], warning: ROOT_WARNING }
  }
}

export function saveTimetable(
  lessons: StoredTimetableV1['lessons'],
  storage: Storage = window.localStorage,
): void {
  const payload: StoredTimetableV1 = { version: 1, lessons }
  storage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearTimetable(storage: Storage = window.localStorage): void {
  storage.removeItem(STORAGE_KEY)
}
