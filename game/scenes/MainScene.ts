import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config'
import { loadOptions } from './Optionsscene'

const LEVEL_CONFIG = {
  1: { playerSpeed: 160, jumpForce: 330, bombSpeed: 150, starCount: 11, platformColor: 0x00ff88, label: 'NIVEL 1' },
  2: { playerSpeed: 200, jumpForce: 350, bombSpeed: 220, starCount: 8, platformColor: 0x00ccff, label: 'NIVEL 2' },
  3: { playerSpeed: 240, jumpForce: 370, bombSpeed: 300, starCount: 6, platformColor: 0xff3c5f, label: 'NIVEL 3' },
}

type LevelKey = keyof typeof LEVEL_CONFIG

export class MainScene extends Phaser.Scene {
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keyW!: Phaser.Input.Keyboard.Key
  private keyA!: Phaser.Input.Keyboard.Key
  private keyD!: Phaser.Input.Keyboard.Key
  private keySpace!: Phaser.Input.Keyboard.Key
  private keyEsc!: Phaser.Input.Keyboard.Key
  private keyP!: Phaser.Input.Keyboard.Key
  private stars!: Phaser.Physics.Arcade.Group
  private bombs!: Phaser.Physics.Arcade.Group
  private scoreText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private livesText!: Phaser.GameObjects.Text

  private score: number = 0
  private lives: number = 3
  private level: LevelKey = 1
  private gameOver: boolean = false
  private controls: 'arrows' | 'wasd' = 'arrows'
  private sfxVolume: number = 1   // 0.0 – 1.0

  constructor() {
    super({ key: 'MainScene' })
  }

  init(data: { level?: LevelKey; score?: number; lives?: number }) {
    this.level = data.level ?? 1
    this.score = data.score ?? 0
    this.lives = data.lives ?? 3
    this.gameOver = false
    const opts = loadOptions()
    this.controls = opts.controls
    this.sfxVolume = opts.sfxVolume / 100
  }

