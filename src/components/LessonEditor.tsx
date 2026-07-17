import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { LESSON_COLORS, PERIODS, WEEKDAYS, type Lesson, type LessonInput } from '../types'
import {
  COLOR_LABELS,
  WEEKDAY_LABELS,
  hasSlotConflict,
  hasValidationErrors,
  normalizeLessonInput,
  validateLessonInput,
  type LessonValidationErrors,
} from '../lib/timetable'
import { useDialogFocus } from '../hooks/useDialogFocus'
import { CloseIcon, TrashIcon } from './Icons'

interface LessonEditorProps {
  active: boolean
  initialValue: LessonInput
  lessonId?: string
  lessons: Lesson[]
  mode: 'add' | 'edit'
  onCancel: () => void
  onDelete?: () => void
  onSave: (input: LessonInput) => void
}

export function LessonEditor({
  active,
  initialValue,
  lessonId,
  lessons,
  mode,
  onCancel,
  onDelete,
  onSave,
}: LessonEditorProps) {
  const [form, setForm] = useState<LessonInput>(initialValue)
  const [errors, setErrors] = useState<LessonValidationErrors>({})
  const [slotError, setSlotError] = useState<string | null>(null)
  const panelRef = useRef<HTMLElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)

  useDialogFocus({
    active,
    containerRef: panelRef,
    initialFocusRef: subjectRef,
    onEscape: onCancel,
  })

  function updateTextField(field: 'subject' | 'teacher' | 'room') {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = normalizeLessonInput(form)
    const nextErrors = validateLessonInput(normalized)
    setErrors(nextErrors)

    const conflict = hasSlotConflict(lessons, normalized.day, normalized.period, lessonId)
    setSlotError(conflict ? '이미 수업이 등록된 교시예요. 다른 교시를 선택해주세요.' : null)

    if (hasValidationErrors(nextErrors) || conflict) {
      return
    }

    onSave(normalized)
  }

  return (
    <aside
      aria-labelledby="lesson-editor-title"
      aria-modal="true"
      className="lesson-editor"
      ref={panelRef}
      role="dialog"
    >
      <div aria-hidden="true" className="sheet-handle" />
      <div className="editor-heading-row">
        <div>
          <h2 id="lesson-editor-title">수업 {mode === 'add' ? '추가' : '수정'}</h2>
          <div className="slot-selectors">
            <select
              aria-label="요일"
              onChange={(event) => {
                setForm((current) => ({ ...current, day: event.target.value as LessonInput['day'] }))
                setSlotError(null)
              }}
              value={form.day}
            >
              {WEEKDAYS.map((day) => (
                <option key={day} value={day}>{WEEKDAY_LABELS[day]}</option>
              ))}
            </select>
            <span aria-hidden="true">·</span>
            <select
              aria-label="교시"
              onChange={(event) => {
                setForm((current) => ({ ...current, period: Number(event.target.value) as LessonInput['period'] }))
                setSlotError(null)
              }}
              value={form.period}
            >
              {PERIODS.map((period) => (
                <option key={period} value={period}>{period}교시</option>
              ))}
            </select>
          </div>
          {slotError ? <p className="field-error slot-error" role="alert">{slotError}</p> : null}
        </div>
        <button aria-label="편집기 닫기" className="icon-button close-button" onClick={onCancel} type="button">
          <CloseIcon />
        </button>
      </div>

      <form className="lesson-form" noValidate onSubmit={handleSubmit}>
        <label className="form-field">
          <span>과목명</span>
          <input
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            aria-invalid={Boolean(errors.subject)}
            autoComplete="off"
            maxLength={30}
            onChange={updateTextField('subject')}
            placeholder="과목명을 입력하세요"
            ref={subjectRef}
            required
            value={form.subject}
          />
          {errors.subject ? <small className="field-error" id="subject-error">{errors.subject}</small> : null}
        </label>

        <div className="form-field-row">
          <label className="form-field">
            <span>선생님</span>
            <input
              aria-describedby={errors.teacher ? 'teacher-error' : undefined}
              aria-invalid={Boolean(errors.teacher)}
              autoComplete="off"
              maxLength={20}
              onChange={updateTextField('teacher')}
              placeholder="선생님 이름 입력"
              required
              value={form.teacher}
            />
            {errors.teacher ? <small className="field-error" id="teacher-error">{errors.teacher}</small> : null}
          </label>

          <label className="form-field">
            <span>교실</span>
            <input
              aria-describedby={errors.room ? 'room-error' : undefined}
              aria-invalid={Boolean(errors.room)}
              autoComplete="off"
              maxLength={30}
              onChange={updateTextField('room')}
              placeholder="교실 입력 (예: 2-3 교실)"
              required
              value={form.room}
            />
            {errors.room ? <small className="field-error" id="room-error">{errors.room}</small> : null}
          </label>
        </div>

        <fieldset className="color-fieldset">
          <legend>색상</legend>
          <div className="color-options">
            {LESSON_COLORS.map((color) => (
              <label className={`color-option color-option--${color}`} key={color}>
                <input
                  checked={form.color === color}
                  name="color"
                  onChange={() => setForm((current) => ({ ...current, color }))}
                  type="radio"
                  value={color}
                />
                <span aria-hidden="true" />
                <span className="sr-only">{COLOR_LABELS[color]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={`editor-actions ${mode === 'edit' ? 'editor-actions--edit' : ''}`}>
          {mode === 'edit' && onDelete ? (
            <button className="delete-button" onClick={onDelete} type="button">
              <TrashIcon size={20} />
              삭제
            </button>
          ) : null}
          <button className="secondary-button" onClick={onCancel} type="button">취소</button>
          <button className="primary-button" type="submit">저장</button>
        </div>
      </form>
    </aside>
  )
}
