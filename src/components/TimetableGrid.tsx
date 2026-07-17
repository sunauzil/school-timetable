import type { MouseEvent } from 'react'
import { PERIODS, WEEKDAYS, type Lesson, type Period, type Weekday } from '../types'
import { SHORT_WEEKDAY_LABELS, WEEKDAY_LABELS, findLesson } from '../lib/timetable'
import { PlusIcon } from './Icons'

interface TimetableGridProps {
  lessons: Lesson[]
  onOpenLesson: (lesson: Lesson, opener: HTMLButtonElement) => void
  onSelectEmpty: (day: Weekday, period: Period, opener: HTMLButtonElement) => void
  selectedSlot?: { day: Weekday; period: Period }
}

export function TimetableGrid({ lessons, onOpenLesson, onSelectEmpty, selectedSlot }: TimetableGridProps) {
  function handleCellClick(
    day: Weekday,
    period: Period,
    lesson: Lesson | undefined,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    if (lesson) {
      onOpenLesson(lesson, event.currentTarget)
      return
    }
    onSelectEmpty(day, period, event.currentTarget)
  }

  return (
    <section aria-label="주간 시간표" className="timetable-section">
      <div aria-hidden="true" className="weekday-headings">
        <span />
        {WEEKDAYS.map((day) => (
          <span key={day}>
            <span className="weekday-full">{WEEKDAY_LABELS[day]}</span>
            <span className="weekday-short">{SHORT_WEEKDAY_LABELS[day]}</span>
          </span>
        ))}
      </div>

      <div aria-colcount={5} aria-rowcount={8} className="timetable-grid" role="grid">
        {PERIODS.map((period) => (
          <div className="timetable-row" key={period} role="row">
            <div aria-label={`${period}교시`} className="period-heading" role="rowheader">
              <span className="period-full">{period}교시</span>
              <span className="period-short">{period}</span>
            </div>
            {WEEKDAYS.map((day) => {
              const lesson = findLesson(lessons, day, period)
              const selected = selectedSlot?.day === day && selectedSlot.period === period
              const label = lesson
                ? `${WEEKDAY_LABELS[day]} ${period}교시 ${lesson.subject}, ${lesson.teacher}, ${lesson.room} 수정`
                : `${WEEKDAY_LABELS[day]} ${period}교시 수업 추가`

              return (
                <div className="cell-frame" key={`${day}-${period}`} role="gridcell">
                  <button
                    aria-label={label}
                    className={`lesson-cell ${lesson ? `lesson-cell--${lesson.color}` : 'lesson-cell--empty'} ${selected ? 'lesson-cell--selected' : ''}`}
                    onClick={(event) => handleCellClick(day, period, lesson, event)}
                    type="button"
                  >
                    {lesson ? (
                      <>
                        <strong>{lesson.subject}</strong>
                        <span>{lesson.teacher} · {lesson.room}</span>
                      </>
                    ) : (
                      <PlusIcon className="empty-cell-plus" size={24} />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
