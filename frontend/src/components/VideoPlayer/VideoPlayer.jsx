import './VideoPlayer.css'

export default function VideoPlayer({ videoId }) {
  if (!videoId) return null

  return (
    <div className="video-player">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
