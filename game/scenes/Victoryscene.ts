import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config'
import { ScoreManager } from '../Scoremanager'

export class VictoryScene extends Phaser.Scene {
  private score:    number = 0
  private position: number | null = null

  constructor() {
    super({ key: 'VictoryScene' })
  }

  init(data: { score?: number }) {
    this.score    = data.score ?? 0
    this.position = ScoreManager.save(this.score, 'victory')
  }

  create() {
    // ── Fondo ────────────────────────────────────────────────────
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x07090f)

    const grid = this.add.graphics()
    grid.lineStyle(1, 0x00ff88, 0.04)
    for (let x = 0; x <= GAME_WIDTH;  x += 40) grid.lineBetween(x, 0, x, GAME_HEIGHT)
    for (let y = 0; y <= GAME_HEIGHT; y += 40) grid.lineBetween(0, y, GAME_WIDTH, y)

    const lines = this.add.graphics()
    lines.lineStyle(1, 0x00ff88, 0.4)
    lines.lineBetween(60, 60, GAME_WIDTH - 60, 60)
    lines.lineBetween(60, GAME_HEIGHT - 60, GAME_WIDTH - 60, GAME_HEIGHT - 60)

    // ── Estrellas decorativas ─────────────────────────────────────
    for (let i = 0; i < 20; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        2, 2, 0x00ff88,
        Phaser.Math.FloatBetween(0.1, 0.5)
      )
      this.tweens.add({
        targets: star, alpha: 0,
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 1500),
      })
    }

    // ── Título ────────────────────────────────────────────────────
    const title = this.add
      .text(GAME_WIDTH / 2, 110, 'HAS GANADO!', {
        fontFamily: 'monospace',
        fontSize:   '72px',
        fontStyle:  'bold',
        color:      '#00ff88',
        stroke:     '#003322',
        strokeThickness: 8,
      })
      .setOrigin(0.5).setAlpha(0)

    // ── Score y rating ────────────────────────────────────────────
    const scoreLine = this.add
      .text(GAME_WIDTH / 2, 210, 'PUNTUACIÓN FINAL: ' + this.score, {
        fontFamily: 'monospace', fontSize: '26px', color: '#c8ffd4',
      })
      .setOrigin(0.5).setAlpha(0)

    const rating     = this.getRating(this.score)
    const ratingLine = this.add
      .text(GAME_WIDTH / 2, 248, rating.label, {
        fontFamily: 'monospace', fontSize: '18px', color: rating.color,
      })
      .setOrigin(0.5).setAlpha(0)

    // ── Posición en ranking ───────────────────────────────────────
    const rankLabel = this.position !== null ? this.getRankLabel(this.position) : null
    const rankLine  = rankLabel
      ? this.add
          .text(GAME_WIDTH / 2, 284, rankLabel.text, {
            fontFamily: 'monospace', fontSize: '18px', color: rankLabel.color,
          })
          .setOrigin(0.5).setAlpha(0)
      : null

    // ── Animaciones de entrada ────────────────────────────────────
    this.tweens.add({ targets: title,      alpha: 1, y: 100, duration: 500, ease: 'Back.Out', delay: 100 })
    this.tweens.add({ targets: scoreLine,  alpha: 1,         duration: 400,                   delay: 450 })
    this.tweens.add({ targets: ratingLine, alpha: 1,         duration: 400,                   delay: 600 })
    if (rankLine) {
      this.tweens.add({ targets: rankLine, alpha: 1, duration: 400, delay: 750 })
    }

    // Pulso en el título
    this.tweens.add({
      targets: title, scaleX: 1.03, scaleY: 1.03,
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay: 900,
    })

    // ── Botones — espaciados dentro del canvas ────────────────────
    this.time.delayedCall(900, () => {
      this.createButton(GAME_WIDTH / 2, 360, '↺  JUGAR DE NUEVO',   0x00ff88, () => this.navigateTo('MainScene', { level: 1, score: 0, lives: 3 }))
      this.createButton(GAME_WIDTH / 2, 420, '★  CLASIFICACIONES',   0xffdd00, () => this.navigateTo('HighscoresScene'))
      this.createButton(GAME_WIDTH / 2, 480, '◂  VOLVER AL MENU', 0x4a7a55, () => this.navigateTo('MenuScene'))
    })

    this.cameras.main.fadeIn(400, 7, 9, 15)
  }

  private getRating(score: number): { label: string; color: string } {
    if (score >= 300) return { label: '★★★  PERFECTO  ★★★', color: '#ffdd00' }
    if (score >= 200) return { label: '★★☆  MUY BUENO',        color: '#00ccff' }
    if (score >= 100) return { label: '★☆☆  BUENO',         color: '#00ff88' }
    return               { label: '☆☆☆  SIGUE INTENTANDO',     color: '#4a7a55' }
  }

  private getRankLabel(pos: number): { text: string; color: string } {
    if (pos === 1) return { text: '🏆  TOP #1 !',  color: '#ffdd00' }
    if (pos === 2) return { text: `🥈  #${pos} EN RANKING`, color: '#aaaaaa' }
    if (pos === 3) return { text: `🥉  #${pos} EN RANKING`, color: '#cd7f32' }
    return              { text: `#${pos} EN RANKING`,       color: '#4a7a55' }
  }

  private navigateTo(key: string, data?: object) {
    this.cameras.main.fadeOut(300, 7, 9, 15)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(key, data))
  }

  private createButton(x: number, y: number, label: string, color: number, onClick: () => void) {
    const colorHex = '#' + color.toString(16).padStart(6, '0')

    const bg = this.add
      .rectangle(x, y, 260, 42, color, 0.08)
      .setInteractive({ useHandCursor: true })

    const border = this.add.graphics()
    border.lineStyle(1, color, 0.4)
    border.strokeRect(x - 130, y - 21, 260, 42)

    const text = this.add
      .text(x, y, label, {
        fontFamily: 'monospace', fontSize: '15px',
        color: colorHex, letterSpacing: 2,
      })
      .setOrigin(0.5)

    bg.on('pointerover', () => {
      bg.setFillStyle(color, 0.2)
      border.clear(); border.lineStyle(1, color, 0.9)
      border.strokeRect(x - 130, y - 21, 260, 42)
      text.setColor('#ffffff')
    })
    bg.on('pointerout', () => {
      bg.setFillStyle(color, 0.08)
      border.clear(); border.lineStyle(1, color, 0.4)
      border.strokeRect(x - 130, y - 21, 260, 42)
      text.setColor(colorHex)
    })
    bg.on('pointerdown', () => {
      this.cameras.main.flash(200, 0, 255, 136, false)
      this.time.delayedCall(150, onClick)
    })
  }
}