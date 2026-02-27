import Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private stars!: Phaser.Physics.Arcade.Group
  private bombs!: Phaser.Physics.Arcade.Group
  private scoreText!: Phaser.GameObjects.Text
  private score: number = 0
  private gameOver: boolean = false

  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {
    this.load.image('sky', './assets/sky.png')
    this.load.image('ground', './assets/platform.png')
    this.load.image('star', './assets/star.png')
    this.load.image('bomb', './assets/bomb.png')
    this.load.spritesheet('dude', './assets/dude.png', {
      frameWidth: 32,
      frameHeight: 48,
    })
  }

  create() {

     this.input.keyboard!.addCapture('UP,DOWN,LEFT,RIGHT,SPACE')
  this.game.canvas.setAttribute('tabindex', '1')
  this.game.canvas.focus()
    // ── Fondo ──────────────────────────────────────────────────────
    this.add.image(400, 300, 'sky')

    // ── Plataformas ────────────────────────────────────────────────
    this.platforms = this.physics.add.staticGroup()
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody()
    this.platforms.create(600, 400, 'ground')
    this.platforms.create(50, 250, 'ground')
    this.platforms.create(750, 220, 'ground')

    // ── Jugador ────────────────────────────────────────────────────
    this.player = this.physics.add.sprite(100, 450, 'dude')
    this.player.setBounce(0.2)
    this.player.setCollideWorldBounds(true)

    // Animaciones del jugador
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    })
    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20,
    })
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    })

    // ── Estrellas ──────────────────────────────────────────────────
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,           // 12 estrellas en total (1 + 11)
      setXY: { x: 12, y: 0, stepX: 70 },
    })

    // Cada estrella rebota distinto al caer
    this.stars.children.iterate((child) => {
      ;(child as Phaser.Physics.Arcade.Image).setBounceY(
        Phaser.Math.FloatBetween(0.4, 0.8)
      )
      return true
    })

    // ── Bombas ─────────────────────────────────────────────────────
    this.bombs = this.physics.add.group()

    // ── Texto de puntuación ────────────────────────────────────────
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      color: '#000',
    })

    // ── Colisiones ─────────────────────────────────────────────────
    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.stars, this.platforms)
    this.physics.add.collider(this.bombs, this.platforms)

    // Cuando el jugador toca una estrella → collectStar
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      undefined,
      this
    )

    // Cuando el jugador toca una bomba → hitBomb
    this.physics.add.collider(
      this.player,
      this.bombs,
      this.hitBomb,
      undefined,
      this
    )

    // ── Input ──────────────────────────────────────────────────────
    this.cursors = this.input.keyboard!.createCursorKeys()
  }

  update() {
    if (this.gameOver) return  // Si game over, no hacemos nada

    // Movimiento horizontal
   const left  = this.cursors.left.isDown  || this.input.keyboard!.addKey('A').isDown
  const right = this.cursors.right.isDown || this.input.keyboard!.addKey('D').isDown
  const up    = this.cursors.up.isDown    || this.input.keyboard!.addKey('W').isDown

  if (left) {
    this.player.setVelocityX(-160)
    this.player.anims.play('left', true)
  } else if (right) {
    this.player.setVelocityX(160)
    this.player.anims.play('right', true)
  } else {
    this.player.setVelocityX(0)
    this.player.anims.play('turn')
  }

  if (up && this.player.body!.touching.down) {
    this.player.setVelocityY(-330)
  }
  }

  // ── Recoger estrella ─────────────────────────────────────────────
  private collectStar(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    star: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ) {
    // Desactiva la estrella (la hace invisible e inactiva)
    ;(star as Phaser.Physics.Arcade.Image).disableBody(true, true)

    // Suma 10 puntos y actualiza el texto
    this.score += 10
    this.scoreText.setText('Score: ' + this.score)

    // Si no quedan estrellas activas → respawn estrellas + nueva bomba
    if (this.stars.countActive(true) === 0) {
      // Reactiva todas las estrellas
      this.stars.children.iterate((child) => {
        const star = child as Phaser.Physics.Arcade.Image
        star.enableBody(true, star.x, 0, true, true)
        return true
      })

      // Lanza una bomba desde el lado opuesto al jugador
      const x =
        this.player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400)

      const bomb = this.bombs.create(x, 16, 'bomb') as Phaser.Physics.Arcade.Image
      bomb.setBounce(1)
      bomb.setCollideWorldBounds(true)
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
    }
  }

  // ── Colisión con bomba = Game Over ───────────────────────────────
  private hitBomb(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    _bomb: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ) {
    this.physics.pause()  // Pausa toda la física

    ;(player as Phaser.Physics.Arcade.Sprite).setTint(0xff0000)  // Jugador rojo
    ;(player as Phaser.Physics.Arcade.Sprite).anims.play('turn')

    this.gameOver = true

    // Texto de Game Over centrado
    this.add
      .text(400, 300, 'GAME OVER', {
        fontSize: '64px',
        color: '#ff0000',
        stroke: '#000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
  }
}