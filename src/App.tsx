import { useReducer, useRef, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { ConfirmDialog } from './components/ConfirmDialog'
import { LessonEditor } from './components/LessonEditor'
import { TimetableGrid } from './components/TimetableGrid'
import { clearTimetable, loadTimetable, saveTimetable } from './lib/storage'
import {
  createLesson,
  findFirstEmptySlot,
  timetableReducer,
  updateLesson,
} from './lib/timetable'
import type { EditorState, Lesson, LessonInput, TimetableAction } from './types'
import './styles.css'

type Confirmation =
  | { kind: 'reset' }
  | { kind: 'delete'; lessonId: string; subject: string }

interface StatusMessage {
  message: string
  tone: 'default' | 'warning' | 'error'
}

const DEFAULT_COLOR: LessonInput['color'] = 'lavender'

function getEmptyInput(editor: EditorState): LessonInput {
  return {
    day: editor.day,
    period: editor.period,
    subject: '',
    teacher: '',
    room: '',
    color: DEFAULT_COLOR,
  }
}

function getLessonInput(lesson: Lesson): LessonInput {
  return {
    day: lesson.day,
    period: lesson.period,
    subject: lesson.subject,
    teacher: lesson.teacher,
    room: lesson.room,
    color: lesson.color,
  }
}

export default function App() {
  const [initialLoad] = useState(loadTimetable)
  const [lessons, dispatch] = useReducer(timetableReducer, initialLoad.lessons)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [status, setStatus] = useState<StatusMessage>(() => ({
    message: initialLoad.warning ?? (initialLoad.lessons.length === 0
      ? '빈 칸을 눌러 첫 수업을 추가하세요.'
      : '이 기기에 자동 저장됨'),
    tone: initialLoad.warning ? 'warning' : 'default',
  }))
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const statusTimerRef = useRef<number | null>(null)

  function showSavedStatus(message: string) {
    if (statusTimerRef.current !== null) {
      window.clearTimeout(statusTimerRef.current)
    }
    setStatus({ message, tone: 'default' })
    statusTimerRef.current = window.setTimeout(() => {
      setStatus({ message: '이 기기에 자동 저장됨', tone: 'default' })
      statusTimerRef.current = null
    }, 1400)
  }

  function commitLessons(action: TimetableAction, nextLessons: Lesson[], successMessage: string) {
    dispatch(action)
    try {
      saveTimetable(nextLessons)
      showSavedStatus(successMessage)
    } catch {
      if (statusTimerRef.current !== null) {
        window.clearTimeout(statusTimerRef.current)
        statusTimerRef.current = null
      }
      setStatus({
        message: '저장에 실패했어요. 이 탭을 닫기 전에 다시 시도해주세요.',
        tone: 'error',
      })
    }
  }

  const editorLesson = editor?.mode === 'edit'
    ? lessons.find((lesson) => lesson.id === editor.lessonId)
    : undefined

  function rememberOpener(opener: HTMLButtonElement) {
    openerRef.current = opener
  }

  function restoreOpenerFocus() {
    requestAnimationFrame(() => openerRef.current?.focus())
  }

  function closeEditor() {
    setEditor(null)
    restoreOpenerFocus()
  }

  function openAdd(day: LessonInput['day'], period: LessonInput['period'], opener: HTMLButtonElement) {
    rememberOpener(opener)
    setEditor({ mode: 'add', day, period })
  }

  function openGlobalAdd(opener: HTMLButtonElement) {
    const emptySlot = findFirstEmptySlot(lessons)
    if (!emptySlot) {
      setStatus({ message: '모든 교시에 수업이 등록되어 있어요.', tone: 'warning' })
      return
    }

    openAdd(emptySlot.day, emptySlot.period, opener)
  }

  function openLesson(lesson: Lesson, opener: HTMLButtonElement) {
    rememberOpener(opener)
    setEditor({ mode: 'edit', lessonId: lesson.id, day: lesson.day, period: lesson.period })
  }

  function saveEditor(input: LessonInput) {
    if (!editor) {
      return
    }

    if (editor.mode === 'add') {
      const lesson = createLesson(input)
      commitLessons({ type: 'add', lesson }, [...lessons, lesson], '수업을 추가했어요.')
    } else {
      const existing = lessons.find((lesson) => lesson.id === editor.lessonId)
      if (!existing) {
        setStatus({ message: '수업을 찾지 못했어요. 다시 선택해주세요.', tone: 'error' })
        closeEditor()
        return
      }
      const lesson = updateLesson(existing, input)
      const nextLessons = lessons.map((item) => (item.id === lesson.id ? lesson : item))
      commitLessons({ type: 'update', lesson }, nextLessons, '수업을 수정했어요.')
    }

    closeEditor()
  }

  function requestReset(opener: HTMLButtonElement) {
    rememberOpener(opener)
    setConfirmation({ kind: 'reset' })
  }

  function requestDelete() {
    if (editor?.mode !== 'edit' || !editorLesson) {
      return
    }
    setConfirmation({ kind: 'delete', lessonId: editorLesson.id, subject: editorLesson.subject })
  }

  function cancelConfirmation() {
    const shouldRestoreHeaderFocus = confirmation?.kind === 'reset'
    setConfirmation(null)
    if (shouldRestoreHeaderFocus) {
      restoreOpenerFocus()
    }
  }

  function confirmAction() {
    if (!confirmation) {
      return
    }

    if (confirmation.kind === 'reset') {
      try {
        clearTimetable()
        dispatch({ type: 'reset' })
        setEditor(null)
        setStatus({ message: '시간표를 초기화했어요.', tone: 'default' })
        setConfirmation(null)
        restoreOpenerFocus()
      } catch {
        setStatus({ message: '초기화에 실패했어요. 잠시 후 다시 시도해주세요.', tone: 'error' })
        setConfirmation(null)
        restoreOpenerFocus()
      }
      return
    }

    const nextLessons = lessons.filter((lesson) => lesson.id !== confirmation.lessonId)
    commitLessons(
      { type: 'remove', id: confirmation.lessonId },
      nextLessons,
      '수업을 삭제했어요.',
    )
    setConfirmation(null)
    closeEditor()
  }

  const editorInitialValue = editor
    ? editorLesson
      ? getLessonInput(editorLesson)
      : getEmptyInput(editor)
    : null

  const editorKey = editor
    ? editor.mode === 'edit'
      ? `edit-${editor.lessonId}`
      : `add-${editor.day}-${editor.period}`
    : 'closed'

  return (
    <div className="app-shell">
      <AppHeader
        canAdd={lessons.length < 40}
        canReset={lessons.length > 0}
        onAdd={openGlobalAdd}
        onReset={requestReset}
      />

      <main className={`app-main ${editor ? 'app-main--editor-open' : ''}`}>
        <div className="schedule-pane">
          <TimetableGrid
            lessons={lessons}
            onOpenLesson={openLesson}
            onSelectEmpty={openAdd}
            selectedSlot={editor ? { day: editor.day, period: editor.period } : undefined}
          />
          <p aria-live="polite" className={`storage-status storage-status--${status.tone}`}>
            {status.message}
          </p>
        </div>

        {editor && editorInitialValue ? (
          <LessonEditor
            active={!confirmation}
            initialValue={editorInitialValue}
            key={editorKey}
            lessonId={editor.mode === 'edit' ? editor.lessonId : undefined}
            lessons={lessons}
            mode={editor.mode}
            onCancel={closeEditor}
            onDelete={editor.mode === 'edit' ? requestDelete : undefined}
            onSave={saveEditor}
          />
        ) : null}
      </main>

      {confirmation ? (
        <ConfirmDialog
          body={confirmation.kind === 'reset'
            ? '등록된 모든 수업이 이 기기에서 삭제됩니다.'
            : `“${confirmation.subject}” 수업을 시간표에서 삭제합니다.`}
          confirmLabel={confirmation.kind === 'reset' ? '전체 초기화' : '삭제'}
          destructive
          onCancel={cancelConfirmation}
          onConfirm={confirmAction}
          title={confirmation.kind === 'reset' ? '시간표를 초기화할까요?' : '수업을 삭제할까요?'}
        />
      ) : null}
    </div>
  )
}
