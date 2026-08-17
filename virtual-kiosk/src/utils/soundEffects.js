/**
 * Web Audio API Sound Effects & Web Speech API Voice Narrator
 * Synthesizes spatial footsteps, UI chimes, and speaks location names aloud.
 */

class SoundController {
  constructor() {
    this.ctx = null
    this.muted = false
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  toggleMute() {
    this.muted = !this.muted
    if (this.muted && this.synth) {
      this.synth.cancel() // Stop speaking if muted
    }
    return this.muted
  }

  /**
   * Reads location name and text aloud using browser Web Speech API
   * @param {string} text - Text to speak
   */
  speakText(text) {
    if (this.muted || !this.synth) return

    try {
      this.synth.cancel() // Stop any previous speech
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95 // Natural human cadence
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // Select a clear English voice if available
      const voices = this.synth.getVoices()
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Hazel'))
      ) || voices.find((v) => v.lang.startsWith('en'))

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      this.synth.speak(utterance)
    } catch (e) {
      console.warn('Speech synthesis error:', e)
    }
  }

  playFootstep() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const bufferSize = this.ctx.sampleRate * 0.08
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(180, now)
    filter.frequency.exponentialRampToValueAtTime(40, now + 0.08)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    noise.start(now)
  }

  playUiChime(freq = 587.33) {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.12)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.25)
  }

  playWhoosh() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const bufferSize = this.ctx.sampleRate * 0.3
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1)
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(300, now)
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.15)
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.3)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.01, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    noise.start(now)
  }
}

export const soundFx = new SoundController()
