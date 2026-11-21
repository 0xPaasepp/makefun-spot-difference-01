// The game's state and rules: which scene is on, what is found, the clock, the score.
// The world knows nothing about drawing or input: it takes a click in panel coordinates
// and answers what happened, and the renderer paints whatever the world holds.

import { DIFFS_PER_SCENE, HINTS_PER_SCENE, MAX_STRIKES, SCORE, STARS, TIMER } from './config.js';
import { SCENES, TOTAL_DIFFS } from './scenes.js';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_MISS = 2;
export const EVENT_SCENE_DONE = 4;
export const EVENT_GAME_DONE = 8;
export const EVENT_SCENE_FAILED = 16;
export const EVENT_HINT = 32;

/** A fresh state: scene one, nothing found, the clock full, no strikes. */
export function createWorld() {
  return {
    sceneIndex: 0,
    found: new Set(),
    strikes: 0,
    hintsLeft: HINTS_PER_SCENE,
    timeLeft: SCENES[0].par,
    score: 0,
    combo: 0,
    bestCombo: 0,
    totalFound: 0,
    totalClicks: 0,
    totalWrong: 0,
    hintsUsed: 0,
    scenesCleared: 0,
    stars: [],
    hint: null, // { diff, until } while a hint is showing, in seconds of play.
    elapsed: 0,
    over: false,
    won: false,
    failed: false,
    lastFind: null, // { x, y, at } of the newest find, for the ring animation.
    lastMiss: null, // { panel, x, y, at } of the newest miss, for the red X flash.
    sceneStartScore: 0,
  };
}

export function currentScene(world) {
  return SCENES[world.sceneIndex];
}

export function foundCount(world) {
  return world.found.size;
}

export function remainingCount(world) {
  return DIFFS_PER_SCENE - world.found.size;
}

/** Stars for a cleared scene: three with no strike and time to spare, else two or one. */
export function starsFor(world) {
  if (world.strikes === 0 && world.timeLeft >= STARS.threeStarTimeLeft) return 3;
  if (world.timeLeft >= STARS.twoStarTimeLeft) return 2;
  return 1;
}

/** Advance the clock by dt seconds; the timer runs only while the game is live. */
export function step(world, dt) {
  if (world.over || world.failed) return EVENT_NONE;
  world.elapsed += dt;
  world.timeLeft -= dt;
  if (world.hint && world.elapsed >= world.hint.until) world.hint = null;
  if (world.timeLeft <= 0) {
    world.timeLeft = 0;
    world.failed = true;
    return EVENT_SCENE_FAILED;
  }
  return EVENT_NONE;
}

/**
 * A click inside one panel, in that panel's own 590x450 coordinates. A hit must land
 * within a difference's ring (plus a small forgiveness margin); the same spot counts in
 * either panel, and a found difference cannot be found twice.
 */
export function click(world, x, y, panel = 'A') {
  if (world.over || world.failed) return EVENT_NONE;
  world.totalClicks += 1;
  const scene = currentScene(world);
  for (let i = 0; i < scene.diffs.length; i += 1) {
    if (world.found.has(i)) continue;
    const d = scene.diffs[i];
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= (d.r + 6) * (d.r + 6)) {
      world.found.add(i);
      world.totalFound += 1;
      world.combo += 1;
      if (world.combo > world.bestCombo) world.bestCombo = world.combo;
      const gained = SCORE.find + (world.combo - 1) * SCORE.comboStep;
      world.score += gained;
      world.lastFind = { x: d.x, y: d.y, at: world.elapsed };
      if (world.found.size === DIFFS_PER_SCENE) {
        const timeBonus = Math.round(world.timeLeft) * SCORE.timeBonusPerSecond;
        const perfect = world.strikes === 0 ? SCORE.perfectScene : 0;
        world.score += timeBonus + perfect;
        world.scenesCleared += 1;
        world.stars.push(starsFor(world));
        if (world.sceneIndex === SCENES.length - 1) {
          world.over = true;
          world.won = true;
          return EVENT_SCENE_DONE | EVENT_GAME_DONE;
        }
        return EVENT_SCENE_DONE;
      }
      return EVENT_FOUND;
    }
  }
  // A miss: a strike, the combo breaks, and the clock loses five seconds.
  world.totalWrong += 1;
  world.combo = 0;
  world.strikes += 1;
  world.lastMiss = { panel, x, y, at: world.elapsed };
  world.timeLeft = Math.max(0, world.timeLeft - TIMER.wrongClickPenalty);
  if (world.strikes >= MAX_STRIKES) {
    world.failed = true;
    return EVENT_MISS | EVENT_SCENE_FAILED;
  }
  if (world.timeLeft <= 0) {
    world.failed = true;
    return EVENT_MISS | EVENT_SCENE_FAILED;
  }
  return EVENT_MISS;
}

/** Spend a hint: reveal one unfound difference for a few seconds. */
export function useHint(world) {
  if (world.over || world.failed || world.hintsLeft <= 0 || world.hint) return EVENT_NONE;
  const scene = currentScene(world);
  const unfound = scene.diffs.map((d, i) => i).filter((i) => !world.found.has(i));
  if (unfound.length === 0) return EVENT_NONE;
  const pick = unfound[Math.floor(unfound.length / 2)];
  world.hintsLeft -= 1;
  world.hintsUsed += 1;
  world.hint = { diff: pick, until: world.elapsed + TIMER.hintRevealSeconds };
  return EVENT_HINT;
}

/** Move to the next scene after one is cleared: fresh clock, fresh hints, fresh strikes. */
export function nextScene(world) {
  world.sceneIndex += 1;
  world.found = new Set();
  world.strikes = 0;
  world.hintsLeft = HINTS_PER_SCENE;
  world.timeLeft = currentScene(world).par;
  world.combo = 0;
  world.hint = null;
  world.lastFind = null;
  world.lastMiss = null;
  world.sceneStartScore = world.score;
}

/** Retry the scene that just failed: same scene, everything in it reset, score kept. */
export function retryScene(world) {
  world.found = new Set();
  world.strikes = 0;
  world.hintsLeft = HINTS_PER_SCENE;
  world.timeLeft = currentScene(world).par;
  world.combo = 0;
  world.hint = null;
  world.lastFind = null;
  world.lastMiss = null;
  world.failed = false;
  world.sceneStartScore = world.score;
}

/** Accuracy over the whole game, for the victory screen. */
export function accuracy(world) {
  if (world.totalClicks === 0) return 100;
  return Math.round(((world.totalClicks - world.totalWrong) / world.totalClicks) * 100);
}

export { SCENES, TOTAL_DIFFS };
