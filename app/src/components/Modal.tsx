import { useEffect, useId, type ReactNode } from 'react'
import { HiXMark } from 'react-icons/hi2'

type ModalProps = {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  actions?: ReactNode
  size?: 'small' | 'medium' | 'large'
}

export default function Modal({ open, title, children, onClose, actions, size = 'medium' }: ModalProps) {
  const titleId = useId()
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.classList.remove('modal-open')
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className={`modal-dialog modal-${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-btn modal-close" aria-label="Close dialog" onClick={onClose}>
            <HiXMark />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {actions ? <footer className="modal-actions">{actions}</footer> : null}
      </section>
    </div>
  )
}
