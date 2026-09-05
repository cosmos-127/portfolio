// Production Web Audio synthesizer for tactile micro-haptics
let audioCtx: AudioContext | null = null;
let soundEnabled = true; // Default ON so visitors experience tactile audio
const listeners = new Set<(enabled: boolean) => void>();

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

// Unlock audio context on the first user interaction anywhere on the page
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  };
  window.addEventListener("pointerdown", unlockAudio, { passive: true });
  window.addEventListener("keydown", unlockAudio, { passive: true });
  window.addEventListener("wheel", unlockAudio, { passive: true });
}

// Initialize sound preference from localStorage (default to enabled unless explicitly set to "0")
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("portfolio:sound");
    soundEnabled = saved !== "0";
  } catch {
    soundEnabled = true;
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("portfolio:sound", enabled ? "1" : "0");
    } catch {
      // Ignore storage errors
    }
  }
  listeners.forEach((fn) => fn(enabled));
}

export function toggleSound(): boolean {
  const next = !soundEnabled;
  setSoundEnabled(next);
  if (next) {
    playChime(true); // Force chime so user gets immediate audio confirmation
  } else {
    playTick(true); // Subtle click confirming mute
  }
  return next;
}

export function subscribeSound(callback: (enabled: boolean) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Executes a sound generator safely, handling browser suspended AudioContext state
 */
function runWithAudioContext(fn: (ctx: AudioContext) => void) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().then(() => {
      fn(ctx);
    }).catch(() => {});
  } else {
    fn(ctx);
  }
}

/**
 * High-precision, tactile mechanical ratchet click
 * Clearly audible on built-in laptop speakers, headphones and mobile
 */
export function playTick(force = false) {
  if (!soundEnabled && !force) return;

  runWithAudioContext((ctx) => {
    try {
      const now = ctx.currentTime;

      // 1. High transient snap (1400Hz down to 260Hz)
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();

      snapOsc.type = "sine";
      snapOsc.frequency.setValueAtTime(1400, now);
      snapOsc.frequency.exponentialRampToValueAtTime(260, now + 0.038);

      snapGain.gain.setValueAtTime(0.18, now);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);

      snapOsc.start(now);
      snapOsc.stop(now + 0.042);

      // 2. Tactile body thud (320Hz down to 80Hz)
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();

      thudOsc.type = "triangle";
      thudOsc.frequency.setValueAtTime(320, now);
      thudOsc.frequency.exponentialRampToValueAtTime(80, now + 0.045);

      thudGain.gain.setValueAtTime(0.14, now);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.048);

      thudOsc.connect(thudGain);
      thudGain.connect(ctx.destination);

      thudOsc.start(now);
      thudOsc.stop(now + 0.05);
    } catch {
      // Graceful silent fallback
    }
  });
}

/**
 * Radiant, crystalline dual-tone confirmation chime
 */
export function playChime(force = false) {
  if (!soundEnabled && !force) return;

  runWithAudioContext((ctx) => {
    try {
      const now = ctx.currentTime;
      // Beautiful harmonic interval: C6 (1046.5Hz) & G6 (1568Hz)
      const frequencies = [1046.5, 1568.0];

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const startTime = now + i * 0.045;
        const duration = 0.28;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.02);
      });
    } catch {
      // Graceful silent fallback
    }
  });
}

/**
 * Bright, tactile UI pop for buttons and menu toggles
 */
export function playPop(force = false) {
  if (!soundEnabled && !force) return;

  runWithAudioContext((ctx) => {
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.05);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Graceful silent fallback
    }
  });
}

// ============================================================================
// CONTINUOUS 3-STAGE GYRO DYNAMO SYNTHESIZER
// Stage 1 (0-2s): "ki kit kit" mechanical ratchet clicks accelerating
// Stage 2 (2-4s): "bhum bhum bhum" resonant sub-bass heartbeat thumps
// Stage 3 (4s+):  "turbine" screaming supersonic jet turbine overdrive
// ============================================================================

function createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2; // 2-second seamless loop
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.12;
    b6 = white * 0.115926;
  }
  return buffer;
}

/**
 * Stage 1: Crisp mechanical ratchet click ("kit!")
 */
function playKitClick(ctx: AudioContext, destination: AudioNode, pitchMult = 1.0) {
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1450 * pitchMult, now);
    osc.frequency.exponentialRampToValueAtTime(340 * pitchMult, now + 0.024);

    gain.gain.setValueAtTime(0.19, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = "sine";
    click.frequency.setValueAtTime(2500 * pitchMult, now);
    click.frequency.exponentialRampToValueAtTime(950 * pitchMult, now + 0.015);

    clickGain.gain.setValueAtTime(0.13, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    osc.connect(gain);
    gain.connect(destination);
    click.connect(clickGain);
    clickGain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.032);
    click.start(now);
    click.stop(now + 0.022);
  } catch {
    // Safe fallback
  }
}

/**
 * Stage 2: Heavy resonant sub-bass impact ("BHUM!")
 */
function playBhumThump(ctx: AudioContext, destination: AudioNode, intensity = 1.0) {
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.24);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(160, now);
    filter.Q.setValueAtTime(4.2, now);

    oscGain.gain.setValueAtTime(0.32 * intensity, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    const punch = ctx.createOscillator();
    const punchGain = ctx.createGain();
    punch.type = "triangle";
    punch.frequency.setValueAtTime(115, now);
    punch.frequency.exponentialRampToValueAtTime(48, now + 0.12);

    punchGain.gain.setValueAtTime(0.18 * intensity, now);
    punchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(destination);

    punch.connect(filter);
    punchGain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.3);
    punch.start(now);
    punch.stop(now + 0.16);
  } catch {
    // Safe fallback
  }
}

interface GyroSession {
  ctx: AudioContext;
  masterGain: GainNode;

  // Background baseline hum
  droneOsc: OscillatorNode;
  droneGain: GainNode;

  // Stage 3 Jet Turbine components
  noiseSource: AudioBufferSourceNode;
  noiseFilter: BiquadFilterNode;
  noiseGain: GainNode;

  spoolOsc1: OscillatorNode;
  spoolOsc2: OscillatorNode;
  spoolGain: GainNode;
  spoolMod: OscillatorNode;
  spoolModGain: GainNode;

  rumbleOsc: OscillatorNode;
  rumbleGain: GainNode;

  // Rhythmic timing trackers
  nextTickTime: number;
  nextBhumTime: number;
}

let activeGyro: GyroSession | null = null;

