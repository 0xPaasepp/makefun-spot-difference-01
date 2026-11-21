// Pointer and keyboard input, translated into the game's logical 1280x720 coordinates.
// The game is played with mouse and keyboard: click a difference in either picture,
// H for a hint, P or Escape to pause, M to mute, Enter or Space to confirm a screen.

import { FIELD, PANEL } from './config.js';
import { BUTTONS } from './render.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_MUTE = 8;

/** Which panel, if any, a logical point falls in, with panel-local coordinates. */
export function panelAt(x, y) {
  if (y < PANEL.y || y > PANEL.y + PANEL.height) return null;
  if (x >= PANEL.leftX && x <= PANEL.leftX + PANEL.width) {
    return { panel: 'A', x: x - PANEL.leftX, y: y - PANEL.y };
  }
  if (x >= PANEL.rightX && x <= PANEL.rightX + PANEL.width) {
    return { panel: 'B', x: x - PANEL.rightX, y: y - PANEL.y };
  }
  return null;
}

export function inside(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function createInput(canvas) {
  let actions = 0;
  const clicks = [];
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function measure() {
    const rect = canvas.getBoundingClientRect();
    scale = Math.min(rect.width / FIELD.width, rect.height / FIELD.height);
    offsetX = (rect.width - FIELD.width * scale) / 2;
    offsetY = (rect.height - FIELD.height * scale) / 2;
  }

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offsetX) / scale;
    const y = (event.clientY - rect.top - offsetY) / scale;
    return { x, y };
  }

  canvas.addEventListener('pointerdown', (event) => {
    measure();
    const { x, y } = toLogical(event);
    clicks.push({ x, y });
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Enter' || event.code === 'Space') actions |= ACTION_CONFIRM;
    else if (event.code === 'KeyP' || event.code === 'Escape') actions |= ACTION_PAUSE;
    else if (event.code === 'KeyH') actions |= ACTION_HINT;
    else if (event.code === 'KeyM') actions |= ACTION_MUTE;
  });

  return {
    measure,
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
  };
}
