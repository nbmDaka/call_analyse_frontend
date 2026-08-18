import React from 'react'
import type { Analysis } from '../../entities/call/model'

function ListBlock({ title, items }: { title: string; items?: string[] }) {
  return (
    <div className="insight-block">
      <h3>{title}</h3>
      {items?.length ? (
        <ul>
          {items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">No observations recorded.</p>
      )}
    </div>
  )
}

export function AIFeedback({ analysis }: { analysis: Analysis }) {
  return (
    <section className="content-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">AI FEEDBACK</span>
          <h2>Analysis summary</h2>
        </div>
      </div>
      <p className="lead">{analysis.summary}</p>
      <div className="insights-grid">
        <ListBlock title="Customer needs" items={analysis.needs} />
        <ListBlock title="Objections" items={analysis.objections} />
        <ListBlock title="Manager strengths" items={analysis.strengths} />
        <ListBlock title="Manager mistakes" items={analysis.mistakes} />
      </div>
      <div className="next-action">
        <span className="eyebrow">RECOMMENDED NEXT ACTION</span>
        <p>{analysis.nextAction}</p>
      </div>
    </section>
  )
}
