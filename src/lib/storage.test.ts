import { describe, expect, it } from 'vitest'
import type { Lesson } from '../types'
import { STORAGE_KEY, clearTimetable, loadTimetable, saveTimetable } from './storage'

const storedLesson: Lesson = {
  id: 'lesson-1',
  day: 'wed',
  period: 4,
  subject: '과학',
  teacher: '최선생',
  room: '과학실',
  color: 'yellow',
  createdAt: '2026-07-17T00:00:00.000Z',
  updatedAt: '2026-07-17T00:00:00.000Z',
}

describe('timetable storage', () => {
  it('round-trips versioned timetable data', () => {
    saveTimetable([storedLesson])
    expect(loadTimetable()).toEqual({ lessons: [storedLesson], warning: null })
  })

  it('recovers valid lessons and warns about invalid records', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      lessons: [storedLesson, { id: 'broken' }],
    }))

    const result = loadTimetable()
    expect(result.lessons).toEqual([storedLesson])
    expect(result.warning).toContain('일부 저장 데이터')
  })

  it('falls back safely when JSON is corrupt', () => {
    window.localStorage.setItem(STORAGE_KEY, '{bad-json')
    expect(loadTimetable()).toEqual({
      lessons: [],
      warning: '저장된 시간표를 읽지 못해 빈 시간표로 시작했어요.',
    })
  })

  it('removes the stored timetable', () => {
    saveTimetable([storedLesson])
    clearTimetable()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
