class SoundManager {
  private sounds: Map<string, HTMLAudioElement>
  private enabled: boolean = true
  private currentTheme: 'light' | 'dark' = 'light'

  constructor() {
    this.sounds = new Map()
    this.initSounds()
  }

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme
    this.initSounds()
  }

  private initSounds() {
    const isLight = this.currentTheme === 'light'
    
    const soundEffects = {
      glassTap: this.createBeep(isLight ? 950 : 650, 0.12, 'sine'),
      heavyThud: this.createBeep(isLight ? 140 : 95, 0.3, 'triangle'),
      stamp: this.createBeep(isLight ? 240 : 180, 0.2, 'square'),
      unlock: this.createSequence(
        isLight 
          ? [
              { freq: 450, duration: 0.1 },
              { freq: 650, duration: 0.1 },
              { freq: 900, duration: 0.2 }
            ]
          : [
              { freq: 300, duration: 0.12 },
              { freq: 450, duration: 0.12 },
              { freq: 600, duration: 0.22 }
            ]
      ),
      cardFlip: this.createSequence(
        isLight
          ? [
              { freq: 800, duration: 0.08 },
              { freq: 600, duration: 0.08 }
            ]
          : [
              { freq: 500, duration: 0.09 },
              { freq: 400, duration: 0.09 }
            ]
      ),
      shimmer: this.createBeep(isLight ? 1200 : 800, 0.15, 'triangle'),
      softClick: this.createBeep(isLight ? 700 : 500, 0.08, 'sine'),
      success: this.createSequence(
        isLight
          ? [
              { freq: 520, duration: 0.1 },
              { freq: 660, duration: 0.1 },
              { freq: 820, duration: 0.15 }
            ]
          : [
              { freq: 350, duration: 0.1 },
              { freq: 440, duration: 0.1 },
              { freq: 550, duration: 0.15 }
            ]
      ),
    }

    Object.entries(soundEffects).forEach(([name, audio]) => {
      this.sounds.set(name, audio)
    })
  }

  private createBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): HTMLAudioElement {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

    const audioElement = new Audio()
    
    const playSound = () => {
      const newContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const newOsc = newContext.createOscillator()
      const newGain = newContext.createGain()
      
      newOsc.connect(newGain)
      newGain.connect(newContext.destination)
      
      newOsc.frequency.value = frequency
      newOsc.type = type
      
      newGain.gain.setValueAtTime(0.3, newContext.currentTime)
      newGain.gain.exponentialRampToValueAtTime(0.01, newContext.currentTime + duration)
      
      newOsc.start()
      newOsc.stop(newContext.currentTime + duration)
    }

    audioElement.addEventListener('play', playSound)
    
    return audioElement
  }

  private createSequence(notes: { freq: number; duration: number }[]): HTMLAudioElement {
    const audioElement = new Audio()
    
    const playSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      let startTime = audioContext.currentTime

      notes.forEach(note => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = note.freq
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration)

        oscillator.start(startTime)
        oscillator.stop(startTime + note.duration)

        startTime += note.duration
      })
    }

    audioElement.addEventListener('play', playSound)
    
    return audioElement
  }

  play(soundName: string) {
    if (!this.enabled) return
    
    const sound = this.sounds.get(soundName)
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(() => {})
    }
  }

  toggle() {
    this.enabled = !this.enabled
    return this.enabled
  }

  isEnabled() {
    return this.enabled
  }
}

export const soundManager = new SoundManager()
