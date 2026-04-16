import { useRef, useCallback } from 'react';

// All sounds are synthesised via Web Audio API — no external files required.
export function useWheelSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const tickTimerRef = useRef<number | null>(null);

  const getCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    // Resume if browser suspended it (autoplay policy)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Short mechanical "tick" like a wheel spoke hitting a card
  const playTick = useCallback((volume = 0.35) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.07);
    } catch { /* ignore */ }
  }, []);

  // HYPE win sound — airhorn + bass drop + crowd energy + sparkles
  const playWin = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;

      // Helper to play one note
      const note = (
        freq: number,
        startT: number,
        duration: number,
        type: OscillatorType,
        vol: number
      ) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startT);
        gain.gain.setValueAtTime(0, startT);
        gain.gain.linearRampToValueAtTime(vol, startT + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + duration);
        osc.start(startT);
        osc.stop(startT + duration + 0.05);
      };

      // === 1. AIRHORN (the meme classic) ===
      // Two detuned saw waves sliding up = instant hype
      for (let burst = 0; burst < 3; burst++) {
        const t = now + burst * 0.18;
        const dur = burst === 2 ? 0.6 : 0.14;
        [0, 3, 7].forEach((detune) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(480 + detune, t);
          osc.frequency.linearRampToValueAtTime(520 + detune, t + dur);
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.12, t + 0.01);
          gain.gain.setValueAtTime(0.12, t + dur * 0.7);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.start(t);
          osc.stop(t + dur + 0.05);
        });
      }

      // === 2. MASSIVE BASS DROP right after the horns ===
      const dropT = now + 0.55;
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(200, dropT);
      bassOsc.frequency.exponentialRampToValueAtTime(40, dropT + 0.3);
      bassGain.gain.setValueAtTime(0.6, dropT);
      bassGain.gain.exponentialRampToValueAtTime(0.001, dropT + 0.5);
      bassOsc.start(dropT);
      bassOsc.stop(dropT + 0.55);

      // Sub-bass wobble for extra punch
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(55, dropT);
      subGain.gain.setValueAtTime(0.4, dropT);
      subGain.gain.exponentialRampToValueAtTime(0.001, dropT + 0.6);
      subOsc.start(dropT);
      subOsc.stop(dropT + 0.65);

      // === 3. CROWD ROAR (filtered noise burst) ===
      const roarT = dropT;
      const roarLen = ctx.sampleRate * 1.2;
      const roarBuf = ctx.createBuffer(1, roarLen, ctx.sampleRate);
      const roarData = roarBuf.getChannelData(0);
      for (let j = 0; j < roarLen; j++) roarData[j] = Math.random() * 2 - 1;
      const roarSrc = ctx.createBufferSource();
      roarSrc.buffer = roarBuf;
      // Bandpass filter to sound like a muffled crowd
      const roarBP = ctx.createBiquadFilter();
      roarBP.type = 'bandpass';
      roarBP.frequency.value = 1200;
      roarBP.Q.value = 0.8;
      const roarGain = ctx.createGain();
      roarSrc.connect(roarBP);
      roarBP.connect(roarGain);
      roarGain.connect(ctx.destination);
      roarGain.gain.setValueAtTime(0, roarT);
      roarGain.gain.linearRampToValueAtTime(0.25, roarT + 0.05);
      roarGain.gain.setValueAtTime(0.25, roarT + 0.3);
      roarGain.gain.exponentialRampToValueAtTime(0.001, roarT + 1.2);
      roarSrc.start(roarT);
      roarSrc.stop(roarT + 1.25);

      // === 4. VICTORY JINGLE — bouncy "da-da-da-DAAAA!" ===
      const jingleT = now + 0.9;
      const jingleNotes = [
        { f: 523, d: 0.1, t: 0 },       // C5
        { f: 659, d: 0.1, t: 0.12 },     // E5
        { f: 784, d: 0.1, t: 0.24 },     // G5
        { f: 1047, d: 0.8, t: 0.36 },    // C6 — hold!
      ];
      jingleNotes.forEach(({ f, d, t: offset }) => {
        note(f, jingleT + offset, d + 0.1, 'square', 0.13);
        note(f * 1.005, jingleT + offset, d + 0.15, 'triangle', 0.18);
      });

      // Shimmering chord behind the final jingle note
      const shimmerT = jingleT + 0.36;
      [1047, 1319, 1568].forEach((f) => {
        note(f, shimmerT, 1.2, 'sine', 0.12);
        note(f * 2, shimmerT, 0.8, 'sine', 0.06);
      });

      // === 5. SPARKLE RAIN — rapid high-pitched pings ===
      for (let i = 0; i < 15; i++) {
        const sparkleT = shimmerT + 0.1 + i * 0.06;
        const sparkleF = 2500 + Math.random() * 2000;
        note(sparkleF, sparkleT, 0.08, 'sine', 0.06 + Math.random() * 0.04);
      }

      // === 6. CYMBAL CRASH on the drop ===
      const crashLen = ctx.sampleRate * 0.5;
      const crashBuf = ctx.createBuffer(1, crashLen, ctx.sampleRate);
      const crashData = crashBuf.getChannelData(0);
      for (let j = 0; j < crashLen; j++) crashData[j] = Math.random() * 2 - 1;
      const crashSrc = ctx.createBufferSource();
      crashSrc.buffer = crashBuf;
      const crashHP = ctx.createBiquadFilter();
      crashHP.type = 'highpass';
      crashHP.frequency.value = 6000;
      const crashGain = ctx.createGain();
      crashSrc.connect(crashHP);
      crashHP.connect(crashGain);
      crashGain.connect(ctx.destination);
      crashGain.gain.setValueAtTime(0.25, dropT);
      crashGain.gain.exponentialRampToValueAtTime(0.001, dropT + 0.5);
      crashSrc.start(dropT);
      crashSrc.stop(dropT + 0.55);
    } catch { /* ignore */ }
  }, []);

  // Schedule ticks that slow down naturally over `duration` ms
  const startTicking = useCallback((duration: number) => {
    const startTime = Date.now();

    const scheduleTick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration - 50) return; // stop near the end

      const progress = elapsed / duration; // 0 → 1
      // Interval: 25 ms when fast (start) → 380 ms when nearly stopped (end)
      const interval = 25 + Math.pow(progress, 1.8) * 355;
      // Volume fades subtly over time
      const volume = 0.35 - progress * 0.15;
      playTick(volume);

      tickTimerRef.current = window.setTimeout(scheduleTick, interval);
    };

    if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
    scheduleTick();
  }, [playTick]);

  const stopTicking = useCallback(() => {
    if (tickTimerRef.current) {
      clearTimeout(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  }, []);

  return { startTicking, stopTicking, playWin, playTick };
}
