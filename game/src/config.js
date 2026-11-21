// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical
// area; the renderer scales it to the window, so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

// The two picture panels: 590x450 each, labels above, VS badge in the gap between them.
export const PANEL = { width: 590, height: 450, y: 96, leftX: 20, rightX: 670, gap: 60 };
export const HEADER = { height: 64 };
export const FOOTER = { y: 566 };

/** Fixed simulation step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** Differences in every scene, and how many wrong clicks end a scene attempt. */
export const DIFFS_PER_SCENE = 7;
export const MAX_STRIKES = 3;
export const HINTS_PER_SCENE = 3;

/** Seconds on the clock when a scene starts, and what a hint or a miss costs. */
export const TIMER = { sceneSeconds: 90, wrongClickPenalty: 5, hintRevealSeconds: 2.5 };

/** Points: each find, each combo step, each second left at a scene's end, a perfect scene. */
export const SCORE = { find: 100, comboStep: 25, timeBonusPerSecond: 10, perfectScene: 250 };

/** Stars: 3 when a scene is cleared with no strike and time to spare, else 2 or 1. */
export const STARS = { threeStarTimeLeft: 30, twoStarTimeLeft: 10 };

/** The UI chrome palette: deep navy, warm gold, soft cream. Every scene paints its own art. */
export const PALETTE = {
  backdrop: '#10182b',
  header: '#16213a',
  headerLine: '#263453',
  panelFrame: '#2c3d5e',
  panelShadow: 'rgba(0,0,0,0.45)',
  text: '#f4efe4',
  muted: '#93a1bd',
  gold: '#ffc93c',
  goldDeep: '#e8a91c',
  green: '#3ddc84',
  greenDeep: '#1fae5f',
  red: '#ff5a5a',
  redDeep: '#d63a3a',
  blue: '#4fc3f7',
  button: '#ffb020',
  buttonText: '#231a04',
  vsBadge: '#ff5a5a',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'twin-worlds.best';
export const MUTE_KEY = 'twin-worlds.muted';
