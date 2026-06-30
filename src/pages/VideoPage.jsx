import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, QrCode } from "lucide-react";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import QRPanel from "../components/QRPanel";
import { useVideos } from "../hooks/useVideos";
import { toRoman, isYouTubeUrl, toYouTubeEmbed } from "../lib/video";
import "./VideoPage.css";

export default function VideoPage() {
  const { id } = useParams();
  const { videos, loading } = useVideos();
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
            Lahat ng Reel
          </Link>

          {!video && !loading && (
            <div className="vpage__missing">
              <p className="eyebrow">Hindi natagpuan</p>
              <h1>Walang reel dito.</h1>
              <p>Maaaring mali ang link, o tinanggal na ang video na ito.</p>
            </div>
          )}

          {video && (
            <>
              <header className="vpage__head">
                <p className="eyebrow">
                  Reel {toRoman(video.episode)} &middot; {video.era}
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
                  <p className="eyebrow">Iba pang Reel</p>
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
      <Footer />
    </>
  );
}