  preload() {
    this.load.image('sky', 'assets/sky.png')
    this.load.image('ground', 'assets/platform.png')
    this.load.image('star', 'assets/star.png')
    this.load.image('bomb', 'assets/bomb.png')
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 })

     // ── Efectos de sonido ──────────────────────────────────────────
    // Carga solo si no están ya en caché (evita errores al reiniciar el nivel)
    if (!this.cache.audio.exists('sfx_collect')) {
      this.load.audio('sfx_collect', 'assets/sfx/Picked Coin Echo 2.wav')
    }
    if (!this.cache.audio.exists('sfx_bomb')) {
      this.load.audio('sfx_bomb', 'assets/sfx/8bit_bomb_explosion.wav')
    }
    if (!this.cache.audio.exists('sfx_levelup')) {
      this.load.audio('sfx_levelup', 'assets/sfx/completetask_0.mp3')
    }
  }

  create() {
    const cfg = LEVEL_CONFIG[this.level]
    const accentHex = '#' + cfg.platformColor.toString(16).padStart(6, '0')

    this.add.image(400, 300, 'sky')
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x07090f, 0.3).setDepth(0)

    const grid = this.add.graphics().setDepth(0)
    grid.lineStyle(1, cfg.platformColor, 0.05)
    for (let x = 0; x <= GAME_WIDTH; x += 40) grid.lineBetween(x, 0, x, GAME_HEIGHT)
    for (let y = 0; y <= GAME_HEIGHT; y += 40) grid.lineBetween(0, y, GAME_WIDTH, y)

    // ── Plataformas ──────────────────────────────────────────────
    this.platforms = this.physics.add.staticGroup()
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody()
    this.platforms.create(600, 400, 'ground')
    this.platforms.create(50, 250, 'ground')
    this.platforms.create(750, 220, 'ground')
    if (this.level >= 2) this.platforms.create(400, 320, 'ground')
    if (this.level >= 3) this.platforms.create(200, 150, 'ground')

    // ── Jugador ──────────────────────────────────────────────────
    this.player = this.physics.add.sprite(100, 450, 'dude')
    this.player.setBounce(0.2)
    this.player.setCollideWorldBounds(true)
    this.player.setDepth(1)

    if (!this.anims.exists('left')) {
      this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }), frameRate: 10, repeat: -1 })
      this.anims.create({ key: 'turn', frames: [{ key: 'dude', frame: 4 }], frameRate: 20 })
      this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }), frameRate: 10, repeat: -1 })
    }

    // ── Estrellas y bombas ────────────────────────────────────────
    this.stars = this.physics.add.group({ key: 'star', repeat: cfg.starCount, setXY: { x: 12, y: 0, stepX: 70 } })
    this.stars.children.iterate((c) => { ; (c as Phaser.Physics.Arcade.Image).setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); return true })
    this.bombs = this.physics.add.group()

    // ── HUD ──────────────────────────────────────────────────────
    this.scoreText = this.add.text(16, 16, 'PUNTUACION: ' + this.score, { fontFamily: 'monospace', fontSize: '20px', color: '#00ff88' }).setDepth(10).setScrollFactor(0)
    this.livesText = this.add.text(16, 44, 'VIDAS: ' + '♥ '.repeat(this.lives).trim(), { fontFamily: 'monospace', fontSize: '20px', color: '#00ccff' }).setDepth(10).setScrollFactor(0)
    this.levelText = this.add.text(GAME_WIDTH - 16, 16, cfg.label, { fontFamily: 'monospace', fontSize: '20px', color: accentHex }).setOrigin(1, 0).setDepth(10).setScrollFactor(0)

    // ── Botón pausa en pantalla ───────────────────────────────────
    this.createPauseButton()

    // ── Colisiones ───────────────────────────────────────────────
    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.stars, this.platforms)
    this.physics.add.collider(this.bombs, this.platforms)
    this.physics.add.overlap(this.player, this.stars, (p, s) => this.collectStar(p as Phaser.Types.Physics.Arcade.GameObjectWithBody, s as Phaser.Types.Physics.Arcade.GameObjectWithBody), undefined, this)
    this.physics.add.collider(this.player, this.bombs, (p, b) => this.hitBomb(p as Phaser.Types.Physics.Arcade.GameObjectWithBody, b as Phaser.Types.Physics.Arcade.GameObjectWithBody), undefined, this)

    // ── Input ────────────────────────────────────────────────────
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    this.keySpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.keyEsc = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    this.keyP = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P)

    this.game.canvas.setAttribute('tabindex', '1')
    this.game.canvas.focus()

    this.cameras.main.fadeIn(300, 7, 9, 15)

    const msg = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, cfg.label, {
        fontFamily: 'monospace', fontSize: '48px', fontStyle: 'bold',
        color: accentHex, stroke: '#000', strokeThickness: 4,
      })
      .setOrigin(0.5).setDepth(20)

    this.tweens.add({ targets: msg, alpha: 0, y: GAME_HEIGHT / 2 - 40, delay: 800, duration: 600, onComplete: () => msg.destroy() })
  }

  update() {
    if (this.gameOver) return

    // ── Pausa con ESC o P ─────────────────────────────────────────
    if (Phaser.Input.Keyboard.JustDown(this.keyEsc) || Phaser.Input.Keyboard.JustDown(this.keyP)) {
      this.openPause()
      return
    }

    const cfg = LEVEL_CONFIG[this.level]
    const left = this.controls === 'wasd' ? this.keyA.isDown : this.cursors.left.isDown
    const right = this.controls === 'wasd' ? this.keyD.isDown : this.cursors.right.isDown
    const up = this.controls === 'wasd' ? this.keyW.isDown : this.cursors.up.isDown
    const jump = up || this.keySpace.isDown

    if (left) {
      this.player.setVelocityX(-cfg.playerSpeed)
      this.player.anims.play('left', true)
    } else if (right) {
      this.player.setVelocityX(cfg.playerSpeed)
      this.player.anims.play('right', true)
    } else {
      this.player.setVelocityX(0)
      this.player.anims.play('turn')
    }

    if (jump && this.player.body!.touching.down) {
      this.player.setVelocityY(-cfg.jumpForce)
    }
  }

  // ── Reproducir SFX con el volumen guardado ────────────────────────
  private playSfx(key: string) {
    if (this.cache.audio.exists(key)) {
      this.sound.play(key, { volume: this.sfxVolume })
    }
  }

  // ── Botón ⏸ esquina inferior derecha ─────────────────────────────
  private createPauseButton() {
    const x = GAME_WIDTH - 28
    const y = GAME_HEIGHT - 20

    const bg = this.add
      .rectangle(x, y, 48, 28, 0x00ff88, 0.1)
      .setDepth(10).setScrollFactor(0)
      .setInteractive({ useHandCursor: true })

    const border = this.add.graphics().setDepth(10).setScrollFactor(0)
    border.lineStyle(1, 0x00ff88, 0.3)
    border.strokeRect(x - 24, y - 14, 48, 28)

    this.add
      .text(x, y, '⏸', { fontSize: '16px', color: '#00ff88' })
      .setOrigin(0.5).setDepth(10).setScrollFactor(0)

    this.add
      .text(x - 30, y, 'P', { fontFamily: 'monospace', fontSize: '10px', color: '#2a4a33' })
      .setOrigin(1, 0.5).setDepth(10).setScrollFactor(0)

    bg.on('pointerover', () => bg.setFillStyle(0x00ff88, 0.25))
    bg.on('pointerout', () => bg.setFillStyle(0x00ff88, 0.1))
    bg.on('pointerdown', () => this.openPause())
  }

  // ── Lanza PauseScene encima sin destruir MainScene ────────────────
  private openPause() {
    if (this.gameOver) return
    this.scene.pause()
    this.scene.launch('PauseScene')
  }

  private collectStar(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    star: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    (star as Phaser.Physics.Arcade.Image).disableBody(true, true)
    this.playSfx('sfx_collect')
    this.score += 10
    this.scoreText.setText('PUNTUACION: ' + this.score)

    if (this.stars.countActive(true) === 0) {
      if (this.level < 3) this.goToNextLevel()
      else this.showVictory()
    } else {
      this.spawnBomb()
    }
  }

  private hitBomb(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    _bomb: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    this.playSfx('sfx_bomb')
    this.lives -= 1
    this.livesText.setText('VIDAS: ' + '♥ '.repeat(Math.max(this.lives, 0)).trim())
      ; (player as Phaser.Physics.Arcade.Sprite).setTint(0xff0000)

    if (this.lives <= 0) {
      this.showGameOver()
    } else {
      this.time.delayedCall(600, () => {
        this.player.clearTint()
        this.player.setPosition(100, 450)
        this.bombs.clear(true, true)
      })
    }
  }

  private spawnBomb() {
    const cfg = LEVEL_CONFIG[this.level]
    const x = this.player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)
    const bomb = this.bombs.create(x, 16, 'bomb') as Phaser.Physics.Arcade.Image
    bomb.setBounce(1)
    bomb.setCollideWorldBounds(true)
    bomb.setVelocity(Phaser.Math.Between(-cfg.bombSpeed, cfg.bombSpeed), cfg.bombSpeed * 0.1)
  }

  private goToNextLevel() {
    this.gameOver = true
    const nextLevel = (this.level + 1) as LevelKey
    this.cameras.main.fadeOut(800, 7, 9, 15)
    this.playSfx('sfx_levelup')
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart({ level: nextLevel, score: this.score, lives: this.lives })
    })
  }

  private showVictory() {
    this.gameOver = true
    this.physics.pause()
    this.playSfx('sfx_levelup')
    this.cameras.main.fadeOut(400, 7, 9, 15)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('VictoryScene', { score: this.score })
    })
  }

  private showGameOver() {
    this.gameOver = true
    this.physics.pause()
      ; (this.player as Phaser.Physics.Arcade.Sprite).setTint(0xff0000)
    this.cameras.main.fadeOut(400, 7, 9, 15)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameOverScene', { score: this.score })
    })
  }
}