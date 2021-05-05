import {debugDraw} from "../utils/debug";

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private faune!: Phaser.Physics.Arcade.Sprite

  constructor() {
    super('game');
  }

  preload() {
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {
    const map = this.make.tilemap({key: 'dungeon'})
    const tileset = map.addTilesetImage('dungeon_tilemap', 'tiles', 16, 16, 1, 2)
    // const tileset = map.addTilesetImage('dungeon_tilemap', 'tiles', 16, 16)

    map.createLayer('ground', tileset)
    const wallsLayer: Phaser.Tilemaps.TilemapLayer = map.createLayer('walls', tileset)

    wallsLayer.setCollisionByProperty({collides: true})

    debugDraw(this, wallsLayer)

    this.faune = this.physics.add.sprite(128, 128, 'faune', 'walk-down-3.png')
    this.faune.body
      .setSize(this.faune.width * 0.5, this.faune.height * 0.8, true)
      // .setScale(2)
    // .setOffset(0, 0)

    this.physics.add.collider(this.faune, wallsLayer)

    this.createAnims()

    this.faune.anims.play('faune-idle-down')

    const mainCamera = this.cameras.main
    mainCamera
      .startFollow(this.faune, true,
        0.1, 0.1,
        0, 0)
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels)
      .setDeadzone(150, 110)
  }

  update(t, dt) {
    if (!this.cursors || !this.faune) return false;

    this.moveFaune()
  }

  private moveFaune() {
    const speed = 150;

    if (this.cursors.left.isDown) {
      this.faune.setVelocity(-speed, 0)
      // reverse animation
      // this.faune.flipX = true;

      this.faune.scaleX = -1; // other way
      this.faune.body.offset.x = 24

      this.faune.anims.play('faune-run-side', true)
    } else if (this.cursors.right.isDown) {
      this.faune.setVelocity(speed, 0)
      // reverse animation
      // this.faune.flipX = false;

      this.faune.scaleX = 1;
      this.faune.body.offset.x = 8

      this.faune.anims.play('faune-run-side', true)
    } else if (this.cursors.up.isDown) {
      this.faune.setVelocity(0, -speed)
      this.faune.anims.play('faune-run-up', true)
    } else if (this.cursors.down.isDown) {
      this.faune.setVelocity(0, speed)
      this.faune.anims.play('faune-run-down', true)
    } else {
      this.faune.setVelocity(0, 0)
      const currentKey = this.faune.anims.currentAnim.key
      const actionKey = currentKey.split('-').pop()

      this.faune.anims.play(`faune-idle-${actionKey}`, true)
    }
  }

  private createAnims() {
    // DOWN
    this.anims.create({
      key: 'faune-idle-down',
      frames: [{key: 'faune', frame: 'walk-down-3.png'}],
    })

    this.anims.create({
      key: 'faune-run-down',
      frames: this.anims.generateFrameNames('faune',
        {
          start: 1, end: 8, prefix: 'run-down-', suffix: '.png'
        }),
      repeat: -1,
      frameRate: 15
    })

    // UP
    this.anims.create({
      key: 'faune-idle-up',
      frames: [{key: 'faune', frame: 'walk-up-3.png'}],
    })

    this.anims.create({
      key: 'faune-run-up',
      frames: this.anims.generateFrameNames('faune',
        {
          start: 1, end: 8, prefix: 'run-up-', suffix: '.png'
        }),
      repeat: -1,
      frameRate: 15
    })
    // RIGHT
    this.anims.create({
      key: 'faune-idle-side',
      frames: [{key: 'faune', frame: 'walk-side-3.png'}],
    })

    this.anims.create({
      key: 'faune-run-side',
      frames: this.anims.generateFrameNames('faune',
        {
          start: 1, end: 8, prefix: 'run-side-', suffix: '.png'
        }),
      repeat: -1,
      frameRate: 15
    })
  }

}
