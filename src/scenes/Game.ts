import Lizard from "~/enemies/Lizard";

import {debugDraw} from "../utils/debug";
import {createLizardAnims} from "~/animation/LizardAnims";
import {createCharacterAnims} from "~/animation/CharacterAnims";

import '../characters/Faune'

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private faune!: Phaser.Physics.Arcade.Sprite
  private lizards?: Phaser.Physics.Arcade.Group

  private hit = 0

  constructor() {
    super('game');
  }

  preload() {
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {
    createLizardAnims(this.anims)
    createCharacterAnims(this.anims)

    const map = this.make.tilemap({key: 'dungeon'})
    const tileset = map.addTilesetImage('dungeon_tilemap', 'tiles_ext', 16, 16, 1, 2)
    // const tileset = map.addTilesetImage('dungeon_tilemap', 'tiles', 16, 16)

    map.createLayer('ground', tileset)
    const wallsLayer: Phaser.Tilemaps.TilemapLayer = map.createLayer('walls', tileset)

    wallsLayer.setCollisionByProperty({collides: true})

    debugDraw(this, wallsLayer)

    this.faune = this.add.faune(128, 128, 'faune')

    // this.faune = this.physics.add.sprite(128, 128, 'faune', 'walk-down-3.png')
    // this.faune.body
    //   .setSize(this.faune.width * 0.5, this.faune.height * 0.8, true)

    const mainCamera = this.cameras.main
    mainCamera
      .startFollow(this.faune, true,
        0.1, 0.1,
        0, 0)
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels)
      .setDeadzone(150, 110)

    const lizards = this.physics.add.group({
      classType: Lizard,
      createCallback: (go) => {
        const lizGO = go as Lizard

        lizGO.body.onCollide = true
      }
    })
    lizards.get(160, 160, 'green_lizard')

    this.physics.add.collider(this.faune, wallsLayer)
    this.physics.add.collider(wallsLayer, lizards)
    this.physics.add.collider(this.faune, lizards, this.playerLizardCollision, undefined, this)

    // const lizard = this.physics.add.sprite(160, 160, 'green_lizard')
    // lizard.anims.play('lizard-idle')
  }

  update(t, dt) {
    if (this.hit > 0) {
      ++this.hit
      if (this.hit > 10) {
        this.hit = 0
      }

      return false
    }

    if (this.cursors && this.faune) {
      this.faune.update(this.cursors)
    }


  }

  private playerLizardCollision(faune: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
    const lizard = obj2 as Lizard

    const dx = this.faune.x - lizard.x
    const dy = this.faune.y - lizard.y

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200)

    this.faune.setVelocity(dir.x, dir.y)

    this.hit = 1
  }

}