export function startGyroDynamo() {
  if (!soundEnabled) return;
  if (activeGyro) return;

  runWithAudioContext((ctx) => {
    try {
      const now = ctx.currentTime;

      // Master gain for the whole gyro dynamo
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.24, now + 0.1);
      masterGain.connect(ctx.destination);

      // Baseline carrier hum
      const droneOsc = ctx.createOscillator();
      const droneGain = ctx.createGain();
      droneOsc.type = "triangle";
      droneOsc.frequency.setValueAtTime(95, now);
      droneGain.gain.setValueAtTime(0.05, now);
      droneOsc.connect(droneGain);
      droneGain.connect(masterGain);
      droneOsc.start(now);

      // Stage 3 Turbine: Airflow noise buffer
      const noiseBuffer = createPinkNoiseBuffer(ctx);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(950, now);
      noiseFilter.Q.setValueAtTime(3.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start(now);

      // Stage 3 Turbine: Whining compressor spools
      const spoolOsc1 = ctx.createOscillator();
      const spoolOsc2 = ctx.createOscillator();
      const spoolGain = ctx.createGain();

      spoolOsc1.type = "sine";
      spoolOsc1.frequency.setValueAtTime(720, now);

      spoolOsc2.type = "sine";
      spoolOsc2.frequency.setValueAtTime(1440, now);

      spoolGain.gain.setValueAtTime(0.0001, now);

      // Blade flutter LFO on turbine whine
      const spoolMod = ctx.createOscillator();
      const spoolModGain = ctx.createGain();
      spoolMod.type = "sine";
      spoolMod.frequency.setValueAtTime(18.0, now);
      spoolModGain.gain.setValueAtTime(0.035, now);
      spoolMod.connect(spoolModGain);
      spoolModGain.connect(spoolGain.gain);

      spoolOsc1.connect(spoolGain);
      spoolOsc2.connect(spoolGain);
      spoolGain.connect(masterGain);

      spoolOsc1.start(now);
      spoolOsc2.start(now);
      spoolMod.start(now);

      // Stage 3 Turbine: Low-frequency afterburner roar
      const rumbleOsc = ctx.createOscillator();
      const rumbleFilter = ctx.createBiquadFilter();
      const rumbleGain = ctx.createGain();

      rumbleOsc.type = "sawtooth";
      rumbleOsc.frequency.setValueAtTime(54, now);

      rumbleFilter.type = "lowpass";
      rumbleFilter.frequency.setValueAtTime(95, now);

      rumbleGain.gain.setValueAtTime(0.0001, now);

      rumbleOsc.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(masterGain);
      rumbleOsc.start(now);

      activeGyro = {
        ctx,
        masterGain,
        droneOsc,
        droneGain,
        noiseSource,
        noiseFilter,
        noiseGain,
        spoolOsc1,
        spoolOsc2,
        spoolGain,
        spoolMod,
        spoolModGain,
        rumbleOsc,
        rumbleGain,
        nextTickTime: now + 0.05,
        nextBhumTime: now + 3.05,
      };
    } catch {
      // Safe fallback
    }
  });
}

