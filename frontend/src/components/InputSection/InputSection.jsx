import { useState, useRef } from 'react'
import './InputSection.css'

export default function InputSection({ mode, setMode, onAnalyzeUrl, onAnalyzeCsv, loading }) {
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const handleSubmitUrl = (e) => {
    e.preventDefault()
    if (url.trim() && !loading) onAnalyzeUrl(url.trim())
  }

  const handleSubmitCsv = () => {
    if (file && !loading) onAnalyzeCsv(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.name.endsWith('.csv')) setFile(dropped)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  return (
    <div className="input-section">
      <div className="input-tabs">
        <button
          className={`input-tab ${mode === 'url' ? 'active' : ''}`}
          onClick={() => setMode('url')}
        >
          YouTube URL
        </button>
        <button
          className={`input-tab ${mode === 'csv' ? 'active' : ''}`}
          onClick={() => setMode('csv')}
        >
          Upload CSV
        </button>
      </div>

      {mode === 'url' ? (
        <form className="input-url-form" onSubmit={handleSubmitUrl}>
          <input
            type="text"
            className="input-field"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-analyze" disabled={loading || !url.trim()}>
            {loading ? (
              <>
                <span className="btn-spinner" />
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </button>
        </form>
      ) : (
        <div className="input-csv-area">
          <div
            className={`csv-drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file ? (
              <p className="csv-filename">{file.name}</p>
            ) : (
              <>
                <svg className="csv-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                <p className="csv-hint">Drop CSV file here or click to browse</p>
              </>
            )}
          </div>
          <button
            className="btn-analyze"
            disabled={loading || !file}
            onClick={handleSubmitCsv}
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Analyzing...
              </>
            ) : (
              'Analyze CSV'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
