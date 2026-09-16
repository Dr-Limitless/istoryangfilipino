import { useEffect, useState } from "react";
import { STORY_ACTIVITIES } from "../data/activities";
import { leaderboardEnabled, readLeaderboard } from "../lib/leaderboard";
import "./Learning.css";
export default function Leaderboard({ revision }) {
  const [story, setStory] = useState("ang-ama");
  const [response, setResponse] = useState(null);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => { const update = () => setRefresh(n => n + 1); window.addEventListener("leaderboard-updated", update); return () => window.removeEventListener("leaderboard-updated", update); }, []);
  const requestKey = `${story}:${revision}:${refresh}`;
  const rows = response?.key === requestKey ? response.rows : [];
  const status = response?.key === requestKey ? response.status : "loading";
  useEffect(() => {
    let active = true;
    readLeaderboard(story).then(data => { if (active) setResponse({ key: requestKey, rows: data, status: "ready" }); }).catch(() => { if (active) setResponse({ key: requestKey, rows: [], status: "error" }); });
    return () => { active = false; };
  }, [story, requestKey]);
  return <section className="leaderboard" id="talaan" aria-labelledby="leaderboard-title">
    <div className="learning-section-head"><div><h2 id="leaderboard-title">Talaan ng mga puntos</h2><p>Pinakamahusay na resulta ng bawat kalahok, sa bawat kwento.</p></div><button className="text-button" onClick={() => setRefresh(n => n + 1)} disabled={!leaderboardEnabled || status === "loading"}>I-refresh ang talaan</button></div>
    <div className="story-selector" aria-label="Piliin ang kwento sa talaan">{Object.entries(STORY_ACTIVITIES).map(([key, content]) => <button key={key} aria-pressed={story === key} onClick={() => setStory(key)}>{content.label}</button>)}</div>
    <p className="leaderboard__scoring">20 puntos: 10 tamang talasalitaan + hanggang 10 nahanap na salita. Sa tabla, mas maikling oras sa hanap-salita ang mauuna. Hindi minamarkahan ang pagninilay.</p>
    {!leaderboardEnabled ? <div className="learning-empty"><h3>Malapit nang magbukas ang talaan.</h3><p>Maaari mo nang sagutan ang lahat ng gawain. Maidaragdag ang iyong puntos mula sa pahina ng resulta kapag nakakonekta na ang talaan.</p></div> : status === "loading" ? <p className="learning-empty" role="status">Kinukuha ang mga puntos…</p> : status === "error" ? <div className="learning-empty" role="status"><h3>Hindi makuha ang talaan.</h3><p>Suriin ang koneksiyon at pindutin ang “I-refresh ang talaan.”</p></div> : rows.length === 0 ? <div className="learning-empty"><h3>Wala pang kalahok sa kwentong ito.</h3><p>Tapusin ang gawain at isali ang iyong puntos gamit ang palayaw.</p></div> : <div className="leaderboard__table-wrap"><table><caption>{STORY_ACTIVITIES[story].label} — unang 30 kalahok</caption><thead><tr><th scope="col">Puwesto</th><th scope="col">Palayaw</th><th scope="col">Puntos</th><th scope="col">Oras</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id}><td>{index > 0 && row.score === rows[index-1].score && row.timeUsed === rows[index-1].timeUsed ? rows.findIndex(r => r.score === row.score && r.timeUsed === row.timeUsed) + 1 : index + 1}</td><th scope="row">{row.nickname}</th><td>{row.score}/20</td><td>{Math.floor(row.timeUsed / 60)}:{String(row.timeUsed % 60).padStart(2, "0")}</td></tr>)}</tbody></table></div>}
    <small>Isang pinakamataas na resulta bawat kwento sa browser na ito. Kapag nagpalit ng device o nagbura ng browser data, magkakaroon ng bagong pagkakakilanlan.</small>
  </section>;
}
