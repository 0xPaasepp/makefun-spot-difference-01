// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps (several in a slow frame, none in a fast one), and the renderer paints what is
// there. The game moves between six screens: title, play, paused, scene done, failed
// and victory.
//
// ?seed=N fixes the random seed. ?shot=start|play|end (with &seed=N) stages that scene
// instead of running the loop, paints it twice and sets window.__shotReady for a screenshot.
import { BEST_KEY, MUTE_KEY, PANEL, STEP } from './config.js';
import { createAudio } from './audio.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_PAUSE, createInput, inside, panelAt } from './input.js';
import {
  BUTTONS,
  SCREEN_DONE,
  SCREEN_FAILED,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_VICTORY,
  createRenderer,
} from './render.js';
import { stageShot } from './shots.js';
import {
  EVENT_FOUND,
  EVENT_GAME_DONE,
  EVENT_HINT,
  EVENT_MISS,
  EVENT_SCENE_DONE,
  EVENT_SCENE_FAILED,
  click,
  createWorld,
  currentScene,
  nextScene,
  retryScene,
  step,
  useHint,
} from './world.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped. */
const MAX_FRAME = 0.25;
const CONFETTI = ['#ffc93c', '#3ddc84', '#4fc3f7', '#ff5a5a', '#ff7fa5', '#b678e8'];

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 1337;

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas, seed);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function readMuted() {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  renderer.resize();
  let painted = 0;
  function paint() {
    renderer.frame();
    if (scene.screen === SCREEN_TITLE) renderer.drawTitle(scene.best);
    else if (scene.screen === SCREEN_PLAY) {
      renderer.drawHeader(world, currentScene(world), audio.muted);
      renderer.drawPanels(world, currentScene(world), world.elapsed);
      renderer.drawFooter(world);
    } else {
      renderer.drawVictory(world, scene.best);
      renderer.burst(640, 200, 90, CONFETTI);
      renderer.stepParticles(0.6);
    }
    renderer.drawParticles();
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let muted = readMuted();
  let failReason = 'time';
  let accumulator = 0;
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen changes.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    Object.assign(world, createWorld());
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Find seven differences in each of five worlds.');
  }

  function endScene() {
    screen = SCREEN_DONE;
    audio.sceneDone();
    renderer.burst(640, 320, 90, CONFETTI);
    announce(`Scene complete. Score ${world.score}.`);
  }

  function endGame() {
    screen = SCREEN_VICTORY;
    if (world.score > best) {
      best = world.score;
      saveBest(best);
    }
    renderer.burst(640, 200, 140, CONFETTI);
    announce(`You found them all. Total score ${world.score}.`);
  }

  function failScene(reason) {
    failReason = reason;
    screen = SCREEN_FAILED;
    audio.fail();
    announce(reason === 'time' ? "Time's up. The scene failed." : 'Three strikes. The scene failed.');
  }

  function toggleMute() {
    muted = audio.toggleMute();
  }

  function handleClick(lx, ly) {
    if (screen === SCREEN_TITLE) {
      if (inside(BUTTONS.play, lx, ly)) {
        audio.click();
        startGame();
      }
      return;
    }
    if (screen === SCREEN_PAUSED) {
      if (inside(BUTTONS.resume, lx, ly)) {
        audio.click();
        screen = SCREEN_PLAY;
        announce('Playing.');
      } else if (inside(BUTTONS.restart, lx, ly)) {
        audio.click();
        retryScene(world);
        screen = SCREEN_PLAY;
        announce('Playing. Scene restarted.');
      }
      return;
    }
    if (screen === SCREEN_DONE) {
      if (inside(BUTTONS.next, lx, ly)) {
        audio.click();
        if (world.over) endGame();
        else {
          nextScene(world);
          screen = SCREEN_PLAY;
          announce(`Scene ${world.sceneIndex + 1}. Find seven differences.`);
        }
      }
      return;
    }
    if (screen === SCREEN_FAILED) {
      if (inside(BUTTONS.retry, lx, ly)) {
        audio.click();
        retryScene(world);
        screen = SCREEN_PLAY;
        announce('Playing. Scene restarted.');
      }
      return;
    }
    if (screen === SCREEN_VICTORY) {
      if (inside(BUTTONS.again, lx, ly)) {
        audio.click();
        startGame();
      }
      return;
    }
    // SCREEN_PLAY: header buttons first, then the pictures.
    if (inside(BUTTONS.hint, lx, ly)) {
      if (useHint(world) & EVENT_HINT) audio.hint();
      return;
    }
    if (inside(BUTTONS.pause, lx, ly)) {
      audio.click();
      screen = SCREEN_PAUSED;
      announce('Paused.');
      return;
    }
    const hit = panelAt(lx, ly);
    if (!hit) return;
    const events = click(world, hit.x, hit.y, hit.panel);
    const px = (hit.panel === 'A' ? PANEL.leftX : PANEL.rightX) + hit.x;
    const py = PANEL.y + hit.y;
    if (events & EVENT_FOUND) {
      audio.find();
      renderer.burst(px, py, 14, ['#ffc93c', '#3ddc84']);
    } else if (events & EVENT_MISS) {
      audio.miss();
    }
    if (events & EVENT_SCENE_FAILED) failScene(world.timeLeft <= 0 ? 'time' : 'strikes');
    else if (events & EVENT_GAME_DONE) endGame();
    else if (events & EVENT_SCENE_DONE) endScene();
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) toggleMute();
    if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    } else if (actions & ACTION_CONFIRM && screen === SCREEN_TITLE) startGame();
    else if (actions & ACTION_CONFIRM && screen === SCREEN_DONE) {
      if (world.over) endGame();
      else {
        nextScene(world);
        screen = SCREEN_PLAY;
      }
    } else if (actions & ACTION_CONFIRM && screen === SCREEN_FAILED) {
      retryScene(world);
      screen = SCREEN_PLAY;
    } else if (actions & ACTION_CONFIRM && screen === SCREEN_VICTORY) startGame();
    else if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      if (useHint(world) & EVENT_HINT) audio.hint();
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    for (const { x, y } of input.takeClicks()) handleClick(x, y);
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP) {
        const events = step(world, STEP);
        accumulator -= STEP;
        if (events & EVENT_SCENE_FAILED) {
          failScene(world.timeLeft <= 0 ? 'time' : 'strikes');
          break;
        }
      }
    } else {
      accumulator = 0;
    }
    renderer.frame();
    const scene = currentScene(world);
    if (screen === SCREEN_TITLE) renderer.drawTitle(best);
    else if (screen === SCREEN_PLAY || screen === SCREEN_PAUSED) {
      renderer.drawHeader(world, scene, muted);
      renderer.drawPanels(world, scene, world.elapsed);
      renderer.drawFooter(world);
      if (screen === SCREEN_PAUSED) renderer.drawPaused();
    } else if (screen === SCREEN_DONE) {
      renderer.drawHeader(world, scene, muted);
      renderer.drawPanels(world, scene, world.elapsed);
      renderer.drawFooter(world);
      renderer.drawDone(world);
    } else if (screen === SCREEN_FAILED) {
      renderer.drawHeader(world, scene, muted);
      renderer.drawPanels(world, scene, world.elapsed);
      renderer.drawFooter(world);
      renderer.drawFailed(world, failReason);
    } else if (screen === SCREEN_VICTORY) {
      renderer.drawVictory(world, best);
    }
    renderer.stepParticles(STEP);
    renderer.drawParticles();
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  input.measure();
  window.addEventListener('resize', () => {
    renderer.resize();
    input.measure();
  });
  renderer.resize();
  announce('Twin Worlds. Spot the difference. Press Enter or click Play to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
