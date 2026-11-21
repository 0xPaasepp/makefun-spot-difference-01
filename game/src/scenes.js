// The five scenes of Twin Worlds. Each scene paints itself into a 590x450 panel, twice:
// side 'A' is the original, side 'B' is the same picture with seven differences. Every
// difference is listed in the scene's `diffs` with the exact spot it lives at, so the world
// can test a click against it and the renderer can ring it once it is found.
// All art is drawn in code with canvas paths: no image files, no network, nothing borrowed.

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rr(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function tri(ctx, x1, y1, x2, y2, x3, y3, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
}

/** A four-point sparkle star, the kind that reads as a star even when small. */
function star4(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function vgrad(ctx, x, y, w, h, stops) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

function line(ctx, x1, y1, x2, y2, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/** A pine tree: three stacked triangles over a trunk. */
function pine(ctx, x, y, h, color) {
  const w = h * 0.62;
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(x - 4, y - 14, 8, 16);
  tri(ctx, x - w / 2, y - 10, x + w / 2, y - 10, x, y - h, color);
  tri(ctx, x - w * 0.42, y - h * 0.45, x + w * 0.42, y - h * 0.45, x, y - h * 0.85, color);
  tri(ctx, x - w * 0.32, y - h * 0.72, x + w * 0.32, y - h * 0.72, x, y - h * 1.02, color);
}

function cloud(ctx, x, y, s, color) {
  ellipse(ctx, x, y, 34 * s, 20 * s, color);
  ellipse(ctx, x - 24 * s, y + 6 * s, 22 * s, 14 * s, color);
  ellipse(ctx, x + 24 * s, y + 6 * s, 24 * s, 15 * s, color);
}

/* ------------------------------------------------------------------ */
/* Scene 1 — Forest Camp at Dusk                                       */
/* ------------------------------------------------------------------ */
function paintCamp(ctx, W, H, side) {
  ctx.fillStyle = vgrad(ctx, 0, 0, W, 320, [[0, '#2b2a55'], [0.6, '#7a4a72'], [1, '#e8825a']]);
  ctx.fillRect(0, 0, W, 320);
  // Dusk ground: dark green with a warm dirt clearing by the fire.
  ctx.fillStyle = '#22402a';
  ctx.fillRect(0, 300, W, H - 300);
  ellipse(ctx, 300, 400, 210, 46, '#3a2f22');
  // Stars, one of which only the original has.
  star4(ctx, 80, 70, 9, '#ffe9a8');
  star4(ctx, 150, 45, 7, '#fff6d8');
  star4(ctx, 240, 90, 8, '#ffe9a8');
  star4(ctx, 330, 50, 6, '#fff6d8');
  if (side === 'A') star4(ctx, 60, 150, 8, '#ffe9a8');
  // The moon: a crescent in the original, full in the changed picture.
  circle(ctx, 505, 60, 26, '#ffd76a');
  circle(ctx, 505, 60, 34, 'rgba(255, 215, 106, 0.25)');
  if (side === 'A') circle(ctx, 517, 52, 22, '#3a3468');
  // Pines on both sides of the clearing.
  pine(ctx, 70, 330, 110, '#1d3320');
  pine(ctx, 122, 340, 88, '#24401f');
  pine(ctx, 520, 335, 100, '#1d3320');
  pine(ctx, 556, 345, 76, '#24401f');
  // The tent, door open in the original, shut in the changed picture.
  tri(ctx, 140, 385, 280, 385, 210, 250, '#e85d3d');
  tri(ctx, 168, 385, 252, 385, 210, 288, '#c94a2e');
  if (side === 'A') tri(ctx, 192, 385, 228, 385, 210, 312, '#2a1a12');
  else tri(ctx, 192, 385, 228, 385, 210, 312, '#b23f26');
  line(ctx, 210, 250, 210, 288, 4, '#8f3a22');
  // The campfire: stones, crossed logs, a layered flame and its glow.
  circle(ctx, 320, 392, 46, 'rgba(255, 150, 50, 0.20)');
  ellipse(ctx, 292, 398, 14, 9, '#8a8f98');
  ellipse(ctx, 348, 398, 14, 9, '#8a8f98');
  ellipse(ctx, 320, 404, 14, 9, '#6f747e');
  line(ctx, 296, 384, 344, 398, 10, '#6b4423');
  line(ctx, 344, 384, 296, 398, 10, '#7d5230');
  tri(ctx, 320, 330, 302, 392, 338, 392, '#ff7b24');
  tri(ctx, 320, 348, 308, 392, 332, 392, '#ffc93c');
  tri(ctx, 320, 366, 312, 392, 328, 392, '#fff3b0');
  // Fireflies drifting over the clearing.
  circle(ctx, 250, 200, 4, '#d8ff9e');
  circle(ctx, 250, 200, 10, 'rgba(216, 255, 158, 0.25)');
  circle(ctx, 380, 160, 4, '#d8ff9e');
  circle(ctx, 380, 160, 10, 'rgba(216, 255, 158, 0.25)');
  circle(ctx, 300, 120, 3, '#d8ff9e');
  // The owl on its branch, only in the original.
  if (side === 'A') {
    line(ctx, 430, 128, 512, 118, 7, '#4a2f1c');
    ellipse(ctx, 470, 108, 20, 26, '#7a5230');
    ellipse(ctx, 470, 128, 20, 10, '#5d3a1a');
    circle(ctx, 462, 100, 7, '#fff6d8');
    circle(ctx, 478, 100, 7, '#fff6d8');
    circle(ctx, 462, 100, 3, '#1a1a1a');
    circle(ctx, 478, 100, 3, '#1a1a1a');
    tri(ctx, 470, 104, 466, 110, 474, 110, '#ffb020');
  }
  // Mushrooms by the tent: three in the original, two in the changed picture.
  const shrooms = side === 'A' ? [72, 92, 112] : [72, 112];
  for (const mx of shrooms) {
    ctx.fillStyle = '#f6ead2';
    ctx.fillRect(mx - 3, 396, 6, 12);
    ctx.fillStyle = '#e84a3a';
    ctx.beginPath();
    ctx.arc(mx, 396, 11, Math.PI, 0);
    ctx.fill();
    circle(ctx, mx - 4, 390, 2, '#fff');
    circle(ctx, mx + 4, 392, 2, '#fff');
  }
  // The lantern on its post: lit in the original, dark in the changed picture.
  line(ctx, 430, 400, 430, 348, 6, '#4a2f1c');
  if (side === 'A') circle(ctx, 430, 372, 26, 'rgba(255, 200, 80, 0.30)');
  rr(ctx, 420, 358, 20, 28, 5, side === 'A' ? '#ffd76a' : '#5a5f6b');
  rr(ctx, 424, 364, 12, 16, 3, side === 'A' ? '#fff3b0' : '#3a3f4a');
  line(ctx, 418, 358, 442, 358, 4, '#2a1a12');
  // The backpack by the fire: red in the original, blue in the changed picture.
  rr(ctx, 452, 388, 38, 30, 9, side === 'A' ? '#d63a3a' : '#3a6fd6');
  rr(ctx, 460, 396, 22, 16, 5, side === 'A' ? '#b32e2e' : '#2f5cb8');
  line(ctx, 458, 388, 458, 380, 5, '#2a1a12');
  line(ctx, 478, 388, 478, 380, 5, '#2a1a12');
}

const CAMP_DIFFS = [
  { x: 470, y: 120, r: 30, label: 'the owl on the branch' },
  { x: 505, y: 60, r: 28, label: "the moon's shape" },
  { x: 210, y: 340, r: 28, label: 'the tent door' },
  { x: 92, y: 400, r: 24, label: 'the mushrooms' },
  { x: 430, y: 372, r: 22, label: "the lantern's light" },
  { x: 80, y: 70, r: 20, label: 'the bright star' },
  { x: 470, y: 403, r: 26, label: "the backpack's colour" },
];

/* ------------------------------------------------------------------ */
/* Scene 2 — The Cozy Bakery                                           */
/* ------------------------------------------------------------------ */
function paintBakery(ctx, W, H, side) {
  ctx.fillStyle = '#f6e3c2';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#d9a066';
  ctx.fillRect(0, 320, W, 6);
  ctx.fillStyle = '#b98a5a';
  ctx.fillRect(0, 326, W, H - 326);
  for (let x = 0; x < W; x += 74) line(ctx, x, 326, x + 30, H, 2, 'rgba(0,0,0,0.08)');
  // The window: sun by day in the original, the moon in the changed picture.
  rr(ctx, 52, 44, 128, 150, 10, '#8a5a2b');
  rr(ctx, 62, 54, 108, 130, 6, '#aee3f5');
  line(ctx, 116, 54, 116, 184, 6, '#8a5a2b');
  line(ctx, 62, 119, 170, 119, 6, '#8a5a2b');
  if (side === 'A') {
    circle(ctx, 98, 92, 20, '#ffc93c');
    for (let a = 0; a < 8; a += 1) {
      const t = (a / 8) * Math.PI * 2;
      line(ctx, 98 + Math.cos(t) * 26, 92 + Math.sin(t) * 26, 98 + Math.cos(t) * 34, 92 + Math.sin(t) * 34, 3, '#ffc93c');
    }
  } else {
    circle(ctx, 98, 92, 18, '#f4efe4');
    circle(ctx, 92, 88, 4, '#c9c2b2');
    circle(ctx, 104, 98, 3, '#c9c2b2');
  }
  cloud(ctx, 140, 70, 0.5, '#ffffff');
  // The wall clock: three o'clock in the original, five in the changed picture.
  circle(ctx, 300, 80, 30, '#fffaf0');
  circle(ctx, 300, 80, 30, 'rgba(0,0,0,0)');
  ctx.strokeStyle = '#5d3a1a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(300, 80, 30, 0, Math.PI * 2);
  ctx.stroke();
  line(ctx, 300, 80, 300, 58, 4, '#2a1a12');
  if (side === 'A') line(ctx, 300, 80, 320, 80, 4, '#2a1a12');
  else line(ctx, 300, 80, 314, 94, 4, '#2a1a12');
  circle(ctx, 300, 80, 3, '#2a1a12');
  // The shelf with the bread: a round loaf in the original, a baguette in the changed one.
  rr(ctx, 270, 148, 290, 12, 4, '#8a5a2b');
  if (side === 'A') {
    ellipse(ctx, 320, 136, 30, 16, '#c98d4b');
    ellipse(ctx, 320, 130, 22, 9, '#e8b478');
  } else {
    rr(ctx, 288, 128, 64, 16, 8, '#c98d4b');
    line(ctx, 300, 130, 300, 142, 2, '#a8743a');
    line(ctx, 316, 130, 316, 142, 2, '#a8743a');
    line(ctx, 332, 130, 332, 142, 2, '#a8743a');
  }
  ellipse(ctx, 420, 138, 20, 12, '#7a4a22');
  circle(ctx, 480, 136, 13, '#e8b478');
  circle(ctx, 480, 136, 13, 'rgba(0,0,0,0)');
  // A framed picture and hanging herbs on the wall.
  rr(ctx, 470, 60, 60, 46, 6, '#7a4a22');
  rr(ctx, 476, 66, 48, 34, 3, '#aee3f5');
  tri(ctx, 484, 96, 500, 76, 516, 96, '#3f7a3a');
  line(ctx, 420, 60, 420, 92, 3, '#3f7a3a');
  ellipse(ctx, 420, 96, 12, 6, '#3f7a3a');
  // The counter with jars, and the teapot that only the original has.
  rr(ctx, 0, 330, W, 16, 0, '#8a5a2b');
  rr(ctx, 220, 296, 34, 34, 6, 'rgba(255,255,255,0.45)');
  rr(ctx, 228, 304, 18, 18, 4, '#c98d4b');
  rr(ctx, 258, 296, 34, 34, 6, 'rgba(255,255,255,0.45)');
  rr(ctx, 266, 304, 18, 18, 4, '#d63a3a');
  if (side === 'A') {
    ellipse(ctx, 150, 312, 26, 18, '#4f7ec2');
    rr(ctx, 142, 288, 16, 12, 5, '#4f7ec2');
    tri(ctx, 176, 300, 192, 308, 176, 316, '#4f7ec2');
    line(ctx, 126, 300, 118, 312, 5, '#4f7ec2');
  }
  // The croissant basket: three in the original, two in the changed picture.
  rr(ctx, 368, 332, 84, 26, 8, '#a8743a');
  const crois = side === 'A' ? [384, 404, 424] : [384, 424];
  for (const cx of crois) {
    ellipse(ctx, cx, 326, 16, 10, '#e8b478');
    ellipse(ctx, cx, 322, 10, 6, '#f6d29a');
  }
  // The cat asleep on the rug, only in the original.
  ellipse(ctx, 480, 412, 66, 16, '#c94a2e');
  ellipse(ctx, 480, 412, 52, 10, '#d95d3d');
  if (side === 'A') {
    ellipse(ctx, 470, 398, 34, 16, '#f08a3c');
    circle(ctx, 442, 392, 12, '#f08a3c');
    tri(ctx, 434, 384, 438, 374, 444, 382, '#f08a3c');
    tri(ctx, 448, 382, 452, 372, 456, 382, '#f08a3c');
    ellipse(ctx, 492, 402, 22, 8, '#f08a3c');
    line(ctx, 436, 394, 442, 394, 2, '#2a1a12');
  }
  // The hanging lamp: glowing in the original, dark in the changed picture.
  line(ctx, 520, 0, 520, 40, 4, '#2a1a12');
  if (side === 'A') circle(ctx, 520, 66, 30, 'rgba(255, 200, 80, 0.30)');
  tri(ctx, 520, 40, 500, 72, 540, 72, side === 'A' ? '#ffb020' : '#5a5f6b');
  circle(ctx, 520, 74, 7, side === 'A' ? '#fff3b0' : '#3a3f4a');
}

const BAKERY_DIFFS = [
  { x: 110, y: 115, r: 28, label: 'the sky in the window' },
  { x: 320, y: 132, r: 24, label: 'the bread on the shelf' },
  { x: 300, y: 80, r: 26, label: "the clock's hands" },
  { x: 150, y: 302, r: 26, label: 'the teapot' },
  { x: 404, y: 326, r: 24, label: 'the croissants' },
  { x: 470, y: 400, r: 30, label: 'the sleeping cat' },
  { x: 520, y: 62, r: 26, label: "the lamp's glow" },
];

/* ------------------------------------------------------------------ */
/* Scene 3 — Coral Reef                                                */
/* ------------------------------------------------------------------ */
function paintReef(ctx, W, H, side) {
  ctx.fillStyle = vgrad(ctx, 0, 0, W, H, [[0, '#0b6fa8'], [0.6, '#0a5a8c'], [1, '#074a7a']]);
  ctx.fillRect(0, 0, W, H);
  // Sun rays slanting down from the surface.
  ctx.fillStyle = 'rgba(255, 255, 220, 0.10)';
  ctx.beginPath();
  ctx.moveTo(60, 0);
  ctx.lineTo(140, 0);
  ctx.lineTo(260, 380);
  ctx.lineTo(140, 380);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(300, 0);
  ctx.lineTo(350, 0);
  ctx.lineTo(430, 380);
  ctx.lineTo(360, 380);
  ctx.closePath();
  ctx.fill();
  // The sandy floor.
  ctx.fillStyle = '#e8d29a';
  ctx.fillRect(0, 380, W, H - 380);
  ellipse(ctx, 120, 396, 60, 10, '#d9bf85');
  ellipse(ctx, 420, 410, 80, 12, '#d9bf85');
  // Seaweed swaying on the floor.
  for (const [sx, sh, col] of [[40, 70, '#2e8b57'], [64, 52, '#3aa76d'], [540, 66, '#2e8b57'], [562, 48, '#3aa76d']]) {
    ctx.strokeStyle = col;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, 450);
    ctx.quadraticCurveTo(sx + 12, 420, sx + 4, 450 - sh);
    ctx.stroke();
  }
  // Corals: pink branches left, purple fans right.
  ctx.strokeStyle = '#ff7fa5';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  for (const [x1, y1, x2, y2] of [[60, 430, 50, 350], [60, 400, 36, 340], [60, 400, 86, 336], [60, 370, 44, 320]]) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.strokeStyle = '#b678e8';
  for (const [x1, y1, x2, y2] of [[520, 430, 528, 350], [520, 400, 498, 340], [520, 400, 544, 344]]) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  // The seahorse, only in the original: head and snout, arched back, curled tail.
  if (side === 'A') {
    ctx.strokeStyle = '#ff9e4f';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(98, 168);
    ctx.quadraticCurveTo(76, 180, 80, 200);
    ctx.quadraticCurveTo(83, 216, 96, 222);
    ctx.stroke();
    circle(ctx, 100, 164, 8, '#ff9e4f');
    tri(ctx, 106, 160, 116, 166, 106, 170, '#ff9e4f');
    circle(ctx, 102, 161, 2, '#1a1a1a');
    tri(ctx, 82, 186, 74, 192, 82, 196, '#ffb37a');
    ctx.beginPath();
    ctx.arc(96, 224, 8, 0.3, Math.PI * 1.6);
    ctx.stroke();
  }
  // The school of fish: five in the original, four in the changed picture.
  const fish = side === 'A' ? [170, 200, 230, 258, 286] : [170, 200, 230, 286];
  for (const fx of fish) {
    const fy = 118 + ((fx * 7) % 22);
    ellipse(ctx, fx, fy, 16, 9, '#ffd94f');
    tri(ctx, fx - 14, fy, fx - 24, fy - 7, fx - 24, fy + 7, '#f2b705');
    circle(ctx, fx + 8, fy - 2, 2, '#1a1a1a');
  }
  // The turtle, only in the original.
  if (side === 'A') {
    ellipse(ctx, 450, 150, 42, 26, '#4f9e57');
    ellipse(ctx, 450, 150, 30, 18, '#7bc47f');
    circle(ctx, 496, 146, 12, '#4f9e57');
    circle(ctx, 500, 142, 2, '#1a1a1a');
    ellipse(ctx, 420, 126, 16, 7, '#4f9e57');
    ellipse(ctx, 420, 172, 16, 7, '#4f9e57');
    ellipse(ctx, 478, 128, 14, 6, '#4f9e57');
    ellipse(ctx, 478, 170, 14, 6, '#4f9e57');
  }
  // The octopus: purple in the original, orange in the changed picture.
  const octo = side === 'A' ? '#9b59d0' : '#ff7b24';
  circle(ctx, 120, 296, 30, octo);
  for (let t = 0; t < 5; t += 1) {
    const tx = 96 + t * 12;
    ctx.strokeStyle = octo;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tx, 318);
    ctx.quadraticCurveTo(tx + 4, 340, tx - 2 + (t % 2) * 6, 352);
    ctx.stroke();
  }
  circle(ctx, 110, 290, 5, '#fff');
  circle(ctx, 130, 290, 5, '#fff');
  circle(ctx, 110, 290, 2, '#1a1a1a');
  circle(ctx, 130, 290, 2, '#1a1a1a');
  // Bubbles rising from the coral: three in the original, one in the changed picture.
  const bubbles = side === 'A' ? [[372, 232, 8], [388, 214, 6], [398, 236, 5]] : [[384, 224, 7]];
  for (const [bx, by, br] of bubbles) {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.stroke();
  }
  // The treasure chest: open and glowing in the original, shut in the changed picture.
  rr(ctx, 272, 386, 56, 30, 6, '#7a4a22');
  rr(ctx, 272, 386, 56, 10, 6, '#8a5a2b');
  if (side === 'A') {
    ctx.save();
    ctx.translate(300, 386);
    ctx.rotate(-0.5);
    rr(ctx, -28, -22, 56, 12, 6, '#8a5a2b');
    ctx.restore();
    circle(ctx, 300, 384, 18, 'rgba(255, 215, 106, 0.45)');
    circle(ctx, 290, 382, 6, '#ffd76a');
    circle(ctx, 302, 380, 5, '#ffc93c');
    circle(ctx, 312, 384, 6, '#ffd76a');
  } else {
    rr(ctx, 272, 378, 56, 12, 6, '#8a5a2b');
    line(ctx, 300, 378, 300, 390, 4, '#ffd76a');
  }
  // Starfish on the sand: two in the original, three in the changed picture.
  const stars = side === 'A' ? [[478, 404], [528, 418]] : [[478, 404], [528, 418], [502, 428]];
  for (const [sx, sy] of stars) star4(ctx, sx, sy, 12, '#ff9e7a');
  // A drifting jellyfish, a crab on the sand, shells and small fish fill the water.
  ellipse(ctx, 540, 96, 22, 16, 'rgba(255, 180, 220, 0.85)');
  ctx.strokeStyle = 'rgba(255, 180, 220, 0.7)';
  ctx.lineWidth = 3;
  for (let t = 0; t < 4; t += 1) {
    const jx = 528 + t * 8;
    ctx.beginPath();
    ctx.moveTo(jx, 110);
    ctx.quadraticCurveTo(jx + 4, 126, jx - 2, 138);
    ctx.stroke();
  }
  ellipse(ctx, 200, 416, 18, 11, '#e84a3a');
  circle(ctx, 214, 410, 6, '#e84a3a');
  line(ctx, 184, 424, 176, 432, 3, '#e84a3a');
  line(ctx, 216, 424, 224, 432, 3, '#e84a3a');
  ellipse(ctx, 330, 258, 12, 7, '#7fd4ff');
  tri(ctx, 320, 258, 312, 252, 312, 264, '#5db8e8');
  ellipse(ctx, 480, 262, 12, 7, '#7fd4ff');
  tri(ctx, 470, 262, 462, 256, 462, 268, '#5db8e8');
  ellipse(ctx, 150, 424, 10, 7, '#f4efe4');
  ellipse(ctx, 430, 428, 10, 7, '#ffd94f');
  // A clownfish sheltering by the pink coral.
  ellipse(ctx, 112, 372, 13, 8, '#ff7b24');
  tri(ctx, 101, 372, 94, 366, 94, 378, '#f4efe4');
  line(ctx, 108, 364, 108, 380, 3, '#f4efe4');
  circle(ctx, 120, 370, 2, '#1a1a1a');
}

const REEF_DIFFS = [
  { x: 450, y: 150, r: 34, label: 'the turtle' },
  { x: 120, y: 300, r: 30, label: "the octopus's colour" },
  { x: 502, y: 424, r: 22, label: 'an extra starfish' },
  { x: 300, y: 390, r: 28, label: 'the treasure chest' },
  { x: 214, y: 128, r: 26, label: 'the school of fish' },
  { x: 384, y: 224, r: 22, label: 'the bubbles' },
  { x: 90, y: 190, r: 26, label: 'the seahorse' },
];

/* ------------------------------------------------------------------ */
/* Scene 4 — Mountain Railway                                          */
/* ------------------------------------------------------------------ */
function paintRailway(ctx, W, H, side) {
  ctx.fillStyle = vgrad(ctx, 0, 0, W, H, [[0, '#aee3f5'], [0.55, '#d8f0e4'], [1, '#f6e3c2']]);
  ctx.fillRect(0, 0, W, H);
  // The sun and clouds.
  circle(ctx, 70, 70, 30, '#ffd94f');
  for (let a = 0; a < 8; a += 1) {
    const t = (a / 8) * Math.PI * 2;
    line(ctx, 70 + Math.cos(t) * 36, 70 + Math.sin(t) * 36, 70 + Math.cos(t) * 44, 70 + Math.sin(t) * 44, 3, '#ffd94f');
  }
  cloud(ctx, 180, 70, 0.9, '#ffffff');
  cloud(ctx, 470, 55, 0.7, '#ffffff');
  // Birds: three in the original, two in the changed picture.
  const birds = side === 'A' ? [380, 410, 440] : [380, 440];
  for (const bx of birds) {
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx - 8, 80);
    ctx.quadraticCurveTo(bx - 3, 72, bx, 80);
    ctx.quadraticCurveTo(bx + 3, 72, bx + 8, 80);
    ctx.stroke();
  }
  // The mountain range, its tallest peak capped with snow only in the original.
  tri(ctx, 0, 300, 180, 300, 90, 170, '#7a9ab5');
  tri(ctx, 120, 300, 380, 300, 250, 110, '#5d84a3');
  tri(ctx, 320, 300, 590, 300, 470, 150, '#7a9ab5');
  if (side === 'A') {
    tri(ctx, 228, 160, 272, 160, 250, 110, '#ffffff');
    tri(ctx, 214, 176, 236, 176, 222, 146, '#ffffff');
    tri(ctx, 264, 176, 286, 176, 276, 148, '#ffffff');
  }
  ctx.fillStyle = '#5d8a4a';
  ctx.fillRect(0, 300, W, 150);
  // The trestle bridge and the train: three cars in the original, two in the changed one.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(80, 300, 430, 10);
  for (let bx = 110; bx <= 480; bx += 46) ctx.fillRect(bx, 310, 10, 44);
  line(ctx, 80, 300, 510, 300, 3, '#5d3a1a');
  const cars = side === 'A' ? [150, 230, 310] : [150, 310];
  for (const cx of cars) {
    rr(ctx, cx, 258, 72, 42, 8, '#d63a3a');
    rr(ctx, cx + 8, 266, 18, 14, 3, '#aee3f5');
    rr(ctx, cx + 30, 266, 18, 14, 3, '#aee3f5');
    circle(ctx, cx + 16, 302, 7, '#2a2a2a');
    circle(ctx, cx + 56, 302, 7, '#2a2a2a');
  }
  rr(ctx, 392, 252, 62, 48, 8, '#2f5cb8');
  tri(ctx, 454, 252, 478, 266, 454, 282, '#2f5cb8');
  rr(ctx, 400, 260, 16, 12, 3, '#aee3f5');
  circle(ctx, 408, 302, 7, '#2a2a2a');
  circle(ctx, 440, 302, 7, '#2a2a2a');
  // The tunnel mouth: open and dark in the original, blocked with rocks in the changed one.
  rr(ctx, 500, 268, 60, 62, 20, '#6f6f6f');
  if (side === 'A') {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(530, 330, 20, 30, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(510, 300, 40, 30);
  } else {
    ellipse(ctx, 518, 318, 12, 9, '#8a8f98');
    ellipse(ctx, 540, 322, 13, 10, '#6f747e');
    ellipse(ctx, 530, 306, 11, 8, '#9aa0ab');
  }
  // The signal: green in the original, red in the changed picture.
  line(ctx, 150, 354, 150, 292, 6, '#2a2a2a');
  rr(ctx, 138, 268, 24, 26, 5, '#2a2a2a');
  circle(ctx, 150, 281, 7, side === 'A' ? '#3ddc84' : '#ff5a5a');
  // Pines in the foreground: five in the original, four in the changed picture.
  const pines = side === 'A' ? [60, 110, 160, 210, 560] : [60, 160, 210, 560];
  for (const px of pines) pine(ctx, px, 430, 78, '#2e6b34');
  // Sheep on the meadow: two in the original, three in the changed picture.
  const sheep = side === 'A' ? [430, 480] : [430, 480, 520];
  for (const sx of sheep) {
    ellipse(ctx, sx, 410, 22, 14, '#f4f4f4');
    circle(ctx, sx + 22, 402, 9, '#f4f4f4');
    circle(ctx, sx + 25, 400, 2, '#1a1a1a');
    line(ctx, sx - 12, 420, sx - 12, 432, 3, '#2a2a2a');
    line(ctx, sx + 10, 420, sx + 10, 432, 3, '#2a2a2a');
  }
  // Wildflowers along the bottom edge.
  for (const [fx, col] of [[250, '#ff7fa5'], [300, '#ffd94f'], [350, '#ffffff'], [560, '#ff7fa5']]) {
    circle(ctx, fx, 436, 4, col);
    line(ctx, fx, 440, fx, 450, 2, '#2e6b34');
  }
}

const RAILWAY_DIFFS = [
  { x: 270, y: 278, r: 30, label: 'the train cars' },
  { x: 520, y: 408, r: 26, label: 'an extra sheep' },
  { x: 150, y: 281, r: 22, label: "the signal's light" },
  { x: 410, y: 80, r: 24, label: 'the birds' },
  { x: 250, y: 140, r: 28, label: 'the snow on the peak' },
  { x: 530, y: 312, r: 26, label: 'the tunnel mouth' },
  { x: 110, y: 398, r: 24, label: 'the pine trees' },
];

/* ------------------------------------------------------------------ */
/* Scene 5 — Night Market                                              */
/* ------------------------------------------------------------------ */
function paintMarket(ctx, W, H, side) {
  ctx.fillStyle = vgrad(ctx, 0, 0, W, H, [[0, '#141c3a'], [0.6, '#2a3a6e'], [1, '#3a2a55']]);
  ctx.fillRect(0, 0, W, H);
  // Stars and the moon: full in the original, a crescent in the changed picture.
  star4(ctx, 60, 60, 7, '#fff6d8');
  star4(ctx, 140, 40, 6, '#fff6d8');
  star4(ctx, 300, 50, 7, '#fff6d8');
  star4(ctx, 380, 80, 5, '#fff6d8');
  star4(ctx, 460, 40, 6, '#fff6d8');
  circle(ctx, 520, 70, 24, '#f4efe4');
  if (side === 'B') circle(ctx, 530, 62, 20, '#232c52');
  // String lights swooping across the top: one bulb dark in the changed picture.
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 30);
  ctx.quadraticCurveTo(150, 95, 300, 40);
  ctx.quadraticCurveTo(450, 95, 590, 35);
  ctx.stroke();
  const bulbs = [[60, 52], [150, 72], [240, 52], [330, 56], [420, 72], [510, 52]];
  for (const [bx, by] of bulbs) {
    const dark = side === 'B' && bx === 150;
    circle(ctx, bx, by, 10, dark ? '#3a3f4a' : 'rgba(255, 200, 80, 0.35)');
    circle(ctx, bx, by, 6, dark ? '#5a5f6b' : '#ffd76a');
  }
  // The cobbled ground.
  ctx.fillStyle = '#4a3a52';
  ctx.fillRect(0, 380, W, H - 380);
  ellipse(ctx, 120, 400, 46, 9, '#5d4a68');
  ellipse(ctx, 300, 420, 60, 10, '#5d4a68');
  ellipse(ctx, 480, 404, 52, 9, '#5d4a68');
  // The left stall with its fruit crates.
  rr(ctx, 60, 190, 200, 12, 4, '#8a5a2b');
  line(ctx, 70, 202, 70, 380, 8, '#6b4423');
  line(ctx, 250, 202, 250, 380, 8, '#6b4423');
  rr(ctx, 60, 202, 200, 178, 4, '#c98d4b');
  rr(ctx, 60, 202, 200, 26, 4, '#a8743a');
  // Striped awning over the left stall.
  for (let i = 0; i < 5; i += 1) {
    tri(ctx, 52 + i * 42, 190, 94 + i * 42, 190, 73 + i * 42, 152, i % 2 === 0 ? '#d63a3a' : '#f4efe4');
  }
  // The right stall: its awning is red and white in the original, blue and white changed.
  rr(ctx, 330, 190, 200, 12, 4, '#8a5a2b');
  line(ctx, 340, 202, 340, 380, 8, '#6b4423');
  line(ctx, 520, 202, 520, 380, 8, '#6b4423');
  rr(ctx, 330, 202, 200, 178, 4, '#c98d4b');
  rr(ctx, 330, 202, 200, 26, 4, '#a8743a');
  const stripeA = side === 'A' ? '#d63a3a' : '#3a6fd6';
  for (let i = 0; i < 5; i += 1) {
    tri(ctx, 322 + i * 42, 190, 364 + i * 42, 190, 343 + i * 42, 152, i % 2 === 0 ? stripeA : '#f4efe4');
  }
  // Goods on the stalls, painted after the stall fronts so they stay visible.
  // The left stall's bread basket and jar.
  rr(ctx, 90, 320, 76, 24, 7, '#a8743a');
  ellipse(ctx, 112, 314, 15, 9, '#e8b478');
  ellipse(ctx, 136, 312, 15, 9, '#d9a05e');
  ellipse(ctx, 154, 316, 12, 8, '#e8b478');
  rr(ctx, 200, 302, 26, 30, 5, 'rgba(255,255,255,0.4)');
  rr(ctx, 206, 310, 14, 14, 3, '#b678e8');
  // Apples in the crate on the right stall: four in the original, three in the changed picture.
  rr(ctx, 336, 316, 76, 26, 6, '#8a5a2b');
  const apples = side === 'A' ? [348, 366, 384, 402] : [348, 366, 402];
  for (const ax of apples) {
    circle(ctx, ax, 306, 10, '#e84a3a');
    line(ctx, ax, 296, ax + 3, 290, 2, '#2e6b34');
  }
  // Jars of sweets on the right stall's counter.
  rr(ctx, 430, 300, 26, 30, 5, 'rgba(255,255,255,0.4)');
  rr(ctx, 436, 308, 14, 14, 3, '#ff7fa5');
  rr(ctx, 464, 300, 26, 30, 5, 'rgba(255,255,255,0.4)');
  rr(ctx, 470, 308, 14, 14, 3, '#ffd94f');
  rr(ctx, 496, 300, 26, 30, 5, 'rgba(255,255,255,0.4)');
  rr(ctx, 502, 308, 14, 14, 3, '#3ddc84');
  // The hanging paper lantern: red in the original, yellow in the changed picture.
  line(ctx, 200, 152, 200, 120, 3, '#1a1a1a');
  circle(ctx, 200, 134, 16, side === 'A' ? '#d63a3a' : '#ffd94f');
  circle(ctx, 200, 134, 20, side === 'A' ? 'rgba(214, 58, 58, 0.3)' : 'rgba(255, 217, 79, 0.3)');
  line(ctx, 200, 118, 200, 112, 3, '#ffd76a');
  // The vendor's cart, its wheel there in the original and gone in the changed picture.
  rr(ctx, 40, 360, 110, 34, 8, '#7a4a22');
  circle(ctx, 70, 376, 12, '#c98d4b');
  circle(ctx, 110, 376, 12, '#c98d4b');
  line(ctx, 40, 360, 28, 340, 6, '#6b4423');
  line(ctx, 150, 360, 162, 340, 6, '#6b4423');
  if (side === 'A') {
    circle(ctx, 95, 398, 14, '#2a2a2a');
    circle(ctx, 95, 398, 6, '#8a8f98');
  }
  // Baskets and a crate stacked by the stalls.
  rr(ctx, 270, 356, 40, 26, 6, '#a8743a');
  ellipse(ctx, 290, 352, 20, 8, '#e8b478');
  rr(ctx, 540, 356, 36, 26, 6, '#8a5a2b');
  // The black cat on its crate, only in the original.
  if (side === 'A') {
    ellipse(ctx, 500, 388, 26, 13, '#1a1a1a');
    circle(ctx, 478, 380, 10, '#1a1a1a');
    tri(ctx, 472, 374, 474, 364, 479, 372, '#1a1a1a');
    tri(ctx, 482, 372, 486, 362, 488, 372, '#1a1a1a');
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(522, 384);
    ctx.quadraticCurveTo(536, 372, 530, 360);
    ctx.stroke();
    circle(ctx, 474, 378, 2, '#ffd76a');
  }
}

