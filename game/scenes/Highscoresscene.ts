import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config'
import { ScoreManager, ScoreEntry } from '../Scoremanager'

export class HighscoresScene extends Phaser.Scene {
  private scores: ScoreEntry[] = []

  constructor() {
    super({ key: 'HighscoresScene' })
  }

  init() {
    this.scores = ScoreManager.load()
  }

  create() {
    // ── Fondo ────────────────────────────────────────────────────
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x07090f)

    const grid = this.add.graphics()
    grid.lineStyle(1, 0xffdd00, 0.04)
    for (let x = 0; x <= GAME_WIDTH;  x += 40) grid.lineBetween(x, 0, x, GAME_HEIGHT)
    for (let y = 0; y <= GAME_HEIGHT; y += 40) grid.lineBetween(0, y, GAME_WIDTH, y)

    const lines = this.add.graphics()
    lines.lineStyle(1, 0xffdd00, 0.3)
    lines.lineBetween(60, 80, GAME_WIDTH - 60, 80)
    lines.lineBetween(60, GAME_HEIGHT - 80, GAME_WIDTH - 60, GAME_HEIGHT - 80)

    // ── Título ────────────────────────────────────────────────────
    this.add
      .text(GAME_WIDTH / 2, 44, 'CLASIFICACIONES', {
        fontFamily: 'monospace', fontSize: '32px', fontStyle: 'bold',
        color: '#ffdd00', letterSpacing: 6,
      })
      .setOrigin(0.5)

    // ── Cabecera ──────────────────────────────────────────────────
    const headerY = 108
    const COL = { rank: 80, score: 280, result: 480, date: 660 }

    this.add.text(COL.rank,   headerY, '#',      { fontFamily: 'monospace', fontSize: '13px', color: '#4a7a55' }).setOrigin(0.5)
    this.add.text(COL.score,  headerY, 'PUNTUACION',  { fontFamily: 'monospace', fontSize: '13px', color: '#4a7a55' }).setOrigin(0.5)
    this.add.text(COL.result, headerY, 'RESULTADO', { fontFamily: 'monospace', fontSize: '13px', color: '#4a7a55' }).setOrigin(0.5)
    this.add.text(COL.date,   headerY, 'FECHA',   { fontFamily: 'monospace', fontSize: '13px', color: '#4a7a55' }).setOrigin(0.5)

    const sep = this.add.graphics()
    sep.lineStyle(1, 0xffdd00, 0.2)
    sep.lineBetween(60, headerY + 18, GAME_WIDTH - 60, headerY + 18)

    // ── Filas ─────────────────────────────────────────────────────
    if (this.scores.length === 0) {
      this.add
        .text(GAME_WIDTH / 2, 300, 'SIN PUNTUACIONES\nJUEGA PARA QUE SALGA TU CLASIFICACION!', {
          fontFamily: 'monospace', fontSize: '16px',
          color: '#4a7a55', align: 'center',
        })
        .setOrigin(0.5)
    } else {
      this.scores.forEach((entry, i) => {
        const rowY    = 150 + i * 38
        const isTop3  = i < 3
        const medals  = ['★', '✦', '◆']
        const colors  = ['#ffdd00', '#aaaaaa', '#cd7f32']
        const rowColor = isTop3 ? colors[i] : '#c8ffd4'

        // Fondo alterno
        if (i % 2 === 0) {
          this.add.rectangle(GAME_WIDTH / 2, rowY, GAME_WIDTH - 80, 32, 0xffffff, 0.02)
        }

        // Posición / medalla
        this.add
          .text(COL.rank, rowY, isTop3 ? medals[i] : `${i + 1}.`, {
            fontFamily: 'monospace',
            fontSize:   isTop3 ? '18px' : '16px',
            color:      rowColor,
          })
          .setOrigin(0.5)

        // Score
        this.add
          .text(COL.score, rowY, String(entry.score).padStart(6, '0'), {
            fontFamily: 'monospace',
            fontSize:   '18px',
            fontStyle:  isTop3 ? 'bold' : 'normal',
            color:      rowColor,
          })
          .setOrigin(0.5)

        // Resultado (victory o gameover)
        const resultLabel = entry.result === 'victory' ? '✓ VICTORIA' : '✕ DERROTA'
        const resultColor = entry.result === 'victory' ? '#00ff88' : '#ff3c5f'
        this.add
          .text(COL.result, rowY, resultLabel, {
            fontFamily: 'monospace', fontSize: '14px', color: resultColor,
          })
          .setOrigin(0.5)

        // Fecha
        this.add
          .text(COL.date, rowY, entry.date, {
            fontFamily: 'monospace', fontSize: '13px', color: '#4a7a55',
          })
          .setOrigin(0.5)

        // Animación de entrada escalonada
        const allTexts = this.children.list.slice(-5)  // los últimos 5 objetos añadidos
        allTexts.forEach(obj => {
          if ('setAlpha' in obj) {
            (obj as Phaser.GameObjects.Text).setAlpha(0)
            this.tweens.add({ targets: obj, alpha: 1, duration: 200, delay: i * 50 })
          }
        })
      })
    }

    // ── Botones ───────────────────────────────────────────────────
    this.createClearButton(GAME_WIDTH - 100, GAME_HEIGHT - 44)
    this.createBackButton(200, GAME_HEIGHT - 44)

    this.cameras.main.fadeIn(300, 7, 9, 15)
  }

  private createBackButton(x: number, y: number) {
    const bg = this.add
      .rectangle(x, y, 220, 40, 0xffdd00, 0.08)
      .setInteractive({ useHandCursor: true })

    const border = this.add.graphics()
    border.lineStyle(1, 0xffdd00, 0.4)
    border.strokeRect(x - 110, y - 20, 220, 40)

    const text = this.add
      .text(x, y, '◂  VOLVER AL MENU', {
        fontFamily: 'monospace', fontSize: '13px',
        color: '#ffdd00', letterSpacing: 2,
      })
      .setOrigin(0.5)

    bg.on('pointerover', () => { bg.setFillStyle(0xffdd00, 0.2); text.setColor('#ffffff') })
    bg.on('pointerout',  () => { bg.setFillStyle(0xffdd00, 0.08); text.setColor('#ffdd00') })
    bg.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 7, 9, 15)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'))
    })
  }

  private createClearButton(x: number, y: number) {
    const bg = this.add
      .rectangle(x, y, 140, 40, 0xff3c5f, 0.08)
      .setInteractive({ useHandCursor: true })

    const border = this.add.graphics()
    border.lineStyle(1, 0xff3c5f, 0.4)
    border.strokeRect(x - 70, y - 20, 140, 40)

    const text = this.add
      .text(x, y, '✕  BORRAR', {
        fontFamily: 'monospace', fontSize: '13px',
        color: '#ff3c5f', letterSpacing: 2,
      })
      .setOrigin(0.5)

    bg.on('pointerover', () => { bg.setFillStyle(0xff3c5f, 0.2); text.setColor('#ffffff') })
    bg.on('pointerout',  () => { bg.setFillStyle(0xff3c5f, 0.08); text.setColor('#ff3c5f') })
    bg.on('pointerdown', () => {
      ScoreManager.clear()
      this.cameras.main.fadeOut(200, 7, 9, 15)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart())
    })
  }
}