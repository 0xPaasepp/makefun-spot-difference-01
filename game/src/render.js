// Everything the player sees: the two picture panels, the markers on found differences,
// the header with its counter and clock, and every screen (title, pause, scene done,
// failed, victory). The renderer owns the canvas and the confetti; it never owns rules.

import { DIFFS_PER_SCENE, FIELD, FOOTER, HEADER, PANEL, PALETTE, FONT } from './config.js';
import { createRandom } from './random.js';
import { SCENES, TOTAL_DIFFS } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_DONE = 'done';
export const SCREEN_FAILED = 'failed';
export const SCREEN_VICTORY = 'victory';

/** Button rectangles in logical 1280x720 coordinates, shared with the input handler. */
export const BUTTONS = {
  hint: { x: 1030, y: 14, w: 100, h: 36 },
  pause: { x: 1140, y: 14, w: 100, h: 36 },
  play: { x: 490, y: 470, w: 300, h: 64 },
  resume: { x: 490, y: 380, w: 300, h: 60 },
  restart: { x: 490, y: 456, w: 300, h: 60 },
  next: { x: 490, y: 520, w: 300, h: 60 },
  retry: { x: 490, y: 470, w: 300, h: 60 },
  again: { x: 490, y: 540, w: 300, h: 60 },
};

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function text(ctx, str, x, y, size, color, weight = 600, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function button(ctx, rect, label, opts = {}) {
  const { fill = PALETTE.button, color = PALETTE.buttonText, disabled = false } = opts;
  ctx.save();
  if (disabled) ctx.globalAlpha = 0.45;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h / 2, [10, 10, 0, 0]);
  ctx.fill();
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1, 17, color, 700, 'center');
  ctx.restore();
}

