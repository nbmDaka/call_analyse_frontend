import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createCompanyWorkspace } from './api'
import { useWorkspace } from './useWorkspace'

export interface CreateWorkspaceModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const { t } = useTranslation('common')
  const { reload, selectWorkspace } = useWorkspace()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const created = await createCompanyWorkspace(name.trim())
      await reload()
      selectWorkspace(created.id)
      setName('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h3>{t('workspace.createTitle', 'Создать компанию')}</h3>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <label className="field-label">
              <span>{t('workspace.companyNameLabel', 'Название компании')}</span>
              <input
                type="text"
                required
                className="input"
                placeholder={t('workspace.companyNamePlaceholder', 'Например: ТОО Вектор')}
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </label>
          </div>
          <footer className="modal-footer">
            <button type="button" className="button button-ghost" onClick={onClose} disabled={loading}>
              {t('actions.cancel')}
            </button>
            <button type="submit" className="button button-primary" disabled={loading || !name.trim()}>
              {loading ? t('loading.default') : t('workspace.createAction', 'Создать компанию')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
