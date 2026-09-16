import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ListChecks, Play, QrCode, X } from "lucide-react";
import { leaderboardEnabled } from "../lib/leaderboard";
import "./ManualGuide.css";
import { ManualContext } from "../lib/manualContext";

const SEEN_KEY = "istoryang-filipino:manual-seen:v1";
const chapters = [
  { title: "Pumili ng kwento", text: "Panoorin ang video, buksan ang QR sa cellphone, o dumiretso sa Gawain. Hindi kailangang tapusin ang video bago sumagot.", tip: "Puwede kang magsimula sa alinman sa tatlong kwento." },
  { title: "Pagtambalin ang salita", text: "May 10 salita sa bawat aralin. Pumili ng salita, pagkatapos ay piliin ang tamang kahulugan. Kapag mali, subukan lang muli.", tip: "Sa cellphone, nasa ibaba ng mga salita ang mga kahulugan." },
  { title: "Hanapin ang nakatagong salita", text: "Hanapin ang 10 salita sa loob ng 10 minuto. Piliin ang unang titik at pagkatapos ang huling titik, o i-drag ang buong salita. May dalawang pahiwatig.", tip: "Maaaring pahalang, patayo, pahilis, at pabalik. Kapag naubos ang oras, puwedeng umulit o magpatuloy." },
  { title: "Isulat ang pagninilay", text: "Ibahagi ang sarili mong pananaw tungkol sa kwento. Kailangan ng hindi bababa sa 20 karakter. Pindutin ang Tapusin at Ipadala upang makita ang resulta.", tip: "Awtomatikong naiimbak sa browser na ito ang iyong gawain." },
  { title: "Balikan ang iyong pagkatuto", text: "Makikita sa homepage ang progreso mo. Kapag kumpleto ang gawain sa tatlong kwento, puwede mong kunin ang sertipiko.", tip: "Nasa browser na ito ang mga sagot. Hindi awtomatikong lumilipat ang progreso kapag nagpalit ng device." },
];

export function ManualProvider({ children }) {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.location.pathname === "/gabay") return true;
    try { return localStorage.getItem(SEEN_KEY) !== "yes"; } catch { return true; }
  });
  function closeManual() {
    try { localStorage.setItem(SEEN_KEY, "yes"); } catch { /* Optional preference. */ }
    setOpen(false);
  }
  return (
    <ManualContext.Provider value={{ openManual: () => setOpen(true) }}>
      {children}
      {open && <ManualDialog onClose={closeManual} />}
    </ManualContext.Provider>
  );
}

function ManualDialog({ onClose }) {
  const dialogRef = useRef(null);
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState(() => new Set([0]));
  const [direction, setDirection] = useState("forward");
  const [selected, setSelected] = useState(false);
  const [matched, setMatched] = useState(false);
  const [matchFeedback, setMatchFeedback] = useState("");
  const [wordStart, setWordStart] = useState(false);
  const [wordFound, setWordFound] = useState(false);
  const [wordFeedback, setWordFeedback] = useState("");
  const [reflection, setReflection] = useState("");
  const chapter = chapters[step];

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    dialog.querySelector("h2")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  function goTo(next) {
    setDirection(next < step ? "backward" : "forward");
    setStep(next);
    setVisited(previous => new Set([...previous, next]));
    dialogRef.current?.querySelector(".manual__page")?.scrollTo(0, 0);
  }
  function finish() {
    onClose();
    requestAnimationFrame(() => {
      const stories = document.getElementById("mga-kwento");
      stories?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      stories?.querySelector(".vcard__actions button:last-child")?.focus({ preventScroll: true });
    });
  }
  function chooseMeaning(correct) {
    if (!selected) { setMatchFeedback("Piliin muna ang salitang Pagkalinga."); return; }
    if (correct) { setMatched(true); setMatchFeedback("Tama! Ang pagkalinga ay pag-aalaga at malasakit."); }
    else setMatchFeedback("Hindi pa tama. Subukan ang isa pang kahulugan.");
  }
  function chooseLetter(index) {
    if (wordFound) return;
    if (index === 0) { setWordStart(true); setWordFeedback("Napili ang unang A. Piliin naman ang huling A sa parehong hanay."); }
    else if (index === 2 && wordStart) { setWordFound(true); setWordStart(false); setWordFeedback("Nahanap mo ang AMA! Ganito rin ang pagpili sa buong palaisipan."); }
    else { setWordStart(false); setWordFeedback("Magsimula sa A sa kaliwang itaas, at tapusin sa A sa kanang itaas."); }
  }

  return (
    <dialog ref={dialogRef} className="manual" aria-labelledby="manual-title" onCancel={event => { event.preventDefault(); onClose(); }}>
      <div className="manual__book">
        <aside className="manual__contents">
          <div className="manual__brand"><BookOpen size={22} /><span>Storyang Filipino</span></div>
          <h2 id="manual-title" tabIndex={-1}>Gabay sa<br /> unang pagbisita</h2>
          <p>Limang hakbang bago ang iyong unang gawain.</p>
          <nav aria-label="Mga kabanata ng manual">
            {chapters.map((item, index) => <button key={item.title} type="button" aria-current={index === step ? "step" : undefined} onClick={() => goTo(index)}><span>{index + 1}</span>{item.title}{visited.has(index) && index !== step && <Check size={14} aria-hidden="true" />}</button>)}
          </nav>
          <small>Puwede mong balikan ito sa “Gabay.”</small>
        </aside>

        <section className="manual__page">
          <header className="manual__top"><span>{step + 1} / {chapters.length}</span><button type="button" className="manual__skip" onClick={onClose}>Laktawan <X size={17} aria-hidden="true" /></button></header>
          <div key={step} className={`manual__sheet manual__sheet--${direction}`}>
            <h3 aria-live="polite" aria-atomic="true">{chapter.title}</h3>
            <p className="manual__description">{chapter.text}</p>

            {step === 0 && <div className="manual__story-demo"><div className="manual__story-cover"><img src="/storyangfilipino logo.png" alt="" /><strong>Ang Ama</strong><span>Halimbawa ng aralin</span></div><div className="manual__story-actions"><span><Play size={15} /> Panoorin</span><span><QrCode size={15} /> QR</span><button type="button" onClick={() => goTo(1)}><ListChecks size={16} /> Gawain <ArrowRight size={14} /></button></div></div>}

            {step === 1 && <div className="manual__matching"><p>Subukan: piliin ang salita at ang kahulugan nito.</p><button type="button" className={`manual__term ${selected ? "is-selected" : ""} ${matched ? "is-correct" : ""}`} aria-pressed={selected} disabled={matched} onClick={() => { setSelected(true); setMatchFeedback("Napili ang Pagkalinga. Alin ang kahulugan nito?"); }}>Pagkalinga {matched && <Check size={17} />}</button><div className="manual__definitions"><button type="button" disabled={matched} onClick={() => chooseMeaning(false)}>Matinding lungkot o pagdurusa.</button><button type="button" className={matched ? "is-correct" : ""} disabled={matched} onClick={() => chooseMeaning(true)}>Pag-aalaga at pagbibigay ng malasakit. {matched && <Check size={17} />}</button></div><p className="manual__feedback" role="status">{matchFeedback || "Hindi ito kasama sa iyong puntos."}</p></div>}

            {step === 2 && <div className="manual__puzzle"><p>Subukan: hanapin ang AMA.</p><div className="manual__letter-grid" aria-label="Halimbawang palaisipan: AMA sa unang hanay">{["A", "M", "A", "P", "I", "L", "S", "O", "T"].map((letter, index) => <button type="button" key={index} className={wordFound && index < 3 ? "is-correct" : wordStart && index === 0 ? "is-selected" : ""} aria-label={`${letter}, hanay ${Math.floor(index / 3) + 1}, kolum ${index % 3 + 1}`} onClick={() => chooseLetter(index)}>{letter}</button>)}</div><p className="manual__feedback" role="status">{wordFeedback || "Pindutin ang unang A, pagkatapos ang huling A sa itaas."}</p><small>Sa keyboard, arrow keys ang gamit sa buong palaisipan; Enter o Space para pumili.</small></div>}

            {step === 3 && <div className="manual__reflection"><label htmlFor="manual-reflection">Ano ang ibig sabihin ng pagkalinga para sa iyo?</label><textarea id="manual-reflection" rows={3} value={reflection} onChange={event => setReflection(event.target.value)} placeholder="Para sa akin, ang pagkalinga ay…" /><span>{reflection.trim().length >= 20 ? <><Check size={14} /> Sapat na ang haba ng sagot.</> : `${reflection.trim().length} / 20 karakter`}</span><small>Pagsasanay lang ito. Hindi naiimbak o ipinapadala ang sagot na ito.</small></div>}

            {step === 4 && <div className="manual__result"><Check size={26} aria-hidden="true" /><h4>Handa ka nang magsimula.</h4><p>{leaderboardEnabled ? "Pagkatapos ng gawain, puwede mong kusang isali ang puntos gamit ang palayaw. Makikita ng lahat ang palayaw at puntos; hindi ang pagninilay." : "Binubuksan pa ang talaan ng mga puntos. Maaari mo nang gawin ang lahat ng aralin at balikan ang resulta upang sumali kapag handa na."}</p><p>20 puntos: 10 talasalitaan + hanggang 10 nahanap na salita. Hindi minamarkahan ang pagninilay.</p></div>}

            <p className="manual__tip">{chapter.tip}</p>
          </div>
          <footer className="manual__footer"><button type="button" className="manual__back" disabled={step === 0} onClick={() => goTo(step - 1)}><ArrowLeft size={16} /> Nakaraan</button>{step < chapters.length - 1 ? <button type="button" className="manual__next" onClick={() => goTo(step + 1)}>Susunod <ArrowRight size={16} /></button> : <button type="button" className="manual__next" onClick={finish}>Simulan ang gawain <ArrowRight size={16} /></button>}</footer>
        </section>
      </div>
    </dialog>
  );
}
