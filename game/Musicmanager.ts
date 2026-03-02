/**
 * MusicManager — gestiona la música de fondo globalmente.
 * La música persiste entre escenas porque usa el SoundManager del juego,
 * que es compartido por todas las escenas.
 */

let currentMusic: Phaser.Sound.BaseSound | null = null
let currentKey: string | null = null

export const MusicManager = {

  play(scene: Phaser.Scene, key: string, volume: number = 0.5) {
    // Si ya está sonando la misma pista, no la reinicia
    if (currentMusic && currentKey === key && currentMusic.isPlaying) return

    // Para la música anterior si hay
    this.stop()

    currentMusic = scene.sound.add(key, { loop: true, volume })
    currentMusic.play()
    currentKey = key
  },

  stop() {
    if (currentMusic) {
      currentMusic.stop()
      currentMusic.destroy()
      currentMusic = null
      currentKey   = null
    }
  },

  setVolume(volume: number) {
    if (currentMusic && 'setVolume' in currentMusic) {
      ;(currentMusic as Phaser.Sound.WebAudioSound).setVolume(volume)
    }
  },

  isPlaying(): boolean {
    return currentMusic?.isPlaying ?? false
  },

}