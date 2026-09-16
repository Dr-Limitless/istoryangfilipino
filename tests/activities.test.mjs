import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { ACTIVITY_VERSION, REFLECTION_RUBRIC, STORY_ACTIVITIES, buildWordPuzzle, normalizeStory } from "../src/data/activities.js";
import { loadActivityProgress, saveActivityProgress, saveLearnerProfile, loadLearnerProfile } from "../src/lib/progress.js";
import { activitySummary } from "../src/lib/activitySummary.js";
import { scoreResult, isBetterScore } from "../src/lib/leaderboardScore.js";
const storage = new Map();
globalThis.window = { localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key,value) => storage.set(key,value), removeItem: key => storage.delete(key) } };
beforeEach(() => storage.clear());
for (const [id, story] of Object.entries(STORY_ACTIVITIES)) {
  test(`${story.label}: all ten words exist in a repeatable, valid grid`, () => {
    assert.equal(story.vocabulary.length,10); assert.equal(story.words.length,10);
    assert.equal(new Set(story.vocabulary.map(v => v.word)).size,10);
    const puzzle = buildWordPuzzle(story.words,normalizeStory(story.label));
    assert.equal(puzzle.placements.length,10);
    assert.deepEqual(buildWordPuzzle(story.words,normalizeStory(story.label)),puzzle);
    for (const placement of puzzle.placements) {
      assert.equal([...placement.word].map((_,i) => puzzle.grid[placement.start[0] + placement.direction[0]*i][placement.start[1] + placement.direction[1]*i]).join(""),placement.word);
    }
    const puzzleSize = Math.max(12, ...story.words.map(word => word.length));
    assert.equal(puzzle.grid.length,puzzleSize);
    assert.equal(puzzle.grid.flat().length,puzzleSize ** 2);
    assert(puzzle.grid.flat().every(letter => /^[A-Z]$/.test(letter)));
    assert.equal(activitySummary({id,title:story.label}).vocabularyTotal,10);
  });
}
test("legacy five-item completion preserves answers but restarts expanded puzzle", () => {
  const words=STORY_ACTIVITIES["ang-ama"].vocabulary.slice(0,5).map(v=>v.word);
  storage.set("istoryang-filipino:activity:ang-ama",JSON.stringify({completed:true,step:2,matchedVocabulary:words,reflection:"Isang mahalagang pagninilay.",gameStatus:"won",foundWords:[{word:"GALIT",cells:[{row:1,col:1}]}]}));
  const migrated=loadActivityProgress("ang-ama");
  assert.deepEqual(migrated.matchedVocabulary,words); assert.equal(migrated.reflection,"Isang mahalagang pagninilay.");
  assert.equal(migrated.completed,false); assert.equal(migrated.gameStatus,"ready"); assert.deepEqual(migrated.foundWords,[]);
  saveActivityProgress("ang-ama",migrated); assert.equal(loadActivityProgress("ang-ama").version,ACTIVITY_VERSION);
  assert.equal(activitySummary({id:"ang-ama"}).completed,false);
});
test("activities can be complete without watching the video", () => {
  saveActivityProgress("ang-ama",{completed:true,matchedVocabulary:STORY_ACTIVITIES["ang-ama"].vocabulary.map(v=>v.word),gameStatus:"failed",reflection:"Ang pagmamahal ay mahalaga sa pamilya."});
  const summary=activitySummary({id:"ang-ama"}); assert.equal(summary.percent,100); assert.equal(summary.completed,true); assert.equal(summary.watched.finished,false);
});
test("nickname changes preserve private certificate name",()=>{saveLearnerProfile({name:"Mag-aaral"});saveLearnerProfile({nickname:"Basa07"});assert.deepEqual(loadLearnerProfile(),{name:"Mag-aaral",nickname:"Basa07"});});
test("leaderboard uses current results and keeps the best score, then fastest time",()=>{
 const result={version:ACTIVITY_VERSION,vocabularyTotal:10,wordsTotal:10,vocabularyScore:10,wordsFound:8,wordSearchStatus:"failed",reflectionCompleted:true,timeUsed:600};
 assert.deepEqual(scoreResult(result),{score:18,timeUsed:600});
 assert.throws(()=>scoreResult({...result,version:1}));assert.throws(()=>scoreResult({...result,wordsFound:11}));
 assert.equal(isBetterScore({score:18,timeUsed:600},{score:20,timeUsed:500}),false);
 assert.equal(isBetterScore({score:20,timeUsed:400},{score:20,timeUsed:500}),true);
 assert.equal(isBetterScore({score:20,timeUsed:500},{score:20,timeUsed:500}),false);
});
test("client-provided activities and reflection rubric are complete",()=>{
 assert.deepEqual(STORY_ACTIVITIES["ang-ama"].vocabulary.slice(5).map(item=>item.word),["Pangungulila","Pagsamo","Pagtitimpi","Hinagpis","Pagpapatawad"]);
 assert.deepEqual(STORY_ACTIVITIES["bangkang-papel"].words.slice(5),["PAGASA","PAGTUKLAS","PAGLISAN","PAKIKIPAGSAPALARAN","PAGBABALIK"]);
 assert.deepEqual(STORY_ACTIVITIES.pamana.words.slice(5),["ANI","BINHI","BUKID","PAGUNLAD","KAYAMANAN"]);
 assert.equal(REFLECTION_RUBRIC.reduce((total,item)=>total+item.points,0),100);
});
