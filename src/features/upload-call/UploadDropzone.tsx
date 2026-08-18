import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { formatBytes } from '../../entities/call/model'
import { IconUpload } from '../../shared/ui/Icons'
import { uploadCall } from './api'

export function UploadDropzone() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation(['upload', 'common'])
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)

  const mutation = useMutation({
    mutationFn: uploadCall,
    onSuccess: call => {
      queryClient.invalidateQueries({ queryKey: ['calls'] })
      navigate(`/calls/${call.id}`)
    },
  })

  function select(next: File | undefined) {
    if (!next) return
    const allowed = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a']
    if (!allowed.includes(next.type) && !/\.(mp3|wav|m4a)$/i.test(next.name)) {
      mutation.reset()
      return
    }
    setFile(next)
  }

  return (
    <div className="upload-layout">
      <section className="content-card upload-card">
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''}`}
          onDragOver={event => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={event => {
            event.preventDefault()
            setDragging(false)
            select(event.dataTransfer.files[0])
          }}
        >
          <div className="upload-icon">
            <IconUpload />
          </div>
          <h2>{file ? file.name : t('upload:dropzone.title')}</h2>
          <p>
            {file
              ? t('upload:dropzone.fileInfo', { size: formatBytes(file.size, i18n.language), type: file.type || 'audio' })
              : t('upload:dropzone.sub')}
          </p>
          <label className="button button-secondary">
            {t('common:actions.chooseFile')}
            <input type="file" accept=".mp3,.wav,.m4a,audio/*" hidden onChange={event => select(event.target.files?.[0])} />
          </label>
          <small>{t('upload:dropzone.supported')}</small>
        </div>

        {mutation.isError && <p className="form-error" style={{ marginTop: '16px' }}>{mutation.error.message}</p>}

        <div className="upload-actions">
          <Link className="button button-ghost" to="/calls">
            {t('common:actions.cancel')}
          </Link>
          <button
            className="button button-primary"
            disabled={!file || mutation.isPending}
            onClick={() => file && mutation.mutate(file)}
          >
            {mutation.isPending ? t('upload:dropzone.uploading') : t('upload:dropzone.start')}
          </button>
        </div>
      </section>

      <aside className="info-card">
        <span className="eyebrow">{t('upload:sidebar.eyebrow')}</span>
        <ol>
          <li>
            <b>{t('upload:sidebar.step1Title')}</b>
            <span>{t('upload:sidebar.step1Sub')}</span>
          </li>
          <li>
            <b>{t('upload:sidebar.step2Title')}</b>
            <span>{t('upload:sidebar.step2Sub')}</span>
          </li>
          <li>
            <b>{t('upload:sidebar.step3Title')}</b>
            <span>{t('upload:sidebar.step3Sub')}</span>
          </li>
          <li>
            <b>{t('upload:sidebar.step4Title')}</b>
            <span>{t('upload:sidebar.step4Sub')}</span>
          </li>
        </ol>
      </aside>
    </div>
  )
}
