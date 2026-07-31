let audioContext: AudioContext | null = null

function getAudioContext() {
  if (typeof window === "undefined") return null
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

/** Subtle admin notification chime via Web Audio API. */
export function playAdminNotificationSound() {
  const context = getAudioContext()
  if (!context) return

  void context.resume().then(() => {
    const now = context.currentTime
    const gain = context.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
    gain.connect(context.destination)

    const osc = context.createOscillator()
    osc.type = "sine"
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.12)
    osc.connect(gain)
    osc.start(now)
    osc.stop(now + 0.36)
  })
}
