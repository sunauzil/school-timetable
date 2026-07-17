import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { STORAGE_KEY } from './lib/storage'

async function addLesson() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: '월요일 1교시 수업 추가' }))
  await user.type(screen.getByLabelText('과목명'), '국어')
  await user.type(screen.getByLabelText('선생님'), '김선생')
  await user.type(screen.getByLabelText('교실'), '2-3 교실')
  await user.click(screen.getByRole('button', { name: '저장' }))
  return user
}

describe('교시표 app', () => {
  it('adds a required, colored lesson and persists it', async () => {
    render(<App />)
    await addLesson()

    expect(screen.getByText('국어')).toBeInTheDocument()
    await waitFor(() => expect(window.localStorage.getItem(STORAGE_KEY)).toContain('국어'))
  })

  it('shows all required-field errors without saving', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '월요일 1교시 수업 추가' }))
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(screen.getByText('과목명을 입력해주세요.')).toBeInTheDocument()
    expect(screen.getByText('선생님 이름을 입력해주세요.')).toBeInTheDocument()
    expect(screen.getByText('교실을 입력해주세요.')).toBeInTheDocument()
  })

  it('edits and deletes an existing lesson', async () => {
    render(<App />)
    const user = await addLesson()

    await user.click(screen.getByRole('button', { name: /월요일 1교시 국어/ }))
    const subjectInput = screen.getByLabelText('과목명')
    await user.clear(subjectInput)
    await user.type(subjectInput, '문학')
    await user.click(screen.getByRole('button', { name: '저장' }))
    expect(screen.getByText('문학')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /월요일 1교시 문학/ }))
    await user.click(screen.getByRole('button', { name: '삭제' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: '삭제' }))

    expect(screen.queryByText('문학')).not.toBeInTheDocument()
  })

  it('blocks moving a lesson into an occupied slot', async () => {
    render(<App />)
    const user = await addLesson()

    await user.click(screen.getByRole('button', { name: '화요일 1교시 수업 추가' }))
    await user.type(screen.getByLabelText('과목명'), '수학')
    await user.type(screen.getByLabelText('선생님'), '이선생')
    await user.type(screen.getByLabelText('교실'), '2-4 교실')
    await user.click(screen.getByRole('button', { name: '저장' }))

    await user.click(screen.getByRole('button', { name: /화요일 1교시 수학/ }))
    await user.selectOptions(screen.getByLabelText('요일'), 'mon')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(screen.getByRole('alert')).toHaveTextContent('이미 수업이 등록된 교시예요.')
  })

  it('restores saved data and clears it after reset confirmation', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      lessons: [{
        id: 'saved-lesson',
        day: 'fri',
        period: 8,
        subject: '자율학습',
        teacher: '담임',
        room: '도서관',
        color: 'gray',
        createdAt: '2026-07-17T00:00:00.000Z',
        updatedAt: '2026-07-17T00:00:00.000Z',
      }],
    }))

    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByText('자율학습')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '초기화' }))
    await user.click(screen.getByRole('button', { name: '전체 초기화' }))

    expect(screen.queryByText('자율학습')).not.toBeInTheDocument()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
