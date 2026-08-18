import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../features/auth/useAuth'
import { canUpload } from '../../entities/user/model'
import { getCalls } from '../../features/calls-list/api'
import { CallTable } from '../../features/calls-list/CallTable'
import { PageHeader } from '../../shared/ui/PageHeader'
import { ErrorState } from '../../shared/ui/ErrorState'
import { LoadingLine } from '../../shared/ui/LoadingLine'
import { IconUpload } from '../../shared/ui/Icons'

export function CallsPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const calls = useQuery({ queryKey: ['calls', page], queryFn: () => getCalls(page) })

  return (
    <>
      <PageHeader
        eyebrow="CALL LIBRARY"
        title="Calls"
        action={
          canUpload(user?.role) && (
            <Link className="button button-primary" to="/calls/new">
              <IconUpload />
              Upload call
            </Link>
          )
        }
      />
      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>All recordings</h2>
            <p className="muted">Review processing status and open detailed analysis.</p>
          </div>
          {calls.data && <span className="result-count">{calls.data.total} total</span>}
        </div>
        {calls.isLoading ? (
          <LoadingLine />
        ) : calls.isError ? (
          <ErrorState message={calls.error.message} />
        ) : (
          <>
            <CallTable calls={calls.data?.calls ?? []} />
            {(calls.data?.totalPages ?? 1) > 1 && (
              <div className="pagination">
                <span>
                  Page {page} of {calls.data?.totalPages}
                </span>
                <div className="pagination-controls">
                  <button disabled={page === 1} onClick={() => setPage(value => value - 1)}>
                    ← Previous
                  </button>
                  <button disabled={page === calls.data?.totalPages} onClick={() => setPage(value => value + 1)}>
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
