import { useState } from "react";
import { leaderboardEnabled, publishScore, scoreResult } from "../lib/leaderboard";
import { loadLearnerProfile, saveLearnerProfile } from "../lib/progress";
import "./Learning.css";
export default function LeaderboardEntry({ video, result }) {
  const [nickname, setNickname] = useState(loadLearnerProfile().nickname || "");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault(); setStatus("sending");
    try {
      const improved = await publishScore(video, result, nickname);
      saveLearnerProfile({ nickname: nickname.trim() });
      setStatus("sent"); setMessage(improved ? "Naidagdag na ang iyong puntos sa talaan." : "Napanatili ang mas mataas mong puntos sa talaan.");
    } catch { setStatus("error"); setMessage("Hindi naipadala ang puntos. Suriin ang koneksiyon at subukan muli. Naka-save pa rin ang iyong gawain."); }
  }
  let score; try { score = scoreResult(result).score; } catch { return null; }
  return <form className="leaderboard-entry" onSubmit={submit}>
    <h4>Isama ang iyong {score}/20 sa talaan</h4>
    <p>Kusang-loob ang pagsali. Makikita ng lahat ang palayaw at puntos mo; hindi isasama ang pagninilay o pangalan sa sertipiko.</p>
    {leaderboardEnabled ? <><label htmlFor="leaderboard-nickname">Palayaw<input id="leaderboard-nickname" value={nickname} onChange={e => { setNickname(e.target.value); setStatus("idle"); }} minLength={2} maxLength={24} required autoComplete="off" placeholder="Hal. Mambabasa07" /></label><button disabled={status === "sending" || status === "sent"}>{status === "sending" ? "Ipinapadala…" : status === "sent" ? "Naipadala na" : "Isali ang puntos"}</button></> : <p>Binubuksan pa ang talaan ng mga puntos. Maaari kang bumalik sa resulta upang sumali kapag handa na.</p>}
    {message && <p role="status">{message}</p>}
  </form>;
}
