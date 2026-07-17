import type { MouseEvent } from 'react'
import { PlusIcon } from './Icons'

interface AppHeaderProps {
  canAdd: boolean
  canReset: boolean
  onAdd: (opener: HTMLButtonElement) => void
  onReset: (opener: HTMLButtonElement) => void
}

export function AppHeader({ canAdd, canReset, onAdd, onReset }: AppHeaderProps) {
  function handleAdd(event: MouseEvent<HTMLButtonElement>) {
    onAdd(event.currentTarget)
  }

  function handleReset(event: MouseEvent<HTMLButtonElement>) {
    onReset(event.currentTarget)
  }

  return (
    <header className="app-header">
      <h1>교시표</h1>
      <div className="header-actions">
        <button className="reset-button" disabled={!canReset} onClick={handleReset} type="button">
          초기화
        </button>
        <button
          aria-label="수업 추가"
          className="add-button"
          disabled={!canAdd}
          onClick={handleAdd}
          type="button"
        >
          <PlusIcon className="add-button-icon" />
          <span>수업 추가</span>
        </button>
      </div>
    </header>
  )
}