export function updateGyroDynamo(
  stage1Intensity: number,
  stage2Intensity = 0,
  stage3Intensity = 0,
  holdDuration = 0
) {
  if (!activeGyro) return;
  try {
    const session = activeGyro;
    const { ctx } = session;
    const now = ctx.currentTime;

    // -----------------------------------------------------------------
    // 1. STAGE 1 SOUND: "ki kit kit" accelerating ratchet clatter (0s - 3.0s)
    // -----------------------------------------------------------------
    if (holdDuration > 0.04 && holdDuration < 3.0) {
      if (now >= session.nextTickTime) {
        const progress = Math.min(1, holdDuration / 3.0);
        // Accelerates from 150ms down to 48ms interval as Stage 1 ramps up over 3 seconds
        const interval = 0.15 - progress * 0.102;
        session.nextTickTime = now + Math.max(0.046, interval);

        // Tactile mechanical ratchet click
        playKitClick(ctx, session.masterGain, 1.0 + progress * 0.35);
      }

      // Drone subtly spools up
      session.droneOsc.frequency.setTargetAtTime(95 + stage1Intensity * 60, now, 0.08);
      session.droneGain.gain.setTargetAtTime(0.06 + stage1Intensity * 0.04, now, 0.08);
    }

    // -----------------------------------------------------------------
    // 2. STAGE 2 SOUND: "bhum bhum bhum" resonant sub-bass heartbeats (3.0s - 6.0s)
    // -----------------------------------------------------------------
    if (holdDuration >= 3.0 && holdDuration < 6.0) {
      if (now >= session.nextBhumTime) {
        const progress = Math.min(1, (holdDuration - 3.0) / 3.0);
        // Resonant heartbeat thumps spaced ~360ms to ~280ms
        const interval = 0.36 - progress * 0.08;
        session.nextBhumTime = now + Math.max(0.26, interval);

        // Heavy sub-bass reactor impact
        playBhumThump(ctx, session.masterGain, 1.0 + progress * 0.25);
      }

      // Drone deepens into heavy resonant tone
      session.droneOsc.frequency.setTargetAtTime(140 + stage2Intensity * 70, now, 0.06);
      session.droneGain.gain.setTargetAtTime(0.1 + stage2Intensity * 0.06, now, 0.06);
    }

    // -----------------------------------------------------------------
    // 3. STAGE 3 SOUND: "turbine" supersonic jet roaring overdrive (6.0s+)
    // -----------------------------------------------------------------
    const clampedS3 = Math.max(0, Math.min(1, stage3Intensity));
    if (clampedS3 > 0.02) {
      // Noise filter sweeps up into rushing jet air whoosh
      const noiseFreq = 950 + clampedS3 * 2300; // 950Hz -> 3250Hz
      session.noiseFilter.frequency.setTargetAtTime(noiseFreq, now, 0.05);
      session.noiseGain.gain.setTargetAtTime(clampedS3 * 0.16, now, 0.05);

      // Turbine compressor spools scream at high supersonic RPM
      const spool1Freq = 720 + clampedS3 * 1180; // 720Hz -> 1900Hz
      const spool2Freq = 1440 + clampedS3 * 2360; // 1440Hz -> 3800Hz
      session.spoolOsc1.frequency.setTargetAtTime(spool1Freq, now, 0.05);
      session.spoolOsc2.frequency.setTargetAtTime(spool2Freq, now, 0.05);
      session.spoolGain.gain.setTargetAtTime(clampedS3 * 0.14, now, 0.05);

      // Jet afterburner low roar
      session.rumbleGain.gain.setTargetAtTime(clampedS3 * 0.18, now, 0.05);

      // Carrier drone harmonizes with turbine
      session.droneOsc.frequency.setTargetAtTime(220 + clampedS3 * 180, now, 0.05);
    } else {
      session.noiseGain.gain.setTargetAtTime(0.0001, now, 0.08);
      session.spoolGain.gain.setTargetAtTime(0.0001, now, 0.08);
      session.rumbleGain.gain.setTargetAtTime(0.0001, now, 0.08);
    }
  } catch {
    // Ignore transient context updates
  }
}

export function stopGyroDynamo() {
  if (!activeGyro) return;
  const session = activeGyro;
  activeGyro = null;

  try {
    const { ctx, masterGain, spoolOsc1, spoolOsc2, noiseFilter } = session;
    const now = ctx.currentTime;

    // Supersonic spool down like a jet engine powering down
    spoolOsc1.frequency.cancelScheduledValues(now);
    spoolOsc1.frequency.setValueAtTime(spoolOsc1.frequency.value, now);
    spoolOsc1.frequency.exponentialRampToValueAtTime(70, now + 0.48);

    spoolOsc2.frequency.cancelScheduledValues(now);
    spoolOsc2.frequency.setValueAtTime(spoolOsc2.frequency.value, now);
    spoolOsc2.frequency.exponentialRampToValueAtTime(140, now + 0.48);

    noiseFilter.frequency.cancelScheduledValues(now);
    noiseFilter.frequency.setValueAtTime(noiseFilter.frequency.value, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(180, now + 0.48);

    // Smooth power-down fade
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(Math.max(0.001, masterGain.gain.value), now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);

    setTimeout(() => {
      try {
        session.droneOsc.stop();
        session.droneOsc.disconnect();
        session.noiseSource.stop();
        session.noiseSource.disconnect();
        session.spoolOsc1.stop();
        session.spoolOsc1.disconnect();
        session.spoolOsc2.stop();
        session.spoolOsc2.disconnect();
        session.spoolMod.stop();
        session.spoolMod.disconnect();
        session.rumbleOsc.stop();
        session.rumbleOsc.disconnect();
        session.masterGain.disconnect();
      } catch {
        // Safe disposal
      }
    }, 560);
  } catch {
    // Safe disposal
  }
}
