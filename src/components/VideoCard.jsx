import { Check, ListChecks, Play, QrCode } from "lucide-react";
import "./VideoCard.css";

export default function VideoCard({ video, progress, onWatch, onShowQr, onActivities }) {
  return (
    <article className="vcard">
      <div className="vcard__poster">
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="vcard__thumb"
            loading="lazy"
          />
        )}
        <button
          type="button"
          className="vcard__play"
          onClick={() => onWatch(video)}
          aria-label={`Panoorin ang ${video.title}`}
        >
          <Play size={24} strokeWidth={2.5} fill="currentColor" />
        </button>
      </div>

      <div className="vcard__body">
        <div className={`vcard__status ${progress?.completed ? "is-complete" : ""}`}>{progress?.completed && <Check size={12} />}{progress?.label || "Hindi pa nasisimulan"}</div>
        <h3 className="vcard__title">{video.title}</h3>
        <p className="vcard__desc">{video.description}</p>
        <div className="vcard__progress" aria-label={`${progress?.percent || 0}% kumpleto`}><span style={{ width: `${progress?.percent || 0}%` }} /></div>
      </div>

      <div className="vcard__actions">
        <button type="button" className="vcard__btn vcard__btn--solid" onClick={() => onWatch(video)}>
          <Play size={15} strokeWidth={2.5} fill="currentColor" />
          Panoorin
        </button>
        <button
          type="button"
          className="vcard__btn"
          onClick={() => onShowQr(video)}
          aria-label={`Gawa ng QR para sa ${video.title}`}
        >
          <QrCode size={15} strokeWidth={2} />
          QR
        </button>
        {progress?.watched && <button type="button" className="vcard__btn" onClick={() => onActivities(video)}><ListChecks size={15} /> Gawain</button>}
      </div>
    </article>
  );
}
