import Lizard from "~/enemies/Lizard";

// import {debugDraw} from "../utils/debug";
import {createLizardAnims} from "~/animation/LizardAnims";
import {createCharacterAnims} from "~/animation/CharacterAnims";
import {createChestAnims} from "~/animation/TreasureAnims";

import '../characters/Faune'
import Faune from "~/characters/Faune";
import {sceneEvents} from "~/events/EventsCenter";
import Chest from "~/items/Chest";

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

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      // maxSize: 3
    })

    this.faune = this.add.faune(128, 128, 'faune')
    this.faune.setKnives(this.knives)

    const wallsLayer: Phaser.Tilemaps.TilemapLayer = map.createLayer('walls', tileset)

    wallsLayer.setCollisionByProperty({collides: true})

    const chests = this.physics.add.staticGroup({
      classType: Chest
    })
    const chestLayer = map.getObjectLayer('chests')
    chestLayer.objects.forEach(chest => {
      chests.get(chest.x! - chest.width! * 0.5, chest.y! - chest.height! * 0.5, 'treasure', 'chest_empty_open_anim_f0.png')
    })

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
    const lizardLayer = map.getObjectLayer('lizards')
    lizardLayer.objects.forEach((lizard) => {
      this.lizards?.get(lizard.x! - lizard.width! * 0.5, lizard.y! - lizard.height! * 0.5, 'green_lizard', 1)
    })

    this.lizards.get(160, 160, 'green_lizard')

    this.physics.add.collider(this.faune, wallsLayer)
    this.physics.add.collider(wallsLayer, this.lizards)

    this.physics.add.collider(this.faune, chests, this.handlePlayerChestCollision, undefined, this)

    this.physics.add.collider(this.knives, this.lizards, this.handleKnivesLizardCollision, undefined, this)
    this.physics.add.collider(this.knives, wallsLayer, this.handleKnivesWallCollision, undefined, this)

    this.playerLizardsCollider = this.physics.add.collider(this.faune, this.lizards, this.handlePlayerLizardCollision, undefined, this)

  }

  private handlePlayerChestCollision(faune: Phaser.GameObjects.GameObject, chest: Phaser.GameObjects.GameObject | Chest) {
    this.faune.setChest(chest)
  }

  update(t, dt) {

    if (this.faune) {
      this.faune.update(this.cursors)
    }

  }

  private handleKnivesLizardCollision(knife: Phaser.GameObjects.GameObject, lizard: Phaser.GameObjects.GameObject) {
    // .killAndHide is the same as:
    // .setActive(false)
    // .setVisible(false)

    // @ts-ignore
    // gameObject.disableBody(disableGameObject(deactivate this GO - the same as .kill() ), hideGameObject)
    knife.disableBody(true, true)
    // @ts-ignore
    lizard.disableBody(true, true)

    //     Way from the video:
    // this.knives?.killAndHide(knife)
    // this.lizards?.killAndHide(lizard)

  }
  private handleKnivesWallCollision(knife: Phaser.GameObjects.GameObject, wall: Phaser.GameObjects.GameObject) {
    const body1 = knife.body as Phaser.Physics.Arcade.Body

    // @ts-ignore
    knife.disableBody(true, true)

    //     Way from the video:
    // this.knives?.killAndHide(knife)
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
