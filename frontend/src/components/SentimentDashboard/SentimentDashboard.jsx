import { useState, useEffect, useRef } from 'react'
import './SentimentDashboard.css'

function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const num = typeof target === 'number' ? target : 0

  useEffect(() => {
    if (num === 0) { setValue(0); return }
    ref.current = null
    function step(ts) {
      if (!ref.current) ref.current = ts
      const p = Math.min((ts - ref.current) / duration, 1)
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setValue(Math.floor(e * num))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [num, duration])
  return value
}

function CircularProgress({ percentage, color, size = 100, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (percentage / 100) * circumference)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage, circumference])

  return (
    <svg className="circular-progress" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  )
}

export default function SentimentDashboard({ sentiment }) {
  if (!sentiment) return null

  const { positive, negative, neutral, total } = sentiment
  const posVal = useCountUp(positive)
  const negVal = useCountUp(negative)
  const neuVal = useCountUp(neutral)

  const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0

  let overallLabel = 'Mixed Sentiment'
  let overallColor = 'neutral'
  if (positive > negative && positive > neutral) {
    overallLabel = 'Predominantly Positive'
    overallColor = 'positive'
  } else if (negative > positive && negative > neutral) {
    overallLabel = 'Predominantly Negative'
    overallColor = 'negative'
  }

  const cards = [
    { label: 'Positive', count: posVal, real: positive, color: 'var(--positive)', hex: '#4ecdc4', key: 'positive' },
    { label: 'Negative', count: negVal, real: negative, color: 'var(--negative)', hex: '#ff6b4a', key: 'negative' },
    { label: 'Neutral', count: neuVal, real: neutral, color: 'var(--neutral)', hex: '#e8b341', key: 'neutral' },
  ]

  return (
    <div className="sentiment-dashboard">
      <div className="dash-header">
        <p className="section-label">Sentiment Breakdown</p>
        <div className="dash-header-right">
          <span className={`verdict-pill verdict-${overallColor}`}>{overallLabel}</span>
          <span className="verdict-total">{total.toLocaleString()} comments analyzed</span>
        </div>
      </div>

      <div className="dash-cards">
        {cards.map((c, i) => (
          <div className="dash-card" key={c.key} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="dash-card-ring">
              <CircularProgress percentage={pct(c.real)} color={c.hex} size={88} strokeWidth={4} />
              <span className="dash-card-pct" style={{ color: c.color }}>{pct(c.real)}%</span>
            </div>
            <div className="dash-card-info">
              <span className="dash-card-count">{c.count.toLocaleString()}</span>
              <span className="dash-card-label">{c.label}</span>
            </div>
            {/* Horizontal proportion bar */}
            <div className="dash-card-bar-track">
              <div
                className="dash-card-bar-fill"
                style={{
                  width: `${pct(c.real)}%`,
                  background: c.hex,
                  transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
