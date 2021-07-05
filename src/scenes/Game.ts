import Lizard from "~/enemies/Lizard";

// import {debugDraw} from "../utils/debug";
import {createLizardAnims} from "~/animation/LizardAnims";
import {createCharacterAnims} from "~/animation/CharacterAnims";
import {createChestAnims} from "~/animation/TreasureAnims";

import '../characters/Faune'
import Faune from "~/characters/Faune";
import {sceneEvents} from "~/events/EventsCenter";

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private faune!: Faune
  private playerLizardsCollider?: Phaser.Physics.Arcade.Collider
  private knives?: Phaser.Physics.Arcade.Group
  private lizards?: Phaser.Physics.Arcade.Group

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
    createChestAnims(this.anims)

    const map = this.make.tilemap({key: 'dungeon'})
    const map2 = this.add.tilemap('dungeon')
    // const tileset = map.addTilesetImage('dungeon_tilemap', 'tiles_ext', 16, 16, 1, 2)
    const tileset = map.addTilesetImage('dungeon_tilemap', 'tiles', 16, 16)

    map.createLayer('ground', tileset)

    const chest = this.add.sprite(64, 64, 'treasure', 'chest_empty_open_anim_f0.png')
    this.time.delayedCall(2000, () => {
      chest.play('chest-open')
    })

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image
    })

    this.faune = this.add.faune(128, 128, 'faune')
    this.faune.setKnives(this.knives)

    const wallsLayer: Phaser.Tilemaps.TilemapLayer = map.createLayer('walls', tileset)

    wallsLayer.setCollisionByProperty({collides: true})

    const chests = this.physics.add.staticGroup()
    // const chestLayer = map.createFromObjects('chests', {key: 'chest_full_open_anim_f0'})
    const chestLayer = map.createLayer('chests', tileset)
    console.log(chestLayer);
    const aaa = chestLayer.getData('chests')
    console.log(aaa);
    // chestLayer.data.forEach(chest => {
    //   chests.get(chest.x, chest.y, 'treasure', 'chest_empty_open_anim_f0.png')
    // })

    // debugDraw(this, wallsLayer)

    const mainCamera = this.cameras.main
    mainCamera
      .startFollow(this.faune, true,
        0.1, 0.1,
        0, 0)
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels)
      .setDeadzone(150, 110)

    this.lizards = this.physics.add.group({
      classType: Lizard,
      createCallback: (go) => {
        const lizGO = go as Lizard

        lizGO.body.onCollide = true
      }
    })
    this.lizards.get(160, 160, 'green_lizard')

    this.physics.add.collider(this.faune, wallsLayer)
    this.physics.add.collider(wallsLayer, this.lizards)

    this.physics.add.collider(this.knives, this.lizards, this.handleKnivesLizardCollision, undefined, this)
    this.physics.add.collider(this.knives, wallsLayer, this.handleKnivesWallCollision, undefined, this)

    this.playerLizardsCollider = this.physics.add.collider(this.faune, this.lizards, this.handlePlayerLizardCollision, undefined, this)

  }

  update(t, dt) {

    if (this.faune) {
      this.faune.update(this.cursors)
    }

  }

  private handleKnivesLizardCollision(knife: Phaser.GameObjects.GameObject, lizard: Phaser.GameObjects.GameObject) {

    // const body1 = knife.body as Phaser.Physics.Arcade.Body
    // const body2 = lizard.body as Phaser.Physics.Arcade.Body
    //
    // body1.destroy()
    // body2.destroy()

    this.knives?.killAndHide(knife)
    this.lizards?.killAndHide(lizard)
  }
  private handleKnivesWallCollision(knife: Phaser.GameObjects.GameObject, wall: Phaser.GameObjects.GameObject) {
    const body1 = knife.body as Phaser.Physics.Arcade.Body

    body1.destroy()

    this.knives?.killAndHide(knife)
  }

  private handlePlayerLizardCollision(faune: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
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
