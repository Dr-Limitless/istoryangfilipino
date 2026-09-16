import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, QrCode, ListChecks } from "lucide-react";
import { useState } from "react";
import VideoModal from "../components/VideoModal";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import QRPanel from "../components/QRPanel";
import { useVideos } from "../hooks/useVideos";
import { toRoman, isYouTubeUrl, toYouTubeEmbed } from "../lib/video";
import "./VideoPage.css";

export default function VideoPage() {
  const { id } = useParams();
  const { videos, loading } = useVideos();
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [view, setView] = useState("watch");

  const video = videos.find((v) => v.id === id);
  const others = videos.filter((v) => v.id !== id);

  return (
    <>
      <Navbar />
      <section className="vpage">
        <div className="container">
          <Link to="/" className="vpage__back">
            <ArrowLeft size={15} strokeWidth={2} />
            Lahat ng kwento
          </Link>

          {!video && !loading && (
            <div className="vpage__missing">
              <p className="story-label">Hindi natagpuan</p>
              <h1>Walang kwento dito.</h1>
              <p>Maaaring mali ang link, o tinanggal na ang video na ito.</p>
            </div>
          )}

          {video && (
            <>
              <header className="vpage__head">
                <p className="story-label">
                  Kwento {toRoman(video.episode)} &middot; {video.era}
                </p>
                <h1 className="vpage__title">{video.title}</h1>
              </header>

              <div className="vpage__tabs" role="tablist">
                <button
                  type="button"
                  className={`vpage__tab ${view === "watch" ? "is-active" : ""}`}
                  onClick={() => setView("watch")}
                >
                  <Play size={14} strokeWidth={2} /> Panoorin
                </button>
                <button
                  type="button"
                  className={`vpage__tab ${view === "qr" ? "is-active" : ""}`}
                  onClick={() => setView("qr")}
                >
                  <QrCode size={14} strokeWidth={2} /> QR Code
                </button>
                <button type="button" className="vpage__tab" onClick={() => setActivitiesOpen(true)}><ListChecks size={14} /> Gawain</button>
              </div>

              {view === "watch" ? (
                <>
                  <div className="vpage__player">
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
                  <p className="vpage__desc">{video.description}</p>
                </>
              ) : (
                <QRPanel video={video} />
              )}

              {others.length > 0 && (
                <div className="vpage__others">
                  <p className="story-label">Iba pang kwento</p>
                  <div className="vpage__others-list">
                    {others.map((o) => (
                      <Link to={`/video/${o.id}`} key={o.id} className="vpage__other">
                        <span>{toRoman(o.episode)}</span>
                        {o.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      {video && activitiesOpen && <VideoModal video={video} initialView="activities" onClose={() => setActivitiesOpen(false)} />}
      <Footer />
    </>
  );
}
