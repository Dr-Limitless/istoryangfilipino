import { useState } from "react";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";
import CourseProgress from "./CourseProgress";
import { useVideos } from "../hooks/useVideos";
import { loadActivityProgress, loadVideoProgress } from "../lib/progress";
import "./VideoReel.css";

export default function VideoReel() {
  const { videos } = useVideos();
  const [active, setActive] = useState(null);
  const [initialView, setInitialView] = useState("watch");
  const [progressRevision, setProgressRevision] = useState(0);

  function openWatch(video) {
    setInitialView("watch");
    setActive(video);
  }

  function openQr(video) {
    setInitialView("qr");
    setActive(video);
  }

  function openActivities(video) {
    setInitialView("activities");
    setActive(video);
  }

  function progressFor(video) {
    const watched = loadVideoProgress(video.id);
    const activity = loadActivityProgress(video.id);
    const vocabulary = Math.min(1, (activity?.matchedVocabulary?.length || 0) / 5);
    const gameFinished = activity?.gameStatus === "won" || activity?.gameStatus === "failed";
    const reflection = Boolean(activity?.reflection?.trim()?.length >= 20);
    const percent = Math.round((watched.finished ? 25 : (watched.percent || 0) * 25) + vocabulary * 25 + (gameFinished ? 25 : 0) + (reflection ? 25 : 0));
    return {
      watched: Boolean(watched.finished),
      completed: Boolean(activity?.completed),
      percent,
      label: activity?.completed ? "Kumpleto" : activity ? "Ipagpatuloy ang gawain" : watched.finished ? "Handa na ang gawain" : watched.percent ? `${Math.round(watched.percent * 100)}% napanood` : "Hindi pa nasisimulan",
    };
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
        <CourseProgress videos={videos} revision={progressRevision} />
        <div className="reel__grid">
          {videos.map((video, i) => (
            <div
              className="reel__cell"
              key={video.id}
              style={{ "--reveal-delay": `${i * 0.09}s` }}
            >
              <VideoCard video={video} progress={progressFor(video)} onWatch={openWatch} onShowQr={openQr} onActivities={openActivities} />
            </div>
          ))}
        </div>
      </div>

      {active && (
        <VideoModal video={active} initialView={initialView} onProgressChange={() => setProgressRevision((value) => value + 1)} onClose={() => { setActive(null); setProgressRevision((value) => value + 1); }} />
      )}
    </section>
  );
}
