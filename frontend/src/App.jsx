import { useState, useRef } from 'react'
import NetworkBackground from './components/NetworkBackground/NetworkBackground'
import Hero from './components/Hero/Hero'
import InputSection from './components/InputSection/InputSection'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import ChannelCard from './components/ChannelCard/ChannelCard'
import VideoPlayer from './components/VideoPlayer/VideoPlayer'
import VideoStats from './components/VideoStats/VideoStats'
import SentimentDashboard from './components/SentimentDashboard/SentimentDashboard'
import SentimentChart from './components/SentimentChart/SentimentChart'
import './App.css'

function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('url')
  const resultsRef = useRef(null)

  const dismissError = () => setError(null)

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }

  const handleAnalyzeUrl = async (youtubeLink) => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtube_link: youtubeLink }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Analysis failed (${response.status})`)
      }

      const data = await response.json()
      setResults({ ...data, type: 'url' })
      scrollToResults()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeCsv = async (file) => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/analyze-csv', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `CSV analysis failed (${response.status})`)
      }

      const data = await response.json()
      setResults({ ...data, type: 'csv' })
      scrollToResults()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <NetworkBackground />

      {error && (
        <div className="error-bar">
          <p>{error}</p>
          <button className="error-dismiss" onClick={dismissError}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <main className="app-main">
        <Hero />
        <InputSection
          mode={mode}
          setMode={setMode}
          onAnalyzeUrl={handleAnalyzeUrl}
          onAnalyzeCsv={handleAnalyzeCsv}
          loading={loading}
        />

        {loading && <LoadingScreen />}

        {results && !loading && (
          <div className="results-section" ref={resultsRef}>
            {results.type === 'url' && (
              <>
                <div className="results-grid-top">
                  <ChannelCard channel={results.channel} />
                  <VideoPlayer videoId={results.video_id} />
                </div>
                <VideoStats video={results.video} />
              </>
            )}
            <SentimentDashboard sentiment={results.sentiment} />
            <SentimentChart sentiment={results.sentiment} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>YouTube Sentiment Analyzer</p>
      </footer>
    </div>
  )
}

export default App
