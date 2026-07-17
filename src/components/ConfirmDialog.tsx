import { useRef } from 'react'
import { useDialogFocus } from '../hooks/useDialogFocus'
import { CloseIcon } from './Icons'

interface ConfirmDialogProps {
  body: string
  confirmLabel: string
  destructive?: boolean
  onCancel: () => void
  onConfirm: () => void
  title: string
}

export function ConfirmDialog({
  body,
  confirmLabel,
  destructive = false,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useDialogFocus({
    containerRef: dialogRef,
    initialFocusRef: cancelRef,
    onEscape: onCancel,
  })

  return (
    <div className="confirm-layer" role="presentation">
      <div
        aria-labelledby="confirm-title"
        aria-modal="true"
        className="confirm-dialog"
        ref={dialogRef}
        role="alertdialog"
      >
        <div className="confirm-heading">
          <h2 id="confirm-title">{title}</h2>
          <button aria-label="확인 창 닫기" className="icon-button" onClick={onCancel} type="button">
            <CloseIcon size={22} />
          </button>
        </div>
        <p>{body}</p>
        <div className="confirm-actions">
          <button className="secondary-button" onClick={onCancel} ref={cancelRef} type="button">취소</button>
          <button
            className={destructive ? 'danger-button' : 'primary-button'}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
