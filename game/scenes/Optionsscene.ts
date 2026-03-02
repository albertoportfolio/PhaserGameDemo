import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config'
import { MusicManager } from '../MusicManager'

export interface GameOptions {
  musicVolume: number
  sfxVolume:   number
  controls:    'arrows' | 'wasd'
}

export const DEFAULT_OPTIONS: GameOptions = {
  musicVolume: 80,
  sfxVolume:   100,
  controls:    'arrows',
}

export function loadOptions(): GameOptions {
  try {
    const saved = localStorage.getItem('gameOptions')
    if (saved) return { ...DEFAULT_OPTIONS, ...JSON.parse(saved) }
  } catch (_) {}
  return { ...DEFAULT_OPTIONS }
}

export function saveOptions(opts: GameOptions) {
  localStorage.setItem('gameOptions', JSON.stringify(opts))
}

export class OptionsScene extends Phaser.Scene {
  private opts!: GameOptions

  constructor() {
    super({ key: 'OptionsScene' })
  }

  init() {
    this.opts = loadOptions()
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x07090f)

    const grid = this.add.graphics()
    grid.lineStyle(1, 0x00ccff, 0.04)
    for (let x = 0; x <= GAME_WIDTH;  x += 40) grid.lineBetween(x, 0, x, GAME_HEIGHT)
    for (let y = 0; y <= GAME_HEIGHT; y += 40) grid.lineBetween(0, y, GAME_WIDTH, y)

    const lines = this.add.graphics()
    lines.lineStyle(1, 0x00ccff, 0.3)
    lines.lineBetween(60, 80, GAME_WIDTH - 60, 80)
    lines.lineBetween(60, GAME_HEIGHT - 80, GAME_WIDTH - 60, GAME_HEIGHT - 80)

    this.add
      .text(GAME_WIDTH / 2, 44, 'OPCIONES', {
        fontFamily: 'monospace', fontSize: '32px', fontStyle: 'bold',
        color: '#00ccff', letterSpacing: 6,
      })
      .setOrigin(0.5)

    // ── AUDIO ─────────────────────────────────────────────────────
    this.addSectionLabel(GAME_WIDTH / 2, 130, '— AUDIO —')

    this.createSlider(
      GAME_WIDTH / 2, 190, 'MUSICA', this.opts.musicVolume,
      (val) => {
        this.opts.musicVolume = val
        MusicManager.setVolume(val / 100)  // ← aplica en tiempo real
        saveOptions(this.opts)
      }
    )

    this.createSlider(
      GAME_WIDTH / 2, 265, 'SFX', this.opts.sfxVolume,
      (val) => {
        this.opts.sfxVolume = val
        saveOptions(this.opts)
      }
    )

    // ── CONTROLS ──────────────────────────────────────────────────
    this.addSectionLabel(GAME_WIDTH / 2, 345, '— CONTROLES —')

    this.add
      .text(GAME_WIDTH / 2, 385, 'MOVIMIENTO', {
        fontFamily: 'monospace', fontSize: '14px', color: '#c8ffd4',
      })
      .setOrigin(0.5)

    this.createToggle(
      GAME_WIDTH / 2, 430,
      [
        { label: '↑ ← ↓ →  FLECHAS', value: 'arrows' },
        { label: 'W A S D',          value: 'wasd'   },
      ],
      this.opts.controls,
      (val) => {
        this.opts.controls = val as 'arrows' | 'wasd'
        saveOptions(this.opts)
      }
    )

    this.add
      .text(GAME_WIDTH / 2, 480, 'TIP: EL ESPACIO SIRVE PARA SALTAR', {
        fontFamily: 'monospace', fontSize: '11px', color: '#2a4a33',
      })
      .setOrigin(0.5)

