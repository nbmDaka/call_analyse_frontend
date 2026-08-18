import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatBytes } from '../../entities/call/model'
import { IconUpload } from '../../shared/ui/Icons'
import { uploadCall } from './api'

export function UploadDropzone() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
          <h2>{file ? file.name : 'Drop a recording here'}</h2>
          <p>{file ? `${formatBytes(file.size)} · ${file.type || 'audio file'}` : 'or choose an audio file from your computer'}</p>
          <label className="button button-secondary">
            Choose file
            <input type="file" accept=".mp3,.wav,.m4a,audio/*" hidden onChange={event => select(event.target.files?.[0])} />
          </label>
          <small>Supported formats: MP3, WAV, M4A</small>
        </div>

        {mutation.isError && <p className="form-error" style={{ marginTop: '16px' }}>{mutation.error.message}</p>}

        <div className="upload-actions">
          <Link className="button button-ghost" to="/calls">
            Cancel
          </Link>
          <button
            className="button button-primary"
            disabled={!file || mutation.isPending}
            onClick={() => file && mutation.mutate(file)}
          >
            {mutation.isPending ? 'Uploading…' : 'Start analysis'}
          </button>
        </div>
      </section>

      <aside className="info-card">
        <span className="eyebrow">WHAT HAPPENS NEXT</span>
        <ol>
          <li>
            <b>Upload</b>
            <span>Your recording is securely stored and parsed.</span>
          </li>
          <li>
            <b>Transcription</b>
            <span>The conversation is converted to text.</span>
          </li>
          <li>
            <b>Analysis</b>
            <span>AI evaluates the call against 8 core criteria.</span>
          </li>
          <li>
            <b>Coaching insights</b>
            <span>Review strengths and recommended next actions.</span>
          </li>
        </ol>
      </aside>
    </div>
  )
}
