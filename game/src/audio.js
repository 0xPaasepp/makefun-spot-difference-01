// Tiny synthesized sounds: no audio files, no network, just the Web Audio oscillator.
// A find chimes, a miss buzzes low, a cleared scene plays a short arpeggio.

export function createAudio() {
  let ctx = null;
  let muted = false;
  try {
    muted = window.localStorage.getItem('twin-worlds.muted') === '1';
  } catch {
    muted = false;
  }

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, at, dur, type, gain) {
    const ac = ensure();
    if (!ac || muted) return;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0, ac.currentTime + at);
    amp.gain.linearRampToValueAtTime(gain, ac.currentTime + at + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + at + dur);
    osc.connect(amp);
    amp.connect(ac.destination);
    osc.start(ac.currentTime + at);
    osc.stop(ac.currentTime + at + dur + 0.05);
  }

  return {
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      try {
        window.localStorage.setItem('twin-worlds.muted', muted ? '1' : '0');
      } catch {
        // Storage can be off: the mute then lasts this visit only.
      }
      return muted;
    },
    click() {
      tone(660, 0, 0.06, 'sine', 0.08);
    },
    find() {
      tone(659, 0, 0.12, 'sine', 0.16);
      tone(880, 0.09, 0.18, 'sine', 0.16);
    },
    miss() {
      tone(160, 0, 0.18, 'square', 0.08);
    },
    hint() {
      tone(520, 0, 0.1, 'sine', 0.1);
      tone(780, 0.08, 0.12, 'sine', 0.1);
    },
    sceneDone() {
      tone(523, 0, 0.14, 'sine', 0.16);
      tone(659, 0.12, 0.14, 'sine', 0.16);
      tone(784, 0.24, 0.2, 'sine', 0.16);
      tone(1047, 0.36, 0.3, 'sine', 0.16);
    },
    fail() {
      tone(330, 0, 0.2, 'sawtooth', 0.06);
      tone(220, 0.18, 0.3, 'sawtooth', 0.06);
    },
  };
}
