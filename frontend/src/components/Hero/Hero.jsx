import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <span className="hero-label">Comment Analysis</span>
      <h1 className="hero-title">
        Understand your<br />
        <span className="hero-accent">audience</span>
      </h1>
      <div className="hero-line" />
      <p className="hero-subtitle">
        Analyze the sentiment behind every YouTube comment, instantly.
      </p>
    </section>
  )
}
