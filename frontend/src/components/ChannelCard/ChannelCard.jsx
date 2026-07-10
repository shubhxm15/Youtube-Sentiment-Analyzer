import './ChannelCard.css'

export default function ChannelCard({ channel }) {
  if (!channel) return null

  const formatCount = (n) => {
    const num = parseInt(String(n).replace(/,/g, ''), 10) || 0
    return num.toLocaleString()
  }

  return (
    <div className="channel-card">
      <div className="channel-header">
        <img
          className="channel-avatar"
          src={channel.logo_url}
          alt={channel.title}
        />
        <div className="channel-info">
          <h2 className="channel-name">{channel.title}</h2>
          {channel.description && (
            <p className="channel-desc">{channel.description}</p>
          )}
        </div>
      </div>
      <div className="channel-meta">
        <span>{formatCount(channel.video_count)} videos</span>
        <span className="meta-dot">&middot;</span>
        <span>{formatCount(channel.subscriber_count)} subscribers</span>
        <span className="meta-dot">&middot;</span>
        <span>Created {channel.created_date}</span>
      </div>
    </div>
  )
}
