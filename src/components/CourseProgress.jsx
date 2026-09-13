import { useState } from "react";
import { BookOpenCheck, Download, Printer, Trophy } from "lucide-react";
import { loadActivityProgress, loadLearnerProfile, loadVideoProgress, saveLearnerProfile } from "../lib/progress";
import "./CourseProgress.css";

function getProgress(video) {
  const watched = loadVideoProgress(video.id);
  const activity = loadActivityProgress(video.id);
  const vocabulary = Math.min(1, (activity?.matchedVocabulary?.length || 0) / 5);
  const wordFinished = activity?.gameStatus === "won" || activity?.gameStatus === "failed";
  const reflection = Boolean(activity?.reflection?.trim()?.length >= 20);
  const percent = Math.round((watched.finished ? 25 : (watched.percent || 0) * 25) + vocabulary * 25 + (wordFinished ? 25 : 0) + (reflection ? 25 : 0));
  return { watched, activity, percent, completed: Boolean(activity?.completed) };
}

export default function CourseProgress({ videos, revision }) {
  const profile = loadLearnerProfile();
  const [learnerName, setLearnerName] = useState(profile.name);
  const progress = videos.map((video) => ({ video, ...getProgress(video) }));
  const completed = progress.filter((item) => item.completed).length;
  const passed = progress.filter((item) => item.activity?.gameStatus === "won").length;
  const vocabularyScore = progress.reduce((total, item) => total + (item.activity?.matchedVocabulary?.length || 0), 0);
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
    const background = context.createLinearGradient(0, 0, 1400, 900);
    background.addColorStop(0, "#17132b");
    background.addColorStop(.55, "#102a35");
    background.addColorStop(1, "#24162f");
    context.fillStyle = background;
    context.fillRect(0, 0, 1400, 900);
    context.strokeStyle = "#67e8f9";
    context.lineWidth = 7;
    context.strokeRect(45, 45, 1310, 810);
    context.textAlign = "center";
    context.fillStyle = "#a7f3d0";
    context.font = "700 34px Arial";
    context.fillText("STORYANG FILIPINO", 700, 180);
    context.fillStyle = "#ffffff";
    context.font = "800 76px Arial";
    context.fillText("SERTIPIKO NG PAGKUMPLETO", 700, 300);
    context.fillStyle = "#b8b8c5";
    context.font = "32px Arial";
    context.fillText("Iginagawad kay", 700, 390);
    context.fillStyle = "#fde68a";
    context.font = "700 64px Arial";
    context.fillText(name, 700, 490);
    context.fillStyle = "#d9d9e2";
    context.font = "30px Arial";
    context.fillText("sa matagumpay na pagkumpleto ng tatlong kwento at mga gawain", 700, 580);
    context.fillText(`Talasalitaan ${vocabularyScore}/${videos.length * 5}  •  Word Search ${passed}/${videos.length}  •  Overall ${overall}%`, 700, 650);
    context.fillStyle = "#a5f3fc";
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
          <span className="course-progress__eyebrow"><BookOpenCheck size={15} /> Aking Paglalakbay</span>
          <h3 id="course-progress-title">Progreso sa Tatlong Kwento</h3>
          <p>Awtomatikong nase-save sa device na ito ang iyong natapos.</p>
        </div>
        <div className="course-progress__ring" style={{ "--progress": `${overall * 3.6}deg` }}><strong>{overall}%</strong><small>overall</small></div>
      </div>

      <div className="course-progress__stats">
        <span><strong>{completed}/{videos.length}</strong> Kwentong kumpleto</span>
        <span><strong>{vocabularyScore}/{videos.length * 5}</strong> Talasalitaan</span>
        <span><strong>{passed}/{videos.length}</strong> Word Search passed</span>
      </div>

      <div className="course-progress__stories">
        {progress.map(({ video, percent, completed: done, activity }) => (
          <article key={video.id}>
            <div><strong>{video.title}</strong><span>{done ? "Kumpleto" : activity ? "Ipagpatuloy ang gawain" : "Mga aktibidad"}</span></div>
            <div className="course-progress__bar"><span style={{ width: `${percent}%` }} /></div>
            <small>{percent}% · {activity?.gameStatus === "won" ? "Word Search passed" : activity?.gameStatus === "failed" ? "Word Search timed out" : "In progress"}</small>
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

      {completed > 0 && <button type="button" className="course-progress__print" onClick={() => window.print()}><Printer size={15} /> I-print ang Teacher Report</button>}

      <div className="teacher-report">
        <h1>Storyang Filipino — Teacher Report</h1>
        <p>Mag-aaral: {learnerName || "________________"}</p>
        {progress.map(({ video, activity, watched }) => <section key={video.id}><h2>{video.title}</h2><p>Video: {watched.finished ? "Napanood" : "Hindi pa"}</p><p>Talasalitaan: {activity?.matchedVocabulary?.length || 0}/5</p><p>Word Search: {activity?.gameStatus === "won" ? "Nakapasa" : activity?.gameStatus === "failed" ? "Time Out" : "Hindi pa"}</p><p>Attempts: {activity?.attempts || 0}</p><p>Reflection: {activity?.reflection || "Walang sagot"}</p></section>)}
      </div>
    </section>
  );
}