export function createRenderer(canvas, seed = 1337) {
  const ctx = canvas.getContext('2d');
  const rng = createRandom(seed);
  const particles = [];
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    scale = Math.min(w / FIELD.width, h / FIELD.height) * dpr;
    offsetX = (canvas.width - FIELD.width * scale) / 2;
    offsetY = (canvas.height - FIELD.height * scale) / 2;
  }

  function burst(x, y, count, colors) {
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x, y,
        vx: (rng() - 0.5) * 520,
        vy: -rng() * 420 - 80,
        size: 5 + rng() * 7,
        color: colors[i % colors.length],
        rot: rng() * Math.PI,
        vr: (rng() - 0.5) * 12,
        life: 1.6 + rng() * 0.8,
        age: 0,
      });
    }
  }

  function stepParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life) {
        particles.splice(i, 1);
        continue;
      }
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      ctx.restore();
    }
  }

  function frame() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0a0f1c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    const g = ctx.createRadialGradient(640, 300, 100, 640, 360, 900);
    g.addColorStop(0, 'rgba(79, 195, 247, 0.07)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  }

  function drawHeader(world, scene, muted) {
    ctx.fillStyle = PALETTE.header;
    ctx.fillRect(0, 0, FIELD.width, HEADER.height);
    ctx.fillStyle = PALETTE.headerLine;
    ctx.fillRect(0, HEADER.height, FIELD.width, 2);
    text(ctx, scene.name, 20, 22, 20, PALETTE.text, 700);
    text(ctx, `Scene ${world.sceneIndex + 1} of ${SCENES.length}  ·  Par ${fmtTime(scene.par)}`, 20, 46, 14, PALETTE.muted);
    const remaining = scene.diffs.length - world.found.size;
    text(ctx, `${remaining} to find`, 640, 32, 32, PALETTE.gold, 800, 'center');
    const low = world.timeLeft <= 15;
    text(ctx, `⏱ ${fmtTime(world.timeLeft)}`, 1010, 26, 20, low ? PALETTE.red : PALETTE.text, 700, 'right');
    text(ctx, `Score ${world.score.toLocaleString()}`, 1010, 48, 14, PALETTE.muted, 600, 'right');
    // Strikes: three small dots that turn red as they are spent.
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = i < world.strikes ? PALETTE.red : '#3a4a6b';
      ctx.beginPath();
      ctx.arc(828 + i * 22, 24, 7, 0, Math.PI * 2);
      ctx.fill();
      if (i < world.strikes) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(828 + i * 22 - 3, 21);
        ctx.lineTo(828 + i * 22 + 3, 27);
        ctx.moveTo(828 + i * 22 + 3, 21);
        ctx.lineTo(828 + i * 22 - 3, 27);
        ctx.stroke();
      }
    }
    text(ctx, 'Strikes', 820, 48, 12, PALETTE.muted, 600);
    button(ctx, BUTTONS.hint, `💡 Hint (${world.hintsLeft})`, { disabled: world.hintsLeft === 0 });
    button(ctx, BUTTONS.pause, '⏸ Pause');
    if (muted) text(ctx, '🔇', 1252, 32, 18, PALETTE.muted, 600, 'center');
    else text(ctx, '🔊', 1252, 32, 18, PALETTE.muted, 600, 'center');
    // The timer bar draining across the top of the play area.
    const frac = Math.max(0, world.timeLeft / scene.par);
    ctx.fillStyle = '#263453';
    ctx.fillRect(0, HEADER.height + 2, FIELD.width, 5);
    ctx.fillStyle = low ? PALETTE.red : frac < 0.4 ? PALETTE.gold : PALETTE.green;
    ctx.fillRect(0, HEADER.height + 2, FIELD.width * frac, 5);
  }

  /** A ring around a found difference, gold on the original, green on the changed picture. */
  function foundRing(px, py, diff, side, isNewest, age) {
    const color = side === 'A' ? PALETTE.gold : PALETTE.green;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(px + diff.x, py + diff.y, diff.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    // A small check badge on the ring's lower edge.
    const bx = px + diff.x + diff.r * 0.62;
    const by = py + diff.y + diff.r * 0.62;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(bx, by, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#10182b';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx - 5, by);
    ctx.lineTo(bx - 1, by + 4);
    ctx.lineTo(bx + 5, by - 4);
    ctx.stroke();
    // The newest find gets one expanding ring that fades out.
    if (isNewest && age < 0.7) {
      ctx.globalAlpha = 1 - age / 0.7;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px + diff.x, py + diff.y, diff.r + age * 46, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPanels(world, scene, now) {
    // Labels above the panels.
    text(ctx, 'LEFT — original', PANEL.leftX + PANEL.width / 2, 84, 14, PALETTE.muted, 700, 'center');
    text(ctx, 'RIGHT — spot the changes', PANEL.rightX + PANEL.width / 2, 84, 14, PALETTE.muted, 700, 'center');
    for (const [side, px] of [['A', PANEL.leftX], ['B', PANEL.rightX]]) {
      ctx.save();
      ctx.shadowColor = PALETTE.panelShadow;
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = PALETTE.panelFrame;
      ctx.beginPath();
      ctx.roundRect(px - 5, PANEL.y - 5, PANEL.width + 10, PANEL.height + 10, 14);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(px, PANEL.y, PANEL.width, PANEL.height, 10);
      ctx.clip();
      ctx.translate(px, PANEL.y);
      scene.paint(ctx, PANEL.width, PANEL.height, side);
      ctx.restore();
      ctx.strokeStyle = PALETTE.panelFrame;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(px, PANEL.y, PANEL.width, PANEL.height, 10);
      ctx.stroke();
    }
    // Markers on both panels for every difference already found.
    scene.diffs.forEach((diff, i) => {
      if (!world.found.has(i)) return;
      const newest = world.lastFind && world.lastFind.x === diff.x && world.lastFind.y === diff.y;
      const age = newest ? now - world.lastFind.at : 99;
      foundRing(PANEL.leftX, PANEL.y, diff, 'A', newest, age);
      foundRing(PANEL.rightX, PANEL.y, diff, 'B', newest, age);
    });
    // A hint pulses a dashed amber ring around one difference not yet found.
    if (world.hint) {
      const diff = scene.diffs[world.hint.diff];
      const pulse = 0.55 + 0.45 * Math.sin(now * 9);
      for (const px of [PANEL.leftX, PANEL.rightX]) {
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = PALETTE.gold;
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.arc(px + diff.x, PANEL.y + diff.y, diff.r + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
    // A missed click leaves a red X that fades fast.
    if (world.lastMiss && now - world.lastMiss.at < 0.6) {
      const age = now - world.lastMiss.at;
      ctx.save();
      ctx.globalAlpha = 1 - age / 0.6;
      ctx.strokeStyle = PALETTE.red;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const mx = world.lastMiss.panel === 'A' ? PANEL.leftX + world.lastMiss.x : PANEL.rightX + world.lastMiss.x;
      const my = PANEL.y + world.lastMiss.y;
      ctx.beginPath();
      ctx.moveTo(mx - 12, my - 12);
      ctx.lineTo(mx + 12, my + 12);
      ctx.moveTo(mx + 12, my - 12);
      ctx.lineTo(mx - 12, my + 12);
      ctx.stroke();
      ctx.restore();
    }
    // The VS badge in the gap between the panels.
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    const vg = ctx.createLinearGradient(614, 295, 666, 347);
    vg.addColorStop(0, '#ff7a5a');
    vg.addColorStop(1, '#d63a3a');
    ctx.fillStyle = vg;
    ctx.beginPath();
    ctx.arc(640, 321, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    text(ctx, 'VS', 640, 322, 19, '#fff', 800, 'center');
  }

  function drawFooter(world) {
    const scene = SCENES[world.sceneIndex];
    text(ctx, 'Found:', 20, FOOTER.y + 24, 15, PALETTE.muted, 600);
    scene.diffs.forEach((diff, i) => {
      const cx = 92 + i * 30;
      const cy = FOOTER.y + 24;
      ctx.fillStyle = world.found.has(i) ? PALETTE.green : '#2c3d5e';
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fill();
      if (world.found.has(i)) {
        ctx.strokeStyle = '#10182b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy);
        ctx.lineTo(cx - 1, cy + 4);
        ctx.lineTo(cx + 5, cy - 4);
        ctx.stroke();
      } else {
        text(ctx, String(i + 1), cx, cy + 1, 11, PALETTE.muted, 700, 'center');
      }
    });
    // Scene pips: five dots, the cleared ones gold.
    text(ctx, 'Scenes', 20, FOOTER.y + 58, 14, PALETTE.muted, 600);
    for (let i = 0; i < SCENES.length; i += 1) {
      const cx = 92 + i * 26;
      const cy = FOOTER.y + 58;
      const cleared = i < world.scenesCleared;
      const current = i === world.sceneIndex && !world.over;
      ctx.fillStyle = cleared ? PALETTE.gold : current ? PALETTE.text : '#2c3d5e';
      ctx.beginPath();
      ctx.arc(cx, cy, current ? 9 : 7, 0, Math.PI * 2);
      ctx.fill();
      if (current) {
        ctx.strokeStyle = PALETTE.gold;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // The combo badge, only while a streak is running.
    if (world.combo >= 2) {
      const label = `COMBO ×${world.combo}`;
      ctx.fillStyle = '#ff7b24';
      ctx.beginPath();
      ctx.roundRect(1080, FOOTER.y + 8, 180, 34, 17);
      ctx.fill();
      text(ctx, label, 1170, FOOTER.y + 26, 17, '#fff', 800, 'center');
    }
    text(ctx, 'Click a difference in either picture  ·  H hint  ·  P pause', 640, FOOTER.y + 58, 13, PALETTE.muted, 500, 'center');
  }

  function overlay(alpha = 0.72) {
    ctx.fillStyle = `rgba(10, 15, 28, ${alpha})`;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  }

  function card(x, y, w, h) {
    ctx.fillStyle = '#1a2440';
    ctx.strokeStyle = '#2c3d5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 18);
    ctx.fill();
    ctx.stroke();
  }

  function starsRow(cx, y, count, size = 30) {
    for (let i = 0; i < 3; i += 1) {
      const sx = cx + (i - 1) * (size * 1.5);
      star(ctx, sx, y, size / 2, i < count ? PALETTE.gold : '#2c3d5e');
    }
  }

  function star(ctx2, x, y, r, color) {
    ctx2.fillStyle = color;
    ctx2.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const ang = -Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? r : r * 0.45;
      const px = x + Math.cos(ang) * rad;
      const py = y + Math.sin(ang) * rad;
      if (i === 0) ctx2.moveTo(px, py);
      else ctx2.lineTo(px, py);
    }
    ctx2.closePath();
    ctx2.fill();
  }

  function drawTitle(best) {
    // The first scene's art, dimmed, behind the title.
    ctx.save();
    ctx.translate(0, 0);
    SCENES[0].paint(ctx, FIELD.width, FIELD.height, 'A');
    ctx.restore();
    overlay(0.78);
    const tg = ctx.createLinearGradient(0, 150, 0, 260);
    tg.addColorStop(0, '#ffe9a8');
    tg.addColorStop(1, PALETTE.gold);
    ctx.fillStyle = tg;
    ctx.font = `800 92px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 24;
    ctx.fillText('TWIN WORLDS', 640, 190);
    ctx.shadowBlur = 0;
    text(ctx, '— Spot the Difference —', 640, 258, 30, PALETTE.text, 600, 'center');
    text(ctx, 'Two pictures. Seven hidden differences. Five worlds to clear.', 640, 300, 19, PALETTE.muted, 500, 'center');
    button(ctx, BUTTONS.play, '▶  PLAY');
    text(ctx, 'Click a difference in either picture  ·  3 strikes ends the scene', 640, 560, 15, PALETTE.muted, 500, 'center');
    text(ctx, 'H for a hint (3 per scene)  ·  P to pause  ·  M to mute', 640, 586, 15, PALETTE.muted, 500, 'center');
    if (best > 0) text(ctx, `Best score: ${best.toLocaleString()}`, 640, 622, 16, PALETTE.gold, 700, 'center');
    // A strip of the five scenes, each painted small with its name beneath.
    const thumbW = 200;
    const thumbH = 110;
    const gap = 16;
    const totalW = SCENES.length * thumbW + (SCENES.length - 1) * gap;
    let tx = (FIELD.width - totalW) / 2;
    const ty = 330;
    SCENES.forEach((scene) => {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(tx, ty, thumbW, thumbH, 10);
      ctx.clip();
      ctx.translate(tx, ty);
      ctx.scale(thumbW / PANEL.width, thumbH / PANEL.height);
      scene.paint(ctx, PANEL.width, PANEL.height, 'A');
      ctx.restore();
      ctx.strokeStyle = PALETTE.panelFrame;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(tx, ty, thumbW, thumbH, 10);
      ctx.stroke();
      text(ctx, scene.name, tx + thumbW / 2, ty + thumbH + 16, 13, PALETTE.text, 600, 'center');
      tx += thumbW + gap;
    });
  }

  function drawPaused() {
    overlay();
    card(390, 220, 500, 300);
    text(ctx, '⏸ Paused', 640, 280, 40, PALETTE.text, 800, 'center');
    text(ctx, 'Take a breath. The differences are not going anywhere.', 640, 326, 16, PALETTE.muted, 500, 'center');
    button(ctx, BUTTONS.resume, '▶  Resume');
    button(ctx, BUTTONS.restart, '↺  Restart scene');
  }

  function drawDone(world) {
    overlay(0.6);
    const scene = SCENES[world.sceneIndex];
    const stars = world.stars[world.stars.length - 1] || 1;
    card(390, 150, 500, 420);
    text(ctx, 'Scene Complete!', 640, 210, 38, PALETTE.gold, 800, 'center');
    starsRow(640, 268, stars, 34);
    text(ctx, scene.name, 640, 318, 20, PALETTE.text, 700, 'center');
    const sceneScore = world.score - world.sceneStartScore;
    text(ctx, `Scene score  +${sceneScore.toLocaleString()}`, 640, 356, 18, PALETTE.text, 600, 'center');
    text(ctx, `Total score  ${world.score.toLocaleString()}`, 640, 388, 18, PALETTE.muted, 600, 'center');
    text(ctx, `${world.scenesCleared} of ${SCENES.length} scenes cleared`, 640, 420, 16, PALETTE.muted, 500, 'center');
    button(ctx, BUTTONS.next, world.sceneIndex + 1 < SCENES.length ? 'Next Scene ▶' : 'See Results ▶');
  }

  function drawFailed(world, reason) {
    overlay();
    card(390, 190, 500, 340);
    text(ctx, reason === 'time' ? "Time's Up!" : 'Three Strikes!', 640, 250, 38, PALETTE.red, 800, 'center');
    text(ctx, reason === 'time' ? 'The clock ran out on this scene.' : 'Three wrong clicks ended the scene.', 640, 296, 16, PALETTE.muted, 500, 'center');
    text(ctx, `You had found ${world.found.size} of ${DIFFS_PER_SCENE} differences.`, 640, 330, 16, PALETTE.text, 600, 'center');
    text(ctx, 'Your score so far is kept. Try the scene again.', 640, 362, 15, PALETTE.muted, 500, 'center');
    button(ctx, BUTTONS.retry, '↺  Try Again');
  }

  function drawVictory(world, best) {
    overlay(0.55);
    const totalStars = world.stars.reduce((a, b) => a + b, 0);
    card(340, 110, 600, 500);
    text(ctx, '🏆 YOU FOUND THEM ALL!', 640, 170, 36, PALETTE.gold, 800, 'center');
    starsRow(640, 228, Math.round(totalStars / 5), 34);
    text(ctx, `${totalStars} of 15 stars across five worlds`, 640, 268, 16, PALETTE.muted, 600, 'center');
    text(ctx, `${world.score.toLocaleString()}`, 640, 330, 56, PALETTE.text, 800, 'center');
    text(ctx, 'TOTAL SCORE', 640, 372, 14, PALETTE.muted, 700, 'center');
    const mins = Math.floor(world.elapsed / 60);
    const secs = Math.floor(world.elapsed % 60);
    const hits = world.totalClicks - world.totalWrong;
    const acc = world.totalClicks === 0 ? 100 : Math.round((hits / world.totalClicks) * 100);
    text(ctx, `Time  ${mins}:${String(secs).padStart(2, '0')}    ·    Accuracy  ${acc}%    ·    Best combo  ×${world.bestCombo}`, 640, 420, 17, PALETTE.text, 600, 'center');
    text(ctx, `Hints used: ${world.hintsUsed}   ·   ${TOTAL_DIFFS} differences found`, 640, 452, 15, PALETTE.muted, 500, 'center');
    if (world.score >= best) text(ctx, '★ New best score! ★', 640, 486, 18, PALETTE.gold, 700, 'center');
    else text(ctx, `Best score: ${best.toLocaleString()}`, 640, 486, 16, PALETTE.muted, 600, 'center');
    button(ctx, BUTTONS.again, '↺  Play Again');
  }

  return { resize, frame, drawHeader, drawPanels, drawFooter, drawTitle, drawPaused, drawDone, drawFailed, drawVictory, burst, stepParticles, drawParticles, ctx };
}
