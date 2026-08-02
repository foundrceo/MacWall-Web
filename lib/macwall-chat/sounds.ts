/** Subtle Fin-style UI sounds via Web Audio — no asset files. */

let sharedCtx: AudioContext | null = null

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!AC) return null
  if (!sharedCtx) sharedCtx = new AC()
  return sharedCtx
}

async function resume() {
  const audio = ctx()
  if (!audio) return null
  if (audio.state === "suspended") {
    try {
      await audio.resume()
    } catch {
      return null
    }
  }
  return audio
}

function tone(
  audio: AudioContext,
  {
    frequency,
    duration,
    type = "sine",
    gain = 0.04,
    delay = 0,
    slideTo,
  }: {
    frequency: number
    duration: number
    type?: OscillatorType
    gain?: number
    delay?: number
    slideTo?: number
  }
) {
  const t0 = audio.currentTime + delay
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, t0)
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration)
  }
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(audio.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export async function playChatOpenSound() {
  const audio = await resume()
  if (!audio) return
  tone(audio, { frequency: 520, duration: 0.09, gain: 0.035, type: "triangle" })
  tone(audio, {
    frequency: 780,
    duration: 0.12,
    gain: 0.03,
    delay: 0.06,
    type: "triangle",
  })
}

export async function playChatCloseSound() {
  const audio = await resume()
  if (!audio) return
  tone(audio, {
    frequency: 640,
    duration: 0.1,
    gain: 0.028,
    type: "triangle",
    slideTo: 320,
  })
}

export async function playChatSendSound() {
  const audio = await resume()
  if (!audio) return
  tone(audio, { frequency: 880, duration: 0.06, gain: 0.03, type: "sine" })
}

export async function playChatReceiveSound() {
  const audio = await resume()
  if (!audio) return
  tone(audio, { frequency: 440, duration: 0.07, gain: 0.032, type: "sine" })
  tone(audio, {
    frequency: 660,
    duration: 0.1,
    gain: 0.028,
    delay: 0.05,
    type: "sine",
  })
}

export async function playChatPopSound() {
  const audio = await resume()
  if (!audio) return
  tone(audio, {
    frequency: 360,
    duration: 0.08,
    gain: 0.025,
    type: "square",
    slideTo: 180,
  })
}
