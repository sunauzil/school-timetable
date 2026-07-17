import { describe, expect, it } from 'vitest'
import type { Lesson, LessonInput } from '../types'
import {
  createLesson,
  deduplicateLessons,
  findFirstEmptySlot,
  hasSlotConflict,
  timetableReducer,
  validateLessonInput,
} from './timetable'

const validInput: LessonInput = {
  day: 'mon',
  period: 1,
  subject: '국어',
  teacher: '김선생',
  room: '2-3 교실',
  color: 'lavender',
}

function lesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: 'lesson-1',
    createdAt: '2026-07-17T00:00:00.000Z',
    updatedAt: '2026-07-17T00:00:00.000Z',
    ...validInput,
    ...overrides,
  }
}

describe('lesson validation', () => {
  it('requires every text field', () => {
    expect(validateLessonInput({ ...validInput, subject: ' ', teacher: '', room: '' })).toEqual({
      subject: '과목명을 입력해주세요.',
      teacher: '선생님 이름을 입력해주세요.',
      room: '교실을 입력해주세요.',
    })
  })

  it('detects an occupied slot while allowing the current lesson', () => {
    const lessons = [lesson()]
    expect(hasSlotConflict(lessons, 'mon', 1)).toBe(true)
    expect(hasSlotConflict(lessons, 'mon', 1, 'lesson-1')).toBe(false)
  })
})

describe('timetable operations', () => {
  it('adds, updates, removes, and resets lessons immutably', () => {
    const first = lesson()
    const added = timetableReducer([], { type: 'add', lesson: first })
    const updatedLesson = { ...first, subject: '문학' }
    const updated = timetableReducer(added, { type: 'update', lesson: updatedLesson })
    const removed = timetableReducer(updated, { type: 'remove', id: first.id })

    expect(added).toEqual([first])
    expect(updated[0].subject).toBe('문학')
    expect(removed).toEqual([])
    expect(timetableReducer(added, { type: 'reset' })).toEqual([])
  })

  it('keeps the latest lesson when stored slots are duplicated', () => {
    const latest = lesson({ id: 'lesson-2', subject: '수학' })
    expect(deduplicateLessons([lesson(), latest])).toEqual([latest])
  })

  it('finds the first empty slot in period-first order', () => {
    expect(findFirstEmptySlot([lesson()])).toEqual({ day: 'tue', period: 1 })
  })

  it('creates a normalized lesson with metadata', () => {
    const created = createLesson({ ...validInput, subject: '  국어  ' })
    expect(created.subject).toBe('국어')
    expect(created.id).toBeTruthy()
    expect(created.createdAt).toBe(created.updatedAt)
  })
})
