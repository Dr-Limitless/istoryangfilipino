import { useState } from "react";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";
import CourseProgress from "./CourseProgress";
import { useVideos } from "../hooks/useVideos";
import "./VideoReel.css";
import { activitySummary } from "../lib/activitySummary";
import Leaderboard from "./Leaderboard";

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
    const { watched, activity, percent, completed } = activitySummary(video);
    return { watched: Boolean(watched.finished), completed, percent,
      label: completed ? "Kumpleto" : activity ? "Ipagpatuloy ang gawain" : "Hindi pa nasisimulan" };
  }

  return (
    <section className="reel" id="mga-kwento">
      <div className="container">
        <div className="reel__head">

          <h2 className="reel__heading">Piliin ang Kwento</h2>
          <p className="reel__intro">
            Panoorin ang kwento o simulan agad ang gawain. May 10 talasalitaan, 10 hanap-salita, at pagninilay sa bawat aralin.
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
        <Leaderboard revision={progressRevision} />
      </div>

      {active && (
        <VideoModal video={active} initialView={initialView} onProgressChange={() => setProgressRevision((value) => value + 1)} onClose={() => { setActive(null); setProgressRevision((value) => value + 1); }} />
      )}
    </section>
  );
}
