import { useState } from "react";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";
import { useVideos } from "../hooks/useVideos";
import "./VideoReel.css";

export default function VideoReel() {
  const { videos } = useVideos();
  const [active, setActive] = useState(null);
  const [initialView, setInitialView] = useState("watch");

  function openWatch(video) {
    setInitialView("watch");
    setActive(video);
  }

  function openQr(video) {
    setInitialView("qr");
    setActive(video);
  }

  return (
    <section className="reel" id="mga-kwento">
      <div className="container">
        <div className="reel__head">
          <span className="reel__eyebrow">Mga Kwento</span>
          <h2 className="reel__heading">Piliin ang Kwento</h2>
          <p className="reel__intro">
            Tatlong kwento, Panoorin online,
            i-scan ang QR code.
          </p>
        </div>
      </div>

      <div className="reel__sprocket" aria-hidden="true" />

      <div className="container">
        <div className="reel__grid">
          {videos.map((video, i) => (
            <div
              className="reel__cell"
              key={video.id}
              style={{ "--reveal-delay": `${i * 0.09}s` }}
            >
              <VideoCard video={video} onWatch={openWatch} onShowQr={openQr} />
            </div>
          ))}
        </div>
      </div>

      {active && (
        <VideoModal video={active} initialView={initialView} onClose={() => setActive(null)} />
      )}
    </section>
  );
}