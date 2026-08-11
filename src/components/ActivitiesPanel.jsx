import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CloudCheck, Home, Lightbulb, PartyPopper, RefreshCw, Send, Timer, Target, TriangleAlert, Trophy, Volume2 } from "lucide-react";
import { loadActivityProgress, saveActivityProgress } from "../lib/progress";
import { createAnonymousReference, submitAnonymousActivityResult } from "../lib/googleForm";
import "./ActivitiesPanel.css";

const STORY_ACTIVITIES = {
  "ang-ama": {
    label: "Ang Ama",
    vocabulary: [
      { number: 1, word: "Panaghoy", meaning: "Malakas na pag-iyak dahil sa matinding lungkot." },
      { number: 2, word: "Nagkukubli", meaning: "Nagtatago o umiiwas na makita." },
      { number: 3, word: "Naninipat", meaning: "Matamang tumitingin o nagmamasid." },
      { number: 4, word: "Kimi", meaning: "Mahiyain o hindi palakibo." },
      { number: 5, word: "Nagpupuyos", meaning: "Matinding pag-alab ng damdamin, lalo na ng galit." },
    ],
    words: ["PAGSISISI", "PAGMAMAHAL", "GALIT", "KAPATAWARAN", "KALUNGKUTAN"],
    reflection: "Paano makatutulong ang pagpapatawad at pagmamahal upang mapabuti ang ugnayan sa loob ng pamilya?",
    starters: ["Natutuhan ko na ang pagpapatawad ay...", "Sa aming pamilya, maipapakita ko ang pagmamahal sa pamamagitan ng...", "Kung ako ang nasa kalagayan ng tauhan, ako ay..."],
  },
  "bangkang-papel": {
    label: "Bangkang Papel",
    vocabulary: [
      { number: 6, word: "Saluysoy", meaning: "Mahinang agos ng tubig." },
      { number: 7, word: "Dagundong", meaning: "Malakas at umuugong na tunog." },
      { number: 8, word: "Silahis", meaning: "Maninipis na guhit o sinag ng liwanag." },
      { number: 9, word: "Gulilat", meaning: "Biglang nagising o nabigla." },
      { number: 10, word: "Nagbalikwas", meaning: "Biglang bumangon mula sa pagkakahiga." },
    ],
    words: ["PANGARAP", "ALAALA", "KABATAAN", "PAGLALAKBAY", "KALAYAAN"],
    reflection: "Anong pangarap o alaala noong kabataan ang nais mong dalhin sa iyong paglalakbay sa buhay?",
    starters: ["Ang pangarap na mahalaga sa akin ay...", "Isang alaala na nagbibigay sa akin ng lakas ay...", "Tulad ng bangkang papel, nais kong marating ang..."],
  },
  pamana: {
    label: "Pamana",
    vocabulary: [
      { number: 11, word: "Pinatalagos", meaning: "Ipinadaan o ipinapasok nang malalim." },
      { number: 12, word: "Legasiya", meaning: "Bagay o aral na iniiwan ng isang tao sa iba." },
      { number: 13, word: "Nangakakintal", meaning: "Malalim na naiwan o nakaukit sa alaala." },
      { number: 14, word: "Salakot", meaning: "Panakip sa ulo na ginagamit bilang proteksiyon sa araw." },
      { number: 15, word: "Linang", meaning: "Lupang sinasaka o taniman." },
    ],
    words: ["PAGSASAKA", "LUPAIN", "KABUHAYAN", "KASIPAGAN", "PAGASA"],
    reflection: "Anong pamana tungkol sa sipag, lupain, o kabuhayan ang nais mong ipagpatuloy sa susunod na salinlahi?",
    starters: ["Ang pamanang nais kong ipagpatuloy ay...", "Maipapakita ko ang kasipagan sa pamamagitan ng...", "Mahalaga ang lupa at kabuhayan dahil..."],
  },
};

const PUZZLE_SIZE = 12;
const GAME_DURATION_SECONDS = 10 * 60;
const DIRECTIONS = [[1, -1], [0, -1], [-1, 1], [-1, 0], [1, 1], [-1, -1], [1, 0], [0, 1]];
const FILLER_LETTERS = "ABDEGIKLMNOPRSTUY";

function normalizeStory(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getStoryContent(video) {
  const identity = normalizeStory(`${video.id || ""}${video.title || ""}`);
  if (identity.includes("bangkangpapel")) return STORY_ACTIVITIES["bangkang-papel"];
  if (identity.includes("angama")) return STORY_ACTIVITIES["ang-ama"];
  if (identity.includes("pamana")) return STORY_ACTIVITIES.pamana;
  return STORY_ACTIVITIES.pamana;
}

function hashString(value) {
  return value.split("").reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 2166136261);
}

function directionClue([rowStep, colStep]) {
  if (rowStep === 0) return colStep < 0 ? "Pahalang, pabalik" : "Pahalang, pasulong";
  if (colStep === 0) return rowStep < 0 ? "Pataas" : "Pababa";
  if (rowStep < 0) return colStep < 0 ? "Pahilis pataas, pabalik" : "Pahilis pataas";
  return colStep < 0 ? "Pahilis pababa, pabalik" : "Pahilis pababa";
}

function buildWordPuzzle(words, seed) {
  const grid = Array.from({ length: PUZZLE_SIZE }, () => Array(PUZZLE_SIZE).fill(""));
  const placements = [];
  const orderedWords = [...words].sort((a, b) => b.length - a.length);

  function placeWord(index) {
    if (index === orderedWords.length) return true;
    const word = orderedWords[index];
    const preferred = DIRECTIONS[index % DIRECTIONS.length];
    const candidates = [];

    DIRECTIONS.forEach((direction) => {
      for (let row = 0; row < PUZZLE_SIZE; row += 1) {
        for (let col = 0; col < PUZZLE_SIZE; col += 1) {
          const endRow = row + direction[0] * (word.length - 1);
          const endCol = col + direction[1] * (word.length - 1);
          if (endRow < 0 || endRow >= PUZZLE_SIZE || endCol < 0 || endCol >= PUZZLE_SIZE) continue;
          const fits = word.split("").every((letter, letterIndex) => {
            const current = grid[row + direction[0] * letterIndex][col + direction[1] * letterIndex];
            return !current || current === letter;
          });
          if (fits) candidates.push({ row, col, direction });
        }
      }
    });

    candidates.sort((a, b) => {
      const aPreferred = a.direction === preferred ? 0 : 1;
      const bPreferred = b.direction === preferred ? 0 : 1;
      if (aPreferred !== bPreferred) return aPreferred - bPreferred;
      return hashString(`${seed}-${word}-${a.row}-${a.col}-${a.direction.join("")}`) - hashString(`${seed}-${word}-${b.row}-${b.col}-${b.direction.join("")}`);
    });

    for (const candidate of candidates) {
      const changed = [];
      word.split("").forEach((letter, letterIndex) => {
        const row = candidate.row + candidate.direction[0] * letterIndex;
        const col = candidate.col + candidate.direction[1] * letterIndex;
        if (!grid[row][col]) changed.push([row, col]);
        grid[row][col] = letter;
      });
      placements.push({ word, start: [candidate.row, candidate.col], direction: candidate.direction, clue: directionClue(candidate.direction) });
      if (placeWord(index + 1)) return true;
      placements.pop();
      changed.forEach(([row, col]) => { grid[row][col] = ""; });
    }
    return false;
  }

  placeWord(0);
  grid.forEach((row, rowIndex) => row.forEach((letter, colIndex) => {
    if (!letter) grid[rowIndex][colIndex] = FILLER_LETTERS[hashString(`${seed}-${rowIndex}-${colIndex}`) % FILLER_LETTERS.length];
  }));
  return { grid, placements };
}
const STEP_LABELS = ["Talasalitaan", "Word Search", "Reflection"];

function displayPuzzleWord(word) {
  return word === "PAGASA" ? "PAG-ASA" : word;
}

function formatDuration(seconds = 0) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = Math.max(0, seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function getLine(start, end) {
  const rowDistance = end.row - start.row;
  const colDistance = end.col - start.col;
  const isStraight = rowDistance === 0 || colDistance === 0 || Math.abs(rowDistance) === Math.abs(colDistance);
  if (!isStraight) return [];
  const rowStep = Math.sign(rowDistance);
  const colStep = Math.sign(colDistance);
  const length = Math.max(Math.abs(rowDistance), Math.abs(colDistance)) + 1;
  return Array.from({ length }, (_, index) => ({
    row: start.row + rowStep * index,
    col: start.col + colStep * index,
  }));
}

export default function ActivitiesPanel({ video, onComplete }) {
  const storyContent = getStoryContent(video);
  const savedProgress = useMemo(() => loadActivityProgress(video.id), [video.id]);
  const restoredRemaining = savedProgress?.gameStatus === "playing" && savedProgress?.gameDeadline
    ? Math.max(0, Math.ceil((savedProgress.gameDeadline - Date.now()) / 1000))
    : (savedProgress?.timeRemaining ?? GAME_DURATION_SECONDS);
  const restoredTimedOut = savedProgress?.gameStatus === "playing" && restoredRemaining === 0;
  const { grid: wordGrid, placements: wordPlacements } = useMemo(
    () => buildWordPuzzle(storyContent.words, normalizeStory(storyContent.label)),
    [storyContent],
  );
  const words = storyContent.words;
  const shuffledVocabulary = useMemo(
    () => [...storyContent.vocabulary].sort((a, b) => hashString(`${storyContent.label}-${a.meaning}`) - hashString(`${storyContent.label}-${b.meaning}`)),
    [storyContent],
  );
  const [step, setStep] = useState(savedProgress?.step ?? 0);
  const [selectedVocabulary, setSelectedVocabulary] = useState(null);
  const [matchedVocabulary, setMatchedVocabulary] = useState(savedProgress?.matchedVocabulary ?? []);
  const [wrongVocabulary, setWrongVocabulary] = useState(null);
  const [vocabularyFeedback, setVocabularyFeedback] = useState("Pumili ng salita, pagkatapos ay piliin ang tamang kahulugan.");
  const [selectionStart, setSelectionStart] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [foundWords, setFoundWords] = useState(savedProgress?.foundWords ?? []);
  const [attempts, setAttempts] = useState(savedProgress?.attempts ?? 0);
  const [timeRemaining, setTimeRemaining] = useState(restoredRemaining);
  const [gameStatus, setGameStatus] = useState(restoredTimedOut ? "failed" : (savedProgress?.gameStatus ?? "ready"));
  const [gameDeadline, setGameDeadline] = useState(restoredTimedOut ? null : (savedProgress?.gameDeadline ?? null));
  const [showFailureModal, setShowFailureModal] = useState(restoredTimedOut || (savedProgress?.gameStatus === "failed" && savedProgress?.step === 1));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(savedProgress?.hintsLeft ?? 2);
  const [hint, setHint] = useState("");
  const [hintedWord, setHintedWord] = useState(null);
  const [hintedCells, setHintedCells] = useState([]);
  const [wordFeedback, setWordFeedback] = useState("Hanapin ang unang salita.");
  const [reflection, setReflection] = useState(savedProgress?.reflection ?? "");
  const [savedAt, setSavedAt] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState("idle");
  const ignoreClickUntilRef = useRef(0);
  const matchingEffectTimerRef = useRef(null);
  const dragEndRef = useRef(null);

  useEffect(() => () => window.clearTimeout(matchingEffectTimerRef.current), []);

  const foundCells = useMemo(() => {
    const cells = new Set();
    foundWords.forEach((item) => item.cells.forEach(({ row, col }) => cells.add(`${row}-${col}`)));
    return cells;
  }, [foundWords]);

  const activeSelectionCells = useMemo(() => {
    if (isDragging && dragStart && dragEnd) return getLine(dragStart, dragEnd);
    return selectionStart ? [selectionStart] : [];
  }, [dragEnd, dragStart, isDragging, selectionStart]);

  const activeCells = useMemo(
    () => new Set(activeSelectionCells.map(({ row, col }) => `${row}-${col}`)),
    [activeSelectionCells],
  );

  const hintedCellOrder = useMemo(() => {
    const cells = new Map();
    hintedCells.forEach(({ row, col }, index) => cells.set(`${row}-${col}`, index));
    return cells;
  }, [hintedCells]);

  useEffect(() => {
    if (gameStatus !== "playing" || !gameDeadline) return undefined;
    function updateCountdown() {
      const remaining = Math.max(0, Math.ceil((gameDeadline - Date.now()) / 1000));
      setTimeRemaining(remaining);
      if (remaining === 0) {
        setGameStatus("failed");
        setGameDeadline(null);
        setShowFailureModal(true);
      }
    }
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [gameDeadline, gameStatus]);

  useEffect(() => {
    saveActivityProgress(video.id, {
      step,
      matchedVocabulary,
      foundWords,
      attempts,
      timeRemaining,
      gameStatus,
      gameDeadline,
      hintsLeft,
      reflection,
      completed: false,
      updatedAt: Date.now(),
    });
    setSavedAt(Date.now());
  }, [attempts, foundWords, gameDeadline, gameStatus, hintsLeft, matchedVocabulary, reflection, step, timeRemaining, video.id]);

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const remainder = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  function checkSelection(start, end) {
    if (gameStatus !== "playing") return;
    const cells = getLine(start, end);
    if (cells.length < 2) return;
    setAttempts((current) => current + 1);
    const availablePlacements = wordPlacements.filter(({ word }) => !foundWords.some((item) => item.word === word));
    const matchPlacement = availablePlacements.find(({ word, start: wordStart, direction }) => {
      const wordEnd = {
        row: wordStart[0] + direction[0] * (word.length - 1),
        col: wordStart[1] + direction[1] * (word.length - 1),
      };
      return cells.length === word.length &&
        start.row === wordStart[0] && start.col === wordStart[1] &&
        end.row === wordEnd.row && end.col === wordEnd.col;
    });
    const reversedPlacement = availablePlacements.find(({ word, start: wordStart, direction }) => {
      const wordEnd = {
        row: wordStart[0] + direction[0] * (word.length - 1),
        col: wordStart[1] + direction[1] * (word.length - 1),
      };
      return cells.length === word.length &&
        start.row === wordEnd.row && start.col === wordEnd.col &&
        end.row === wordStart[0] && end.col === wordStart[1];
    });
    const match = matchPlacement?.word;

    if (match) {
      const nextTotal = foundWords.length + 1;
      setFoundWords((current) => [...current, { word: match, cells }]);
      setHint("");
      if (match === hintedWord) {
        setHintedWord(null);
        setHintedCells([]);
      }
      setWordFeedback(nextTotal === words.length ? "Kumpleto! Nahanap mo ang lahat ng salita." : `Tama! Nahanap mo ang ${displayPuzzleWord(match)}.`);
      if (nextTotal === words.length) {
        setGameStatus("won");
        setGameDeadline(null);
        setShowSuccessModal(true);
      }
    } else if (reversedPlacement) {
      setWordFeedback(`Baligtad ang pagpili. Magsimula sa unang titik ng ${displayPuzzleWord(reversedPlacement.word)}, pagkatapos ay pumunta sa huling titik.`);
    } else {
      setWordFeedback("Hindi iyon ang hinahanap na salita. Subukan ang ibang direksyon.");
    }
  }

  function selectLetter(row, col) {
    if (Date.now() < ignoreClickUntilRef.current) return;
    const cell = { row, col };
    if (!selectionStart) {
      setSelectionStart(cell);
      return;
    }
    checkSelection(selectionStart, cell);
    setSelectionStart(null);
  }

  function startDrag(row, col) {
    const cell = { row, col };
    setDragStart(cell);
    setDragEnd(cell);
    dragEndRef.current = cell;
    setIsDragging(true);
  }

  function updateDragEnd(row, col) {
    const cell = { row, col };
    dragEndRef.current = cell;
    setDragEnd(cell);
  }

  function trackWordGridPointer(event) {
    if (!isDragging) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-word-cell]");
    if (!target || !event.currentTarget.contains(target)) return;
    updateDragEnd(Number(target.dataset.row), Number(target.dataset.col));
  }

  function cancelDrag() {
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    dragEndRef.current = null;
  }

  function finishDrag(row, col) {
    if (!isDragging || !dragStart) return;
    const end = dragEndRef.current || { row, col };
    const moved = dragStart.row !== end.row || dragStart.col !== end.col;
    if (moved) {
      ignoreClickUntilRef.current = Date.now() + 100;
      checkSelection(dragStart, end);
      setSelectionStart(null);
    }
    cancelDrag();
  }

  function useHint() {
    if (hintsLeft < 1 || gameStatus !== "playing") return;
    const nextWord = wordPlacements.find(({ word }) => !foundWords.some((item) => item.word === word));
    if (!nextWord) return;
    setHintsLeft((current) => current - 1);
    setHint(`${displayPuzzleWord(nextWord.word)}: ${nextWord.clue}`);
    setHintedWord(nextWord.word);
    setHintedCells(Array.from({ length: nextWord.word.length }, (_, index) => ({
      row: nextWord.start[0] + nextWord.direction[0] * index,
      col: nextWord.start[1] + nextWord.direction[1] * index,
    })));
    setWordFeedback(`Clue activated! Sundan ang kumikislap na landas para sa ${displayPuzzleWord(nextWord.word)}.`);
  }

  function selectVocabulary(word) {
    if (matchedVocabulary.includes(word)) return;
    setSelectedVocabulary(word);
    setWrongVocabulary(null);
    setVocabularyFeedback(`Napili ang “${word}.” Hanapin ang kahulugan nito.`);
  }

  function matchVocabulary(definitionWord, chosenWord = selectedVocabulary) {
    if (!chosenWord || matchedVocabulary.includes(definitionWord)) {
      if (!chosenWord) setVocabularyFeedback("Pumili muna ng salita sa kaliwa.");
      return;
    }

    window.clearTimeout(matchingEffectTimerRef.current);
    if (chosenWord === definitionWord) {
      const nextMatches = [...matchedVocabulary, definitionWord];
      setMatchedVocabulary(nextMatches);
      setSelectedVocabulary(null);
      setWrongVocabulary(null);
      setVocabularyFeedback(nextMatches.length === storyContent.vocabulary.length
        ? "Mahusay! Tama ang lahat ng iyong itinugma."
        : `Tama! Magkatugma ang “${definitionWord}” at ang kahulugan nito.`);
      return;
    }

    setWrongVocabulary({ word: chosenWord, definition: definitionWord });
    setVocabularyFeedback("Hindi magkatugma. Subukan muli!");
    matchingEffectTimerRef.current = window.setTimeout(() => setWrongVocabulary(null), 650);
  }

  function goBack() {
    setSelectionStart(null);
    setStep((current) => Math.max(0, current - 1));
  }

  function goNext() {
    setSelectionStart(null);
    if (step === 0 && gameStatus === "ready") {
      setGameStatus("playing");
      setGameDeadline(Date.now() + GAME_DURATION_SECONDS * 1000);
    }
    setStep((current) => Math.min(STEP_LABELS.length - 1, current + 1));
  }

  function retryWordSearch() {
    setFoundWords([]);
    setAttempts(0);
    setTimeRemaining(GAME_DURATION_SECONDS);
    setGameStatus("playing");
    setGameDeadline(Date.now() + GAME_DURATION_SECONDS * 1000);
    setHintsLeft(2);
    setHint("");
    setHintedWord(null);
    setHintedCells([]);
    setWordFeedback("Bagong laro! Hanapin ang unang salita.");
    setSelectionStart(null);
    setShowFailureModal(false);
    setStep(1);
  }

  async function finishActivities() {
    setSubmissionStatus("sending");
    const result = {
      vocabularyScore: matchedVocabulary.length,
      vocabularyTotal: storyContent.vocabulary.length,
      wordSearchStatus: gameStatus,
      wordsFound: foundWords.length,
      wordsTotal: words.length,
      attempts,
      timeUsed: GAME_DURATION_SECONDS - timeRemaining,
      reflectionCompleted: reflection.trim().length >= 20,
      reflectionText: reflection.trim(),
      submissionReference: savedProgress?.result?.submissionReference ?? createAnonymousReference(),
    };
    try {
      await submitAnonymousActivityResult(video, result);
      result.submissionStatus = "sent";
      result.submittedAt = Date.now();
    } catch {
      result.submissionStatus = "failed";
    }
    saveActivityProgress(video.id, {
      step: 2,
      matchedVocabulary,
      foundWords,
      attempts,
      timeRemaining,
      gameStatus,
      gameDeadline: null,
      hintsLeft,
      reflection,
      completed: true,
      result,
      updatedAt: Date.now(),
    });
    setSubmissionStatus(result.submissionStatus);
    onComplete(result);
  }

  function applySentenceStarter(starter) {
    setReflection((current) => current.trim() ? `${current.trim()}\n${starter} ` : `${starter} `);
  }

  function pronounceWord(word) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(word);
    speech.lang = "fil-PH";
    speech.rate = .82;
    window.speechSynthesis.speak(speech);
  }

  return (
    <section className="activities" aria-labelledby="activities-heading">
      <div className="activities__intro">
        <p className="activities__kicker">Gabay sa Pagkatuto</p>
        <h4 id="activities-heading">Mga Aktibidad</h4>
        <p>Palalimin ang iyong pag-unawa sa “{video.title}.”</p>
        <span className="activities__saved"><CloudCheck size={14} /> {savedAt ? "Naka-save ang progreso" : "Awtomatikong nase-save"}</span>
      </div>

      <ol className="activities__progress" aria-label="Progreso sa mga aktibidad">
        {STEP_LABELS.map((label, index) => (
          <li key={label} className={`${index === step ? "is-current" : ""} ${index < step ? "is-done" : ""}`} aria-current={index === step ? "step" : undefined}>
            <span>{index < step ? <Check size={13} aria-hidden="true" /> : index + 1}</span>
            <small>{label}</small>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="activity-card">
          <div className="activity-card__heading"><span>01</span><div><h5>Talasalitaan — Matching Type</h5><p>Pagtambalin ang bawat salita mula sa {storyContent.label} at ang tamang kahulugan nito.</p></div></div>

          <div className="matching-progress" aria-label={`${matchedVocabulary.length} sa ${storyContent.vocabulary.length} ang tama`}>
            <div><span style={{ width: `${(matchedVocabulary.length / storyContent.vocabulary.length) * 100}%` }} /></div>
            <strong>{matchedVocabulary.length} / {storyContent.vocabulary.length} matched</strong>
          </div>

          <div className="matching-game">
            <div className="matching-column matching-column--terms">
              <p>Mga Salita</p>
              {storyContent.vocabulary.map(({ number, word }) => {
                const isMatched = matchedVocabulary.includes(word);
                const isSelected = selectedVocabulary === word;
                const isWrong = wrongVocabulary?.word === word;
                return (
                  <button
                    type="button"
                    key={word}
                    draggable={!isMatched}
                    className={`${isSelected ? "is-selected" : ""} ${isMatched ? "is-matched" : ""} ${isWrong ? "is-wrong" : ""}`}
                    onClick={() => selectVocabulary(word)}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", word);
                      event.dataTransfer.effectAllowed = "move";
                      selectVocabulary(word);
                    }}
                    disabled={isMatched}
                    aria-pressed={isSelected}
                  >
                    <span>{number}</span>
                    <strong>{word}</strong>
                    {isMatched && <Check size={17} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            <div className={`matching-mobile-cue ${selectedVocabulary ? "has-selection" : ""}`} aria-live="polite">
              <span>{selectedVocabulary ? "Napiling salita" : "Susunod na hakbang"}</span>
              <strong>{selectedVocabulary || "Pumili ng salita sa itaas"}</strong>
            </div>

            <div className="matching-column matching-column--definitions">
              <p>Mga Kahulugan</p>
              {shuffledVocabulary.map(({ word, meaning }, index) => {
                const isMatched = matchedVocabulary.includes(word);
                const isWrong = wrongVocabulary?.definition === word;
                return (
                  <button
                    type="button"
                    key={word}
                    className={`${isMatched ? "is-matched" : ""} ${isWrong ? "is-wrong" : ""}`}
                    onClick={() => matchVocabulary(word)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      matchVocabulary(word, event.dataTransfer.getData("text/plain"));
                    }}
                    disabled={isMatched}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    <span>{meaning}</span>
                    {isMatched && <small><Check size={13} aria-hidden="true" /> {word}</small>}
                  </button>
                );
              })}
            </div>
          </div>

          <p className={`matching-feedback ${matchedVocabulary.length === storyContent.vocabulary.length ? "is-complete" : ""} ${wrongVocabulary ? "is-error" : ""}`} aria-live="polite">
            {vocabularyFeedback}
          </p>
          {matchedVocabulary.length > 0 && <div className="pronunciation"><span>Pakinggan ang bigkas:</span>{matchedVocabulary.map((word) => <button type="button" key={word} onClick={() => pronounceWord(word)}><Volume2 size={14} /> {word}</button>)}</div>}
        </div>
      )}

      {step === 1 && (
        <div className="activity-card">
          <div className="activity-card__heading">
            <span>02</span>
            <div>
              <div className="word-search__title"><h5>Word Search</h5><strong>Hard Mode</strong></div>
              <p>{storyContent.label}: Magsimula sa unang titik at pumunta sa huling titik. I-drag o pindutin ang dalawang dulo ng salita.</p>
            </div>
          </div>
          <div className="word-search__stats" aria-label="Kalagayan ng laro">
            <span className={timeRemaining <= 60 && gameStatus === "playing" ? "is-urgent" : ""}><Timer size={14} aria-hidden="true" /> {formatTime(timeRemaining)}</span>
            <span><Target size={14} aria-hidden="true" /> {attempts} pagsubok</span>
            <span>{foundWords.length} / {words.length} nahanap</span>
          </div>
          <div className="word-search__layout">
            <div
              className={`word-grid word-grid--hard ${gameStatus !== "playing" ? "is-game-over" : ""}`}
              role="grid"
              aria-label="Hard mode word search puzzle"
              onPointerMove={trackWordGridPointer}
              onPointerCancel={cancelDrag}
              onPointerLeave={(event) => { if (event.pointerType === "mouse") cancelDrag(); }}
            >
              {wordGrid.map((row, rowIndex) => row.map((letter, colIndex) => {
                const key = `${rowIndex}-${colIndex}`;
                const isStart = selectionStart?.row === rowIndex && selectionStart?.col === colIndex;
                const hintOrder = hintedCellOrder.get(key);
                const isHinted = hintOrder !== undefined;
                return <button
                  type="button"
                  role="gridcell"
                  key={key}
                  data-word-cell="true"
                  data-row={rowIndex}
                  data-col={colIndex}
                  disabled={gameStatus !== "playing"}
                  className={`${isStart ? "is-start" : ""} ${isHinted ? "is-hint" : ""} ${hintOrder === 0 ? "is-hint-start" : ""} ${hintOrder === hintedCells.length - 1 ? "is-hint-end" : ""} ${activeCells.has(key) ? "is-selecting" : ""} ${foundCells.has(key) ? "is-found" : ""}`}
                  style={isHinted ? { "--hint-order": hintOrder } : undefined}
                  onPointerDown={() => startDrag(rowIndex, colIndex)}
                  onPointerEnter={() => { if (isDragging) updateDragEnd(rowIndex, colIndex); }}
                  onPointerUp={() => finishDrag(rowIndex, colIndex)}
                  onClick={() => selectLetter(rowIndex, colIndex)}
                  aria-label={`Titik ${letter}, hanay ${rowIndex + 1}, kolum ${colIndex + 1}${isHinted ? ", bahagi ng clue" : ""}`}
                >{letter}</button>;
              }))}
            </div>
            <div className="word-list" aria-live="polite">
              <p>Mga salitang nakatago</p>
              <ul>{words.map((word) => {
                const isFound = foundWords.some((item) => item.word === word);
                return <li key={word} className={isFound ? "is-found" : ""}>{isFound && <Check size={14} aria-hidden="true" />}{displayPuzzleWord(word)}</li>;
              })}</ul>
              <button type="button" className="hint-button" onClick={useHint} disabled={hintsLeft < 1 || gameStatus !== "playing"}>
                <Lightbulb size={14} aria-hidden="true" /> Clue ({hintsLeft})
              </button>
              {hint && <small className="word-hint">{hint}</small>}
            </div>
          </div>
          <p className={`word-feedback ${foundWords.length === words.length ? "is-complete" : ""}`} aria-live="polite">{wordFeedback}</p>
          {gameStatus === "won" && (
            <div className="game-success" role="status"><PartyPopper size={19} aria-hidden="true" /><strong>Panalo!</strong> Natapos mo ang Word Search bago maubos ang oras.</div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="activity-card">
          <div className="activity-card__heading"><span>03</span><div><h5>Reflection — {storyContent.label}</h5><p>Isulat ang iyong sariling pagninilay tungkol sa kwento.</p></div></div>
          <div className="reflection-field">
            <label htmlFor={`reflection-${video.id}`}>{storyContent.reflection}</label>
            <div className="reflection-starters" aria-label="Mga maaaring panimula ng sagot">
              <small>Subukang simulan sa:</small>
              {storyContent.starters.map((starter) => <button type="button" key={starter} onClick={() => applySentenceStarter(starter)}>{starter}</button>)}
            </div>
            <textarea id={`reflection-${video.id}`} value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder="Isulat dito ang iyong sagot..." rows={6} />
            <small>{reflection.trim().length} / 20 minimum na karakter</small>
          </div>
        </div>
      )}

      <div className="activities__actions">
        {step > 0 && <button type="button" className="activity-button activity-button--quiet" onClick={goBack}><ArrowLeft size={16} aria-hidden="true" /> Bumalik</button>}
        {step === 0 && (
          <button type="button" className="activity-button" onClick={goNext} disabled={matchedVocabulary.length < storyContent.vocabulary.length}>Susunod <ArrowRight size={16} aria-hidden="true" /></button>
        )}
        {step === 1 && (gameStatus === "won" || gameStatus === "failed") && (
          <button type="button" className="activity-button" onClick={goNext}>Magpatuloy sa Reflection <ArrowRight size={16} aria-hidden="true" /></button>
        )}
        {step === 2 && (
          <button type="button" className="activity-button" onClick={finishActivities} disabled={reflection.trim().length < 20 || submissionStatus === "sending"}>
            {submissionStatus === "sending" ? <><RefreshCw className="is-spinning" size={16} aria-hidden="true" /> Ipinapadala...</> : <>Tapusin at Ipadala <Send size={16} aria-hidden="true" /></>}
          </button>
        )}
      </div>

      {showSuccessModal && (
        <div className="game-result game-result--success" role="dialog" aria-modal="true" aria-labelledby="word-search-success-title">
          <div className="victory-confetti" aria-hidden="true">
            {Array.from({ length: 16 }, (_, index) => <i key={index} />)}
          </div>
          <div className="game-result__card">
            <div className="game-result__rings" aria-hidden="true"><span /><span /></div>
            <div className="game-result__icon" aria-hidden="true"><Trophy size={31} /></div>
            <p className="game-result__kicker">Word Search Complete</p>
            <h3 id="word-search-success-title">Mahusay! Panalo ka!</h3>
            <p>Nahanap mo ang lahat ng {words.length} salita bago maubos ang oras.</p>
            <div className="victory-stats">
              <span><Timer size={15} aria-hidden="true" /><strong>{formatTime(GAME_DURATION_SECONDS - timeRemaining)}</strong><small>Oras</small></span>
              <span><Target size={15} aria-hidden="true" /><strong>{attempts}</strong><small>Pagsubok</small></span>
              <span><Check size={15} aria-hidden="true" /><strong>{words.length}/{words.length}</strong><small>Nahanap</small></span>
            </div>
            <button type="button" onClick={() => { setShowSuccessModal(false); setStep(2); }}>
              Magpatuloy sa Reflection <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {showFailureModal && (
        <div className="game-result" role="dialog" aria-modal="true" aria-labelledby="word-search-failed-title">
          <div className="game-result__card">
            <div className="game-result__icon" aria-hidden="true"><TriangleAlert size={30} /></div>
            <p className="game-result__kicker">Naubos ang 10 minuto</p>
            <h3 id="word-search-failed-title">Bumagsak ka sa Word Search.</h3>
            <p>Nahanap mo ang {foundWords.length} sa {words.length} salita. Maaari ka pa ring magpatuloy at sagutan ang Reflection.</p>
            <div className="game-result__actions">
              <button type="button" className="is-secondary" onClick={retryWordSearch}>Subukan Muli</button>
              <button type="button" onClick={() => { setShowFailureModal(false); setStep(2); }}>
                Magpatuloy sa Reflection <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function ActivityComplete({ video, result, onHome, onReview, onRetake, onRestart, onResubmit }) {
  const passedWordSearch = result?.wordSearchStatus === "won";
  return (
    <div className="completion" role="dialog" aria-modal="true" aria-labelledby="completion-title">
      <div className={`completion__mark ${passedWordSearch ? "is-passed" : "is-finished"}`} aria-hidden="true">{passedWordSearch ? <Trophy size={28} /> : <Check size={28} />}</div>
      <p className="completion__kicker">Natapos ang mga aktibidad</p>
      <h3 id="completion-title">{passedWordSearch ? "Mahusay!" : "Natapos mo ang aralin!"}</h3>
      <p>{passedWordSearch
        ? `Kumpleto at matagumpay mong natapos ang lahat ng aktibidad para sa “${video.title}.”`
        : `Natapos mo ang mga aktibidad para sa “${video.title}.” Naubos man ang oras sa Word Search, mahalaga ang iyong pagpapatuloy hanggang Reflection.`}</p>
      <div className="completion__results">
        <article><Check size={16} aria-hidden="true" /><span>Talasalitaan</span><strong>{result?.vocabularyScore ?? 5}/{result?.vocabularyTotal ?? 5}</strong></article>
        <article className={passedWordSearch ? "is-pass" : "is-timeout"}>{passedWordSearch ? <Trophy size={16} aria-hidden="true" /> : <TriangleAlert size={16} aria-hidden="true" />}<span>Word Search</span><strong>{passedWordSearch ? "Nakapasa" : "Time Out"}</strong></article>
        <article><Timer size={16} aria-hidden="true" /><span>Oras</span><strong>{formatDuration(result?.timeUsed)}</strong></article>
        <article><Target size={16} aria-hidden="true" /><span>Reflection</span><strong>{result?.reflectionCompleted ? "Kumpleto" : "Hindi pa"}</strong></article>
      </div>
      <div className="completion__reflection"><span>Iyong Reflection</span><p>{result?.reflectionText || "Naka-save ang iyong Reflection."}</p><button type="button" onClick={onReview}>I-edit ang Reflection</button></div>
      <div className={`completion__submission is-${result?.submissionStatus || "failed"}`} role="status">
        {result?.submissionStatus === "sent" ? <><CloudCheck size={18} aria-hidden="true" /><span><strong>Naipadala na ang anonymous result</strong><small>Walang pangalan o email na isinama sa Google Form.</small></span></> : result?.submissionStatus === "sending" ? <><RefreshCw className="is-spinning" size={18} aria-hidden="true" /><span><strong>Ipinapadala ang result...</strong><small>Huwag munang isara ang pahina.</small></span></> : <><TriangleAlert size={18} aria-hidden="true" /><span><strong>Hindi naipadala ang result</strong><small>Suriin ang internet connection at subukan muli.</small></span><button type="button" onClick={onResubmit}>Subukan Muli</button></>}
      </div>
      <div className="completion__actions">
        <button type="button" onClick={onReview}>I-review ang Sagot</button>
        <button type="button" onClick={onRetake}>Ulitin ang Word Search</button>
        <button type="button" onClick={onRestart}>I-reset Lahat</button>
        <button type="button" onClick={() => window.print()}>I-print ang Resulta</button>
      </div>
      <button type="button" className="completion__home" onClick={onHome}><Home size={17} aria-hidden="true" /> Bumalik sa Homepage</button>
    </div>
  );
}
