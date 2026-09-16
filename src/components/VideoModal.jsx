import { useEffect, useRef, useState } from "react";
import { X, Play, QrCode, ListChecks } from "lucide-react";
import QRPanel from "./QRPanel";
import ActivitiesPanel, { ActivityComplete } from "./ActivitiesPanel";
import { isYouTubeUrl, toYouTubeEmbed } from "../lib/video";
import { clearActivityProgress, loadActivityProgress, loadVideoProgress, saveActivityProgress, saveVideoProgress } from "../lib/progress";
import { submitAnonymousActivityResult } from "../lib/googleForm";
import "./VideoModal.css";

export default function VideoModal({ video, initialView = "watch", onClose, onProgressChange }) {
  const [view, setView] = useState(initialView);
  const [activitiesComplete, setActivitiesComplete] = useState(() => Boolean(loadActivityProgress(video.id)?.completed));
  const [activityResult, setActivityResult] = useState(() => loadActivityProgress(video.id)?.result ?? null);
  const [hasFinishedVideo, setHasFinishedVideo] = useState(() => Boolean(loadVideoProgress(video.id)?.finished));
  const [watchPercent, setWatchPercent] = useState(() => loadVideoProgress(video.id)?.percent ?? 0);
  const [resetAction, setResetAction] = useState(null);
  const modalRef = useRef(null);
  const youtubeFrameRef = useRef(null);
  const watchedSecondsRef = useRef(0);
  const videoDurationRef = useRef(0);
  const lastPlaybackTimeRef = useRef(null);

  useEffect(() => {
    const savedActivity = loadActivityProgress(video.id);
    const savedVideo = loadVideoProgress(video.id);
    setView(initialView);
    setActivitiesComplete(Boolean(savedActivity?.completed));
    setActivityResult(savedActivity?.result ?? null);
    setHasFinishedVideo(Boolean(savedVideo?.finished));
    setWatchPercent(savedVideo?.percent ?? (savedVideo?.finished ? 1 : 0));
    watchedSecondsRef.current = savedVideo?.watchedSeconds ?? 0;
    videoDurationRef.current = savedVideo?.duration ?? 0;
    lastPlaybackTimeRef.current = null;
  }, [initialView, video]);

  useEffect(() => {
    saveVideoProgress(video.id, {
      finished: hasFinishedVideo,
      percent: hasFinishedVideo ? 1 : watchPercent,
      watchedSeconds: watchedSecondsRef.current,
      duration: videoDurationRef.current,
      updatedAt: Date.now(),
    });
  }, [hasFinishedVideo, video.id, watchPercent]);

  function recordWatchProgress(currentTime, duration) {
    if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) return;
    videoDurationRef.current = duration;
    const previous = lastPlaybackTimeRef.current;
    const delta = previous == null ? 0 : currentTime - previous;
    if (delta > 0 && delta < 3) watchedSecondsRef.current = Math.min(duration, watchedSecondsRef.current + delta);
    lastPlaybackTimeRef.current = currentTime;
    const percent = Math.min(1, watchedSecondsRef.current / duration);
    setWatchPercent(percent);
    if (percent >= .9) setHasFinishedVideo(true);
  }

  useEffect(() => {
    function receiveYouTubeEvent(event) {
      if (!event.origin.includes("youtube.com")) return;
      let message = event.data;
      if (typeof message === "string") {
        try { message = JSON.parse(message); } catch { return; }
      }
      if (message?.event === "infoDelivery" && Number.isFinite(message.info?.currentTime) && Number.isFinite(message.info?.duration)) {
        recordWatchProgress(message.info.currentTime, message.info.duration);
      }
      if (message?.event === "onStateChange" && message.info === 2) lastPlaybackTimeRef.current = null;
    }
    window.addEventListener("message", receiveYouTubeEvent);
    return () => window.removeEventListener("message", receiveYouTubeEvent);
  }, []);

  function registerYouTubeListener() {
    const frame = youtubeFrameRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage(JSON.stringify({ event: "listening", id: `player-${video.id}` }), "https://www.youtube.com");
    frame.contentWindow.postMessage(JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"], id: `player-${video.id}` }), "https://www.youtube.com");
  }

  function returnHome() {
    onClose();
    if (window.location.pathname !== "/") {
      window.location.assign("/");
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reviewPagninilay() {
    const saved = loadActivityProgress(video.id);
    saveActivityProgress(video.id, { ...saved, completed: false, step: 2, updatedAt: Date.now() });
    setActivitiesComplete(false);
    onProgressChange?.();
  }

  async function resubmitActivityResult() {
    if (!activityResult || activityResult.submissionStatus === "sending") return;
    const sendingResult = { ...activityResult, submissionStatus: "sending" };
    setActivityResult(sendingResult);
    try {
      await submitAnonymousActivityResult(video, sendingResult);
      const sentResult = { ...sendingResult, submissionStatus: "sent", submittedAt: Date.now() };
      const saved = loadActivityProgress(video.id);
      saveActivityProgress(video.id, { ...saved, result: sentResult, updatedAt: Date.now() });
      setActivityResult(sentResult);
    } catch {
      const failedResult = { ...sendingResult, submissionStatus: "failed" };
      const saved = loadActivityProgress(video.id);
      saveActivityProgress(video.id, { ...saved, result: failedResult, updatedAt: Date.now() });
      setActivityResult(failedResult);
    }
  }

  function confirmReset() {
    const saved = loadActivityProgress(video.id);
    if (resetAction === "word-search") {
      saveActivityProgress(video.id, {
        ...saved,
        completed: false,
        step: 1,
        foundWords: [],
        attempts: 0,
        timeRemaining: 600,
        gameStatus: "playing",
        gameDeadline: Date.now() + 600000,
        hintsLeft: 2,
        result: null,
        updatedAt: Date.now(),
      });
    } else {
      clearActivityProgress(video.id);
    }
    setActivityResult(null);
    setActivitiesComplete(false);
    setResetAction(null);
    onProgressChange?.();
  }

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    modalRef.current?.querySelector(".modal__close")?.focus();
    function onKey(e) {
      if (e.key === "Escape") { if (!e.defaultPrevented) onClose(); return; }
      if (e.key !== "Tab") return;
      const scope = modalRef.current?.querySelector(".reset-confirm, .game-result") || modalRef.current;
      const controls = [...(scope?.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), [tabindex="0"]') || [])].filter(el => el.offsetParent !== null);
      if (!controls.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (!scope.contains(document.activeElement) || (e.shiftKey && document.activeElement === first)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [onClose]);

  return (
    <div ref={modalRef} className="modal" role="dialog" aria-modal="true" aria-label={video.title}>
      <div className="modal__scrim" onClick={onClose} />

      <div className={`modal__panel ${view === "activities" ? "modal__panel--activities" : ""}`}>
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
          <button
            type="button"
            role="tab"
            aria-selected={view === "activities"}
            className={`modal__tab ${view === "activities" ? "is-active" : ""}`}
            onClick={() => setView("activities")}
            title="Buksan ang mga aktibidad"
          >
            <ListChecks size={15} strokeWidth={2} /> Mga Aktibidad
          </button>
        </div>

        <div className="modal__body">
          {view === "watch" && (
            <>
              <div className="modal__player">
                {isYouTubeUrl(video.videoUrl) ? (
                  <iframe
                    ref={youtubeFrameRef}
                    src={toYouTubeEmbed(video.videoUrl)}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={registerYouTubeListener}
                  />
                ) : (
                  <video
                    src={video.videoUrl}
                    controls
                    playsInline
                    onLoadedMetadata={(event) => {
                      videoDurationRef.current = event.currentTarget.duration;
                      lastPlaybackTimeRef.current = event.currentTarget.currentTime;
                    }}
                    onPlay={(event) => { lastPlaybackTimeRef.current = event.currentTarget.currentTime; }}
                    onPause={() => { lastPlaybackTimeRef.current = null; }}
                    onSeeking={(event) => { lastPlaybackTimeRef.current = event.currentTarget.currentTime; }}
                    onTimeUpdate={(event) => recordWatchProgress(event.currentTarget.currentTime, event.currentTarget.duration)}
                  />
                )}
              </div>
              <p className="modal__desc">{video.description}</p>
            </>
          )}
          {view === "qr" && <QRPanel video={video} />}
          {view === "activities" && !activitiesComplete && (
            <div hidden={view !== "activities"}>
              <ActivitiesPanel
                key={video.id}
                video={video}
                onComplete={(result) => {
                  setActivityResult(result);
                  setActivitiesComplete(true);
                  onProgressChange?.();
                }}
              />
            </div>
          )}
          {activitiesComplete && (
            <div hidden={view !== "activities"}>
              <ActivityComplete video={video} result={activityResult} onHome={returnHome} onReview={reviewPagninilay} onRetake={() => setResetAction("word-search")} onRestart={() => setResetAction("all")} onResubmit={resubmitActivityResult} />
            </div>
          )}
        </div>

        {resetAction && <div className="reset-confirm" role="dialog" aria-modal="true" aria-labelledby="reset-confirm-title"><div><h3 id="reset-confirm-title">{resetAction === "all" ? "I-reset ang lahat?" : "Ulitin ang Hanap-salita?"}</h3><p>{resetAction === "all" ? "Mabubura ang pagtatambal, hanap-salita, at pagninilay para sa kwentong ito." : "Magsisimula muli ang 10 minutong timer. Mananatili ang Talasalitaan at Pagninilay."}</p><span><button type="button" onClick={() => setResetAction(null)}>Kanselahin</button><button type="button" onClick={confirmReset}>Magpatuloy</button></span></div></div>}
      </div>
    </div>
  );
}
