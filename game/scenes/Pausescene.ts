import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config'

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' })
  }

  create() {
    // ── Overlay semitransparente ──────────────────────────────────
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setDepth(0)

    // ── Borde del panel ───────────────────────────────────────────
    const panel = this.add.graphics().setDepth(1)
    panel.lineStyle(1, 0x00ff88, 0.4)
    panel.strokeRect(GAME_WIDTH / 2 - 160, GAME_HEIGHT / 2 - 160, 320, 320)

    // ── Título ────────────────────────────────────────────────────
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 110, 'PAUSADO', {
        fontFamily: 'monospace',
        fontSize:   '40px',
        fontStyle:  'bold',
        color:      '#00ff88',
        letterSpacing: 6,
      })
      .setOrigin(0.5)
      .setDepth(2)

    const line = this.add.graphics().setDepth(2)
    line.lineStyle(1, 0x00ff88, 0.2)
    line.lineBetween(GAME_WIDTH / 2 - 120, GAME_HEIGHT / 2 - 70, GAME_WIDTH / 2 + 120, GAME_HEIGHT / 2 - 70)

    // ── Botones ───────────────────────────────────────────────────
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20,  '▸  JUGAR',        0x00ff88, () => this.resume())
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50,  '↺  REINICIAR',       0x00ccff, () => this.restart())
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120, '◂  VOLVER AL MENU',  0xff3c5f, () => this.goToMenu())

    // ── Hint de teclado ───────────────────────────────────────────
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 170, 'ESC / P  to resume', {
        fontFamily: 'monospace', fontSize: '11px', color: '#2a4a33',
      })
      .setOrigin(0.5)
      .setDepth(2)

    // ── Teclas para reanudar ──────────────────────────────────────
    this.input.keyboard!.once('keydown-ESC', () => this.resume())
    this.input.keyboard!.once('keydown-P',   () => this.resume())

    this.cameras.main.fadeIn(150, 0, 0, 0)
  }

  private resume() {
    this.scene.resume('MainScene')
    this.scene.stop()
  }

  private restart() {
    this.scene.stop('MainScene')
    this.scene.stop()
    this.scene.start('MainScene', { level: 1, score: 0, lives: 3 })
  }

  private goToMenu() {
      this.scene.stop('PauseScene')
  this.scene.stop('MainScene')
  this.scene.start('MenuScene')
  }

  private createButton(x: number, y: number, label: string, color: number, onClick: () => void) {
    const colorHex = '#' + color.toString(16).padStart(6, '0')

    const bg = this.add
      .rectangle(x, y, 260, 42, color, 0.08)
      .setDepth(2)
      .setInteractive({ useHandCursor: true })

    const border = this.add.graphics().setDepth(2)
    border.lineStyle(1, color, 0.4)
    border.strokeRect(x - 130, y - 21, 260, 42)

    const text = this.add
      .text(x, y, label, {
        fontFamily: 'monospace', fontSize: '15px',
        color: colorHex, letterSpacing: 3,
      })
      .setOrigin(0.5).setDepth(2)

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
    bg.on('pointerdown', onClick)
  }
}