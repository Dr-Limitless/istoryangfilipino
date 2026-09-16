import { useState } from "react";
import { Download, Printer, Trophy } from "lucide-react";
import { loadLearnerProfile, saveLearnerProfile } from "../lib/progress";
import "./CourseProgress.css";
import { activitySummary } from "../lib/activitySummary";

export default function CourseProgress({ videos, revision }) {
  const profile = loadLearnerProfile();
  const [learnerName, setLearnerName] = useState(profile.name);
  const progress = videos.map((video) => ({ video, ...activitySummary(video) }));
  const completed = progress.filter((item) => item.completed).length;
  const passed = progress.filter((item) => item.activity?.gameStatus === "won").length;
  const vocabularyScore = progress.reduce((total, item) => total + item.vocabularyCount, 0);
  const overall = videos.length ? Math.round(progress.reduce((total, item) => total + item.percent, 0) / videos.length) : 0;
  const allComplete = videos.length > 0 && completed === videos.length;

  function updateName(event) {
    saveLearnerProfile({ name: event.target.value });
    setLearnerName(event.target.value);
  }

  function downloadCertificate() {
    const name = learnerName.trim() || "Mag-aaral";
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 900;
    const context = canvas.getContext("2d");
    context.fillStyle = "#faf8f2";
    context.fillRect(0, 0, 1400, 900);
    context.strokeStyle = "#202026";
    context.lineWidth = 7;
    context.strokeRect(45, 45, 1310, 810);
    context.textAlign = "center";
    context.fillStyle = "#202026";
    context.font = "700 34px Arial";
    context.fillText("STORYANG FILIPINO", 700, 180);
    context.fillStyle = "#202026";
    context.font = "800 76px Arial";
    context.fillText("SERTIPIKO NG PAGKUMPLETO", 700, 300);
    context.fillStyle = "#202026";
    context.font = "32px Arial";
    context.fillText("Iginagawad kay", 700, 390);
    context.fillStyle = "#202026";
    context.font = "700 64px Arial";
    context.fillText(name, 700, 490, 1200);
    context.fillStyle = "#202026";
    context.font = "30px Arial";
    context.fillText("sa matagumpay na pagkumpleto ng tatlong kwento at mga gawain", 700, 580);
    context.fillText(`Talasalitaan ${vocabularyScore}/${videos.length * 10}  •  Hanap-salita ${passed}/${videos.length}  •  Kabuuan ${overall}%`, 700, 650);
    context.fillStyle = "#202026";
    context.font = "26px Arial";
    context.fillText(new Intl.DateTimeFormat("fil-PH", { dateStyle: "long" }).format(new Date()), 700, 760);
    const link = document.createElement("a");
    link.download = "storyang-filipino-certificate.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <section className="course-progress" aria-labelledby="course-progress-title" data-revision={revision}>
      <div className="course-progress__top">
        <div>

          <h3 id="course-progress-title">Progreso sa Tatlong Kwento</h3>
          <p>Awtomatikong nase-save sa device na ito ang iyong natapos.</p>
        </div>
        <div className="course-progress__ring" style={{ "--progress": `${overall * 3.6}deg` }}><strong>{overall}%</strong><small>kabuuan</small></div>
      </div>

      <div className="course-progress__stats">
        <span><strong>{completed}/{videos.length}</strong> Kwentong kumpleto</span>
        <span><strong>{vocabularyScore}/{videos.length * 10}</strong> Talasalitaan</span>
        <span><strong>{passed}/{videos.length}</strong> Hanap-salita na kumpleto</span>
      </div>

      <div className="course-progress__stories">
        {progress.map(({ video, percent, completed: done, activity }) => (
          <article key={video.id}>
            <div><strong>{video.title}</strong><span>{done ? "Kumpleto" : activity ? "Ipagpatuloy ang gawain" : "Mga aktibidad"}</span></div>
            <div className="course-progress__bar"><span style={{ width: `${percent}%` }} /></div>
            <small>{percent}% · {activity?.gameStatus === "won" ? "Hanap-salita na kumpleto" : activity?.gameStatus === "failed" ? "Naubos ang oras" : "Hindi pa kumpleto"}</small>
          </article>
        ))}
      </div>

      {allComplete && (
        <div className="course-award">
          <div className="course-award__icon"><Trophy size={29} /></div>
          <div><span>Lahat ng kwento ay kumpleto</span><h4>Ang iyong sertipiko ay handa na!</h4></div>
          <label>Pangalan sa sertipiko<input value={learnerName} onChange={updateName} placeholder="Ilagay ang pangalan" /></label>
          <button type="button" onClick={downloadCertificate}><Download size={16} /> I-download</button>
        </div>
      )}

      {completed > 0 && <button type="button" className="course-progress__print" onClick={() => window.print()}><Printer size={15} /> I-print ang Ulat para sa Guro</button>}

      <div className="teacher-report">
        <h1>Storyang Filipino — Ulat para sa Guro</h1>
        <p>Mag-aaral: {learnerName || "________________"}</p>
        {progress.map(({ video, activity, watched }) => <section key={video.id}><h2>{video.title}</h2><p>Video: {watched.finished ? "Napanood" : "Hindi pa"}</p><p>Talasalitaan: {activity?.matchedVocabulary?.length || 0}/10</p><p>Hanap-salita: {activity?.gameStatus === "won" ? "Nakapasa" : activity?.gameStatus === "failed" ? "Naubos ang oras" : "Hindi pa"}</p><p>Pagsubok: {activity?.attempts || 0}</p><p>Pagninilay: {activity?.reflection || "Walang sagot"}</p></section>)}
      </div>
    </section>
  );
}