const MARKET_DIFFS = [
  { x: 520, y: 70, r: 26, label: "the moon's shape" },
  { x: 150, y: 72, r: 22, label: 'the dark bulb' },
  { x: 445, y: 175, r: 28, label: "the awning's stripes" },
  { x: 200, y: 134, r: 26, label: "the lantern's colour" },
  { x: 378, y: 306, r: 24, label: 'the apples' },
  { x: 500, y: 384, r: 28, label: 'the black cat' },
  { x: 95, y: 398, r: 24, label: "the cart's wheel" },
];

/* ------------------------------------------------------------------ */
/* The registry: five scenes, seven differences each, in play order.   */
/* ------------------------------------------------------------------ */
export const SCENES = [
  { id: 'camp', name: 'Forest Camp at Dusk', par: 90, paint: paintCamp, diffs: CAMP_DIFFS },
  { id: 'bakery', name: 'The Cozy Bakery', par: 90, paint: paintBakery, diffs: BAKERY_DIFFS },
  { id: 'reef', name: 'Coral Reef', par: 90, paint: paintReef, diffs: REEF_DIFFS },
  { id: 'railway', name: 'Mountain Railway', par: 90, paint: paintRailway, diffs: RAILWAY_DIFFS },
  { id: 'market', name: 'Night Market', par: 90, paint: paintMarket, diffs: MARKET_DIFFS },
];

export const TOTAL_DIFFS = SCENES.reduce((sum, scene) => sum + scene.diffs.length, 0);
