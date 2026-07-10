import { useState, useEffect } from 'react'
import './LoadingScreen.css'

const messages = [
  'Fetching comments...',
  'Running sentiment analysis...',
  'Preparing results...',
]

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="loading-screen">
      <div className="loading-track">
        <div className="loading-bar" />
      </div>
      <p className="loading-text">{messages[msgIndex]}</p>
    </div>
  )
}
