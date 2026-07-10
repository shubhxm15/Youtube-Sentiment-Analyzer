import { useEffect, useState, useRef } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import './SentimentChart.css'

ChartJS.register(ArcElement, Tooltip)

const COLORS = {
  positive: '#4ecdc4',
  negative: '#ff6b4a',
  neutral: '#e8b341',
}

/* Custom animated horizontal bars — no Chart.js needed */
function HorizontalBars({ sentiment }) {
  const { positive, negative, neutral, total } = sentiment
  const [animate, setAnimate] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimate(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const pct = (n) => total > 0 ? ((n / total) * 100).toFixed(1) : '0.0'
  const maxVal = Math.max(positive, negative, neutral, 1)

  const bars = [
    { label: 'Positive', value: positive, pct: pct(positive), color: COLORS.positive, width: (positive / maxVal) * 100 },
    { label: 'Negative', value: negative, pct: pct(negative), color: COLORS.negative, width: (negative / maxVal) * 100 },
    { label: 'Neutral', value: neutral, pct: pct(neutral), color: COLORS.neutral, width: (neutral / maxVal) * 100 },
  ]

  return (
    <div className="hbar-container" ref={ref}>
      {bars.map((b, i) => (
        <div className="hbar-row" key={b.label}>
          <div className="hbar-label-row">
            <span className="hbar-label">{b.label}</span>
            <span className="hbar-value">{b.value.toLocaleString()} <span className="hbar-pct">({b.pct}%)</span></span>
          </div>
          <div className="hbar-track">
            <div
              className="hbar-fill"
              style={{
                width: animate ? `${b.width}%` : '0%',
                background: `linear-gradient(90deg, ${b.color}, ${b.color}cc)`,
                transitionDelay: `${i * 0.15}s`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* Center text plugin for doughnut */
const centerPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx, width, height } = chart
    const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0)
    ctx.save()

    ctx.font = `700 1.6rem 'Space Grotesk', system-ui, sans-serif`
    ctx.fillStyle = '#e8e6e3'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(total.toLocaleString(), width / 2, height / 2 - 10)

    ctx.font = `400 0.72rem 'DM Sans', system-ui, sans-serif`
    ctx.fillStyle = '#555560'
    ctx.fillText('COMMENTS', width / 2, height / 2 + 14)

    ctx.restore()
  },
}

export default function SentimentChart({ sentiment }) {
  if (!sentiment) return null
  const { positive, negative, neutral } = sentiment

  const doughnutData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [{
      data: [positive, negative, neutral],
      backgroundColor: [COLORS.positive, COLORS.negative, COLORS.neutral],
      borderWidth: 0,
      cutout: '72%',
      spacing: 3,
      borderRadius: 4,
    }],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 1400,
      animateRotate: true,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1c28',
        titleColor: '#e8e6e3',
        bodyColor: '#8a8a8e',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { family: "'Space Grotesk', sans-serif", weight: '600' },
        bodyFont: { family: "'DM Sans', sans-serif" },
        callbacks: {
          label: function (ctx) {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
            const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : '0.0'
            return ` ${ctx.raw.toLocaleString()} (${pct}%)`
          }
        }
      },
    },
  }

  return (
    <div className="chart-section">
      <div className="chart-card chart-card-bars">
        <h3 className="chart-title">Distribution</h3>
        <HorizontalBars sentiment={sentiment} />
      </div>
      <div className="chart-card chart-card-doughnut">
        <h3 className="chart-title">Composition</h3>
        <div className="doughnut-wrap">
          <Doughnut data={doughnutData} options={doughnutOptions} plugins={[centerPlugin]} />
        </div>
        {/* Legend */}
        <div className="chart-legend">
          {[
            { label: 'Positive', color: COLORS.positive },
            { label: 'Negative', color: COLORS.negative },
            { label: 'Neutral', color: COLORS.neutral },
          ].map((item) => (
            <div className="legend-item" key={item.label}>
              <span className="legend-dot" style={{ background: item.color }} />
              <span className="legend-text">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
