import { useState, useEffect, useRef } from 'react'
import './VideoStats.css'

function useCountUp(target, duration = 1500) {
  const [value, setValue] = useState(0)
  const startRef = useRef(null)
  const num = parseInt(String(target).replace(/,/g, ''), 10) || 0

  useEffect(() => {
    if (num === 0) return
    startRef.current = null

    function step(ts) {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setValue(Math.floor(eased * num))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [num, duration])

  return value
}

const icons = {
  views: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  likes: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
    </svg>
  ),
  comments: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
}

export default function VideoStats({ video }) {
  if (!video) return null

  const views = useCountUp(video.view_count)
  const likes = useCountUp(video.like_count)
  const comments = useCountUp(video.comment_count)

  const stats = [
    { icon: icons.views, value: views, label: 'Views' },
    { icon: icons.likes, value: likes, label: 'Likes' },
    { icon: icons.comments, value: comments, label: 'Comments' },
  ]

  return (
    <div className="video-stats">
      {stats.map((s, i) => (
        <div
          className="stat-card"
          key={s.label}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <span className="stat-icon">{s.icon}</span>
          <span className="stat-value">{s.value.toLocaleString()}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