    this.createBackButton()
    this.cameras.main.fadeIn(300, 7, 9, 15)
  }

  private addSectionLabel(x: number, y: number, label: string) {
    this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '13px',
      color: '#4a7a55', letterSpacing: 4,
    }).setOrigin(0.5)
  }

  private createSlider(
    x: number, y: number,
    label: string, initialValue: number,
    onChange: (val: number) => void
  ) {
    const TRACK_W = 300
    const TRACK_H = 4
    const KNOB_R  = 10

    this.add.text(x - TRACK_W / 2, y - 22, label, {
      fontFamily: 'monospace', fontSize: '14px', color: '#c8ffd4',
    })

    const valueText = this.add
      .text(x + TRACK_W / 2, y - 22, initialValue + '%', {
        fontFamily: 'monospace', fontSize: '14px', color: '#00ccff',
      })
      .setOrigin(1, 0)

    const trackBg = this.add.graphics()
    trackBg.fillStyle(0x1a2a1a)
    trackBg.fillRect(x - TRACK_W / 2, y - TRACK_H / 2, TRACK_W, TRACK_H)

    const trackFill = this.add.graphics()
    const drawFill  = (val: number) => {
      trackFill.clear()
      trackFill.fillStyle(0x00ccff)
      trackFill.fillRect(x - TRACK_W / 2, y - TRACK_H / 2, TRACK_W * (val / 100), TRACK_H)
    }
    drawFill(initialValue)

    let value   = initialValue
    const knobX = () => x - TRACK_W / 2 + TRACK_W * (value / 100)
    const knob  = this.add.circle(knobX(), y, KNOB_R, 0x00ccff)
      .setInteractive({ useHandCursor: true })

    const hitArea = this.add
      .rectangle(x, y, TRACK_W + KNOB_R * 2, 30, 0xffffff, 0)
      .setInteractive({ useHandCursor: true })

    const updateKnob = (pointerX: number) => {
      const clamped = Phaser.Math.Clamp(pointerX, x - TRACK_W / 2, x + TRACK_W / 2)
      value         = Math.round(((clamped - (x - TRACK_W / 2)) / TRACK_W) * 100)
      knob.setPosition(knobX(), y)
      drawFill(value)
      valueText.setText(value + '%')
      onChange(value)
    }

    let dragging = false
    knob.on('pointerdown', () => { dragging = true })
    hitArea.on('pointerdown', (ptr: Phaser.Input.Pointer) => { dragging = true; updateKnob(ptr.x) })
    this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => { if (dragging) updateKnob(ptr.x) })
    this.input.on('pointerup', () => { dragging = false })
    knob.on('pointerover', () => knob.setScale(1.3))
    knob.on('pointerout',  () => { if (!dragging) knob.setScale(1) })
  }

  private createToggle(
    x: number, y: number,
    options: { label: string; value: string }[],
    initialValue: string,
    onChange: (val: string) => void
  ) {
    let current  = options.findIndex(o => o.value === initialValue)
    const BTN_W  = 180
    const BTN_H  = 42
    const gap    = 20
    const totalW = options.length * BTN_W + (options.length - 1) * gap
    const startX = x - totalW / 2

    const borders: Phaser.GameObjects.Graphics[]  = []
    const bgs:     Phaser.GameObjects.Rectangle[] = []
    const texts:   Phaser.GameObjects.Text[]      = []

    const refresh = () => {
      options.forEach((_, i) => {
        const active = i === current
        bgs[i].setFillStyle(0x00ccff, active ? 0.15 : 0)
        texts[i].setColor(active ? '#00ccff' : '#4a7a55')
        borders[i].clear()
        borders[i].lineStyle(1, 0x00ccff, active ? 0.9 : 0.25)
        const bx = startX + i * (BTN_W + gap) + BTN_W / 2
        borders[i].strokeRect(bx - BTN_W / 2, y - BTN_H / 2, BTN_W, BTN_H)
      })
    }

    options.forEach((opt, i) => {
      const bx = startX + i * (BTN_W + gap) + BTN_W / 2

      borders.push(this.add.graphics())

      const bg = this.add
        .rectangle(bx, y, BTN_W, BTN_H, 0x00ccff, 0)
        .setInteractive({ useHandCursor: true })
      bgs.push(bg)

      texts.push(
        this.add.text(bx, y, opt.label, {
          fontFamily: 'monospace', fontSize: '14px',
          color: '#4a7a55', letterSpacing: 1,
        }).setOrigin(0.5)
      )

      bg.on('pointerover', () => { if (i !== current) bg.setFillStyle(0x00ccff, 0.06) })
      bg.on('pointerout',  () => { if (i !== current) bg.setFillStyle(0x00ccff, 0) })
      bg.on('pointerdown', () => { current = i; refresh(); onChange(opt.value) })
    })

    refresh()
  }

  private createBackButton() {
    const x = GAME_WIDTH / 2
    const y = GAME_HEIGHT - 44

    const bg = this.add
      .rectangle(x, y, 220, 40, 0x00ccff, 0.08)
      .setInteractive({ useHandCursor: true })

    const border = this.add.graphics()
    border.lineStyle(1, 0x00ccff, 0.4)
    border.strokeRect(x - 110, y - 20, 220, 40)

    const text = this.add
      .text(x, y, '◂  VOLVER AL MENU', {
        fontFamily: 'monospace', fontSize: '14px',
        color: '#00ccff', letterSpacing: 2,
      })
      .setOrigin(0.5)

    bg.on('pointerover', () => { bg.setFillStyle(0x00ccff, 0.2); text.setColor('#ffffff') })
    bg.on('pointerout',  () => { bg.setFillStyle(0x00ccff, 0.08); text.setColor('#00ccff') })
    bg.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 7, 9, 15)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'))
    })
  }
}