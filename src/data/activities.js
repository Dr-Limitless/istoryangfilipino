export const ACTIVITY_VERSION = 2;
export const STORY_ACTIVITIES = {
  "ang-ama": {
    label: "Ang Ama",
    vocabulary: [
      { number: 1, word: "Panaghoy", meaning: "Malakas na pag-iyak dahil sa matinding lungkot." },
      { number: 2, word: "Nagkukubli", meaning: "Nagtatago o umiiwas na makita." },
      { number: 3, word: "Naninipat", meaning: "Matamang tumitingin o nagmamasid." },
      { number: 4, word: "Kimi", meaning: "Mahiyain o hindi palakibo." },
      { number: 5, word: "Nagpupuyos", meaning: "Matinding pag-alab ng damdamin, lalo na ng galit." },
      { number: 6, word: "Dalamhati", meaning: "Matinding lungkot na dulot ng pagkawala o masakit na pangyayari." },
      { number: 7, word: "Pighati", meaning: "Mabigat na sakit ng damdamin." },
      { number: 8, word: "Hinagpis", meaning: "Matinding pagdurusa ng kalooban." },
      { number: 9, word: "Pagkalinga", meaning: "Pag-aalaga at pagbibigay ng malasakit." },
      { number: 10, word: "Pagtitimpi", meaning: "Pagpipigil sa galit o matinding damdamin." },
    ],
    words: ["PAGSISISI", "PAGMAMAHAL", "GALIT", "KAPATAWARAN", "KALUNGKUTAN", "PAMILYA", "MALASAKIT", "PAGKALINGA", "PAGUNAWA", "PAGBABAGO"],
    reflection: "Paano makatutulong ang pagpapatawad at pagmamahal upang mapabuti ang ugnayan sa loob ng pamilya?",
    starters: ["Natutuhan ko na ang pagpapatawad ay...", "Sa aming pamilya, maipapakita ko ang pagmamahal sa pamamagitan ng...", "Kung ako ang nasa kalagayan ng tauhan, ako ay..."],
  },
  "bangkang-papel": {
    label: "Bangkang Papel",
    vocabulary: [
      { number: 1, word: "Saluysoy", meaning: "Mahinang agos ng tubig." },
      { number: 2, word: "Dagundong", meaning: "Malakas at umuugong na tunog." },
      { number: 3, word: "Silahis", meaning: "Maninipis na guhit o sinag ng liwanag." },
      { number: 4, word: "Gulilat", meaning: "Biglang nagising o nabigla." },
      { number: 5, word: "Nagbalikwas", meaning: "Biglang bumangon mula sa pagkakahiga." },
      { number: 6, word: "Gunita", meaning: "Alaala ng nakalipas na pangyayari." },
      { number: 7, word: "Agos", meaning: "Pagdaloy ng tubig sa isang direksiyon." },
      { number: 8, word: "Lumbay", meaning: "Damdamin ng lungkot o pangungulila." },
      { number: 9, word: "Pangungulila", meaning: "Pagkadama ng lungkot dahil sa pagkawala o pagkakalayo." },
      { number: 10, word: "Paglalayag", meaning: "Paglalakbay sa ibabaw ng tubig gamit ang sasakyang pandagat." },
    ],
    words: ["PANGARAP", "ALAALA", "KABATAAN", "PAGLALAKBAY", "KALAYAAN", "GUNITA", "PAGASA", "AGOS", "PAGLALAYAG", "PAGTUKLAS"],
    reflection: "Anong pangarap o alaala noong kabataan ang nais mong dalhin sa iyong paglalakbay sa buhay?",
    starters: ["Ang pangarap na mahalaga sa akin ay...", "Isang alaala na nagbibigay sa akin ng lakas ay...", "Tulad ng bangkang papel, nais kong marating ang..."],
  },
  pamana: {
    label: "Pamana",
    vocabulary: [
      { number: 1, word: "Pinatalagos", meaning: "Ipinadaan o ipinapasok nang malalim." },
      { number: 2, word: "Legasiya", meaning: "Bagay o aral na iniiwan ng isang tao sa iba." },
      { number: 3, word: "Nangakakintal", meaning: "Malalim na naiwan o nakaukit sa alaala." },
      { number: 4, word: "Salakot", meaning: "Panakip sa ulo na ginagamit bilang proteksiyon sa araw." },
      { number: 5, word: "Linang", meaning: "Lupang sinasaka o taniman." },
      { number: 6, word: "Salinlahi", meaning: "Pangkat ng mga taong kabilang sa isang henerasyon." },
      { number: 7, word: "Pag-aaruga", meaning: "Maingat at mapagmahal na pag-aalaga." },
      { number: 8, word: "Ani", meaning: "Bunga o produktong nakukuha mula sa pagsasaka." },
      { number: 9, word: "Bukirin", meaning: "Malawak na lupang ginagamit sa pagtatanim." },
      { number: 10, word: "Pagpupunyagi", meaning: "Patuloy na pagsisikap upang makamit ang layunin." },
    ],
    words: ["PAGSASAKA", "LUPAIN", "KABUHAYAN", "KASIPAGAN", "PAGASA", "SALINLAHI", "PAGARUGA", "ANI", "BUKIRIN", "PAGSISIKAP"],
    reflection: "Anong pamana tungkol sa sipag, lupain, o kabuhayan ang nais mong ipagpatuloy sa susunod na salinlahi?",
    starters: ["Ang pamanang nais kong ipagpatuloy ay...", "Maipapakita ko ang kasipagan sa pamamagitan ng...", "Mahalaga ang lupa at kabuhayan dahil..."],
  },
};

const PUZZLE_SIZE = 12;
const DIRECTIONS = [[1, -1], [0, -1], [-1, 1], [-1, 0], [1, 1], [-1, -1], [1, 0], [0, 1]];
const FILLER_LETTERS = "ABDEGIKLMNOPRSTUY";

export function normalizeStory(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getStoryContent(video) {
  const identity = normalizeStory(`${video.id || ""}${video.title || ""}`);
  if (identity.includes("bangkangpapel")) return STORY_ACTIVITIES["bangkang-papel"];
  if (identity.includes("angama")) return STORY_ACTIVITIES["ang-ama"];
  if (identity.includes("pamana")) return STORY_ACTIVITIES.pamana;
  return STORY_ACTIVITIES.pamana;
}

export function hashString(value) {
  return value.split("").reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 2166136261);
}

function directionClue([rowStep, colStep]) {
  if (rowStep === 0) return colStep < 0 ? "Pahalang, pabalik" : "Pahalang, pasulong";
  if (colStep === 0) return rowStep < 0 ? "Pataas" : "Pababa";
  if (rowStep < 0) return colStep < 0 ? "Pahilis pataas, pabalik" : "Pahilis pataas";
  return colStep < 0 ? "Pahilis pababa, pabalik" : "Pahilis pababa";
}

export function buildWordPuzzle(words, seed) {
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

  if (!placeWord(0)) throw new Error("Hindi mabuo ang palaisipan para sa mga salitang ito.");
  grid.forEach((row, rowIndex) => row.forEach((letter, colIndex) => {
    if (!letter) grid[rowIndex][colIndex] = FILLER_LETTERS[hashString(`${seed}-${rowIndex}-${colIndex}`) % FILLER_LETTERS.length];
  }));
  return { grid, placements };
}
