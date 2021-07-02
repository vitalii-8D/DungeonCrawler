import Lizard from "~/enemies/Lizard";

import {debugDraw} from "../utils/debug";
import {createLizardAnims} from "~/animation/LizardAnims";
import {createCharacterAnims} from "~/animation/CharacterAnims";

import '../characters/Faune'
import Faune from "~/characters/Faune";
import {sceneEvents} from "~/events/EventsCenter";

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private faune!: Faune
  private playerLizardsCollider?: Phaser.Physics.Arcade.Collider
  // private lizards?: Phaser.Physics.Arcade.Group

  constructor() {
    super('game');
  }

  preload() {
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {
    this.scene.run('game-ui')

    createLizardAnims(this.anims)
    createCharacterAnims(this.anims)

    const map = this.make.tilemap({key: 'dungeon'})
    // const tileset = map.addTilesetImage('dungeon_tilemap', 'tiles_ext', 16, 16, 1, 2)
    const tileset = map.addTilesetImage('dungeon_tilemap', 'tiles', 16, 16)

    map.createLayer('ground', tileset)
    const wallsLayer: Phaser.Tilemaps.TilemapLayer = map.createLayer('walls', tileset)

    wallsLayer.setCollisionByProperty({collides: true})

    // debugDraw(this, wallsLayer)

    this.faune = this.add.faune(128, 128, 'faune')

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

    this.playerLizardsCollider = this.physics.add.collider(this.faune, lizards, this.playerLizardCollision, undefined, this)

  }

  update(t, dt) {

    if (this.faune) {
      this.faune.update(this.cursors)
    }

  }

  private playerLizardCollision(faune: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
    const lizard = obj2 as Lizard

    const dx = this.faune.x - lizard.x
    const dy = this.faune.y - lizard.y

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200)

    this.faune.handleDamage(dir)

    sceneEvents.emit('player-health-changed', this.faune.health)

    if (this.faune.health <=0) {
      this.playerLizardsCollider?.destroy()
    }
  }

}
