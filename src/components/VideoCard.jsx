import { Play, QrCode } from "lucide-react";
import "./VideoCard.css";

export default function VideoCard({ video, onWatch, onShowQr }) {
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
        <h3 className="vcard__title">{video.title}</h3>
        <p className="vcard__desc">{video.description}</p>
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
      </div>
    </article>
  );
}