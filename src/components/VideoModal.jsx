import { useEffect, useState } from "react";
import { X, Play, QrCode } from "lucide-react";
import QRPanel from "./QRPanel";
import { isYouTubeUrl, toYouTubeEmbed } from "../lib/video";
import "./VideoModal.css";

export default function VideoModal({ video, initialView = "watch", onClose }) {
  const [view, setView] = useState(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView, video]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={video.title}>
      <div className="modal__scrim" onClick={onClose} />

      <div className="modal__panel">
        <header className="modal__head">
          <div>
            <h3 className="modal__title">{video.title}</h3>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Isara">
            <X size={20} strokeWidth={1.75} />
          </button>
        </header>

       
        <div className="modal__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={view === "watch"}
            className={`modal__tab ${view === "watch" ? "is-active" : ""}`}
            onClick={() => setView("watch")}
          >
            <Play size={14} strokeWidth={2} /> Panoorin
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "qr"}
            className={`modal__tab ${view === "qr" ? "is-active" : ""}`}
            onClick={() => setView("qr")}
          >
            <QrCode size={14} strokeWidth={2} /> QR Code
          </button>
        </div>

        <div className="modal__body">
          {view === "watch" ? (
            <>
              <div className="modal__player">
                {isYouTubeUrl(video.videoUrl) ? (
                  <iframe
                    src={toYouTubeEmbed(video.videoUrl)}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={video.videoUrl} controls playsInline />
                )}
              </div>
              <p className="modal__desc">{video.description}</p>
            </>
          ) : (
            <QRPanel video={video} />
          )}
        </div>
      </div>
    </div>
  );
}