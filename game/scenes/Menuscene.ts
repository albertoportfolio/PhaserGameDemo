import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config'
import { loadOptions } from './Optionsscene'
import { MusicManager } from '../MusicManager'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

   preload() {
    // Solo carga si no está ya cargado
  if (!this.cache.audio.exists('bgm')) {
    this.load.audio('bgm', 'assets/brassy_bubbles.mp3') }
  }

  create() {
    //reinicia la camara
     this.cameras.main.resetFX()
    // ── Fondo oscuro ──────────────────────────────────────────────
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x07090f)
    const opts = loadOptions()
    MusicManager.play(this, 'bgm', opts.musicVolume / 100)
    // ── Grid animado de fondo ─────────────────────────────────────
    this.createGrid()

    // ── Título ────────────────────────────────────────────────────
    this.add
      .text(GAME_WIDTH / 2, 120, 'RECOLECTA', {
        fontFamily: 'monospace',
        fontSize: '80px',
        fontStyle: 'bold',
        color: '#00ff88',
        stroke: '#003322',
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 200, 'ESTRELLAS', {
        fontFamily: 'monospace',
        fontSize: '80px',
        fontStyle: 'bold',
        color: '#c8ffd4',
        stroke: '#003322',
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    // Badge de versión
    this.add
      .text(GAME_WIDTH / 2, 265, 'PROTOTIPO v0.1', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#4a7a55',
      })
      .setOrigin(0.5)

    // ── Línea decorativa ──────────────────────────────────────────
    const line = this.add.graphics()
    line.lineStyle(1, 0x00ff88, 0.3)
    line.lineBetween(200, 290, 600, 290)

    // ── Botones del menú ──────────────────────────────────────────
    this.createButton(GAME_WIDTH / 2, 340, '▸  JUGAR',        0x00ff88, () => this.navigateTo('MainScene'))
    this.createButton(GAME_WIDTH / 2, 400, '⚙  OPCIONES',     0x4a7a55, () => this.navigateTo('OptionsScene'))
    this.createButton(GAME_WIDTH / 2, 455, '★  CLASIFICACION',  0x4a7a55, () => this.navigateTo('HighscoresScene'))
    

    // ── Footer ────────────────────────────────────────────────────
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 24, 'HECHO CON PHASER 3 · REACT · VITE', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#1a3a22',
      })
      .setOrigin(0.5)

    // ── Animación de entrada ──────────────────────────────────────
    this.cameras.main.fadeIn(400, 7, 9, 15)
  }

     // ── Navegar a otra escena con fadeOut ─────────────────────────────
  private navigateTo(sceneKey: string) {
    this.cameras.main.fadeOut(300, 7, 9, 15)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(sceneKey)
    })
  }
  // ── Crear un botón interactivo ────────────────────────────────────
  private createButton(
    x: number,
    y: number,
    label: string,
    color: number,
    onClick: () => void
  ) {
    const colorHex = '#' + color.toString(16).padStart(6, '0')

    // Fondo del botón (invisible por defecto)
    const bg = this.add.rectangle(x, y, 280, 38, color, 0)

    // Borde
    const border = this.add.graphics()
    border.lineStyle(1, color, 0.3)
    border.strokeRect(x - 140, y - 19, 280, 38)

    // Texto
    const text = this.add
      .text(x - 120, y, label, {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: colorHex,
        letterSpacing: 3,
      })
      .setOrigin(0, 0.5)

    // Área interactiva
    bg.setInteractive({ useHandCursor: true })

    bg.on('pointerover', () => {
      bg.setFillStyle(color, 0.08)
      border.clear()
      border.lineStyle(1, color, 0.8)
      border.strokeRect(x - 140, y - 19, 280, 38)
      text.setColor('#00ff88')
      text.setX(x - 108)  // pequeño desplazamiento a la derecha al hover
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(color, 0)
      border.clear()
      border.lineStyle(1, color, 0.3)
      border.strokeRect(x - 140, y - 19, 280, 38)
      text.setColor(colorHex)
      text.setX(x - 120)
    })

    bg.on('pointerdown', () => {
      this.cameras.main.flash(200, 0, 255, 136, false)
      this.time.delayedCall(150, onClick)
    })
  }

  // ── Grid de fondo con líneas tenues ──────────────────────────────
  private createGrid() {
    const grid = this.add.graphics()
    grid.lineStyle(1, 0x1a2a1a, 1)
    for (let x = 0; x <= GAME_WIDTH; x += 40)  grid.lineBetween(x, 0, x, GAME_HEIGHT)
    for (let y = 0; y <= GAME_HEIGHT; y += 40) grid.lineBetween(0, y, GAME_WIDTH, y)

    // Anima el grid moviéndose hacia abajo suavemente
    this.tweens.add({
      targets: grid,
      y: 40,
      duration: 2000,
      repeat: -1,
      ease: 'Linear',
    })
  }

  // ── Texto temporal "próximamente" ─────────────────────────────────
  private showComingSoon(section: string) {
    const msg = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `[ ${section} — PRÓXIMAMENTE ]`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#00ff88',
        backgroundColor: '#07090f',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(10)

    this.tweens.add({
      targets: msg,
      alpha: 0,
      delay: 1500,
      duration: 500,
      onComplete: () => msg.destroy(),
    })
  }

  // ── Iniciar el juego ──────────────────────────────────────────────
  private startGame() {
    this.cameras.main.fadeOut(300, 7, 9, 15)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainScene')
    })
  }
}