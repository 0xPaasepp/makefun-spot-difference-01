// The screenshot scenes behind ?shot=start|play|end. Each one stages a real state of the
// game — a fresh title, a mid-game reef with four differences already found and three to
// go, a victory after all five worlds — so the frame is what the game really looks like,
// and the same seed always gives the same frame.

import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_VICTORY } from './render.js';
import { click, createWorld } from './world.js';

/** The four reef differences the play shot has already found, in find order. */
const PLAY_FOUND_SPOTS = [
  { x: 450, y: 150 }, // the turtle
  { x: 502, y: 424 }, // an extra starfish
  { x: 214, y: 128 }, // the school of fish
  { x: 90, y: 190 }, // the seahorse
];

/**
 * Set `world` to the named scene (start, play or end; any other name is start) and return
 * the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  if (name !== 'play' && name !== 'end') {
    Object.assign(world, createWorld());
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'play') {
    Object.assign(world, createWorld());
    world.sceneIndex = 2; // Coral Reef: the most colourful scene.
    // Find four differences for real, through the world's own click rule.
    for (const spot of PLAY_FOUND_SPOTS) click(world, spot.x, spot.y, 'A');
    // Half the clock gone, a combo running, the newest ring still expanding.
    world.timeLeft = 47;
    world.elapsed = 0;
    if (world.lastFind) world.lastFind.at = 0;
    return { screen: SCREEN_PLAY, best: 1250 };
  }
  // The victory: every world cleared, the totals of a real full run.
  Object.assign(world, createWorld());
  world.sceneIndex = 4;
  world.scenesCleared = 5;
  world.stars = [3, 3, 2, 3, 2];
  world.score = 4250;
  world.totalFound = 35;
  world.totalClicks = 41;
  world.totalWrong = 2;
  world.hintsUsed = 3;
  world.bestCombo = 6;
  world.elapsed = 312;
  world.timeLeft = 0;
  world.over = true;
  world.won = true;
  return { screen: SCREEN_VICTORY, best: 3800 };
}
