import Chest from "~/items/Chest";

import {sceneEvents} from "~/events/EventsCenter";

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      faune(x: number, y: number, texture: string, frame?: string | number)
    }
  }
}

// More ways to get global variables in TS
// 1) const initialData = (window as any).__INITIAL_DATA__;  (is not a guarantee that the Variable will be set correctly at runtime)
// 2) declare var __INITIAL_DATA__: any;   (window.__INITIAL_DATA__ will not work from within an ECMAScript module)
// 3) ...the method above :) (a good idea to create a globals.d.ts file in your project)

enum HealthState {
  IDLE,
  DAMAGE,
  DEAD
}

export default class Faune extends Phaser.Physics.Arcade.Sprite {
  private healthState = HealthState.IDLE
  private damageTime = 0

  private _health = 3
  private _coins = 0

  private knives?: Phaser.Physics.Arcade.Group

  private activeChest?: Chest

  get health() {
    return this._health
  }

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);

    this.anims.play('faune-idle-down')
  }

  setKnives(knives: Phaser.Physics.Arcade.Group) {
    this.knives = knives
  }

  setChest(chest) {
    this.activeChest = chest
  }

  handleDamage(dir: Phaser.Math.Vector2) {
    if (this.healthState === HealthState.DAMAGE) return false
    if (this._health <= 0) return false

    --this._health

    if (this._health <= 0) {    // Die

      this.healthState = HealthState.DEAD
      this.anims.play('faune-faint', true)
      this.setVelocity(0,0)
      // this.body.checkCollision.none = true

    } else {
      this.setVelocity(dir.x, dir.y)

      this.setTint(0xff0000)

      this.healthState = HealthState.DAMAGE
      this.damageTime = 0
    }
  } // *** handleDamage() ***

  private throwKnife() {
    if (!this.knives) return undefined;

    const direction = this.anims.currentAnim.key.split('-').pop()

    const vec = new Phaser.Math.Vector2(0, 0)
    switch (direction) {
      case 'up':
        vec.y = -1
        break

      case 'down':
        vec.y = 1
        break

      case 'side':
        if (this.flipX) {  // if (this.scaleX < 0) - if using this way to turn animation
          vec.x = -1
        } else {
          vec.x = 1
        }
        break

      default:
        break
    }

    const angle = vec.angle()
    const knife = this.knives.get(this.x, this.y, 'knife') as Phaser.Physics.Arcade.Image

    if (!knife) return undefined

    knife.setActive(true)
    knife.setVisible(true)

    // knife.enableBody(true, knife.x, knife.y, true, true)

    const body = knife.body as Phaser.Physics.Arcade.Body
    body.enable = true

    knife.setRotation(angle)  // TODO rotate the hitbox also

    knife.x += vec.x * 16;
    knife.y += vec.y * 16;

    knife.setVelocity(vec.x * 200, vec.y * 200);

  } // *** throwKnife() ***

  protected preUpdate(t: number, dt: number) {
    super.preUpdate(t, dt);

    switch (this.healthState) {
      case HealthState.IDLE:
        break
      case HealthState.DAMAGE:
        const animKey = this.anims.currentAnim.key.split('-').pop()
        this.anims.play(`faune-push-${animKey}`)

        this.damageTime+=dt
        if (this.damageTime >= 250) {
          this.healthState = HealthState.IDLE
          this.setTint(0xffffff)
          this.damageTime = 0
        }
        break
      case HealthState.DEAD:
        this.setVelocity(0, 0)
        break

    }
  } // *** preUpdate() ***

  update(cursor: Phaser.Types.Input.Keyboard.CursorKeys) {
    super.update()

    if (this.healthState === HealthState.DEAD || this.healthState === HealthState.DAMAGE) return false

    if (!cursor) return false

    if (Phaser.Input.Keyboard.JustDown(cursor.space)) {
      if (this.activeChest) {
        const coins = this.activeChest.open()
        this._coins += coins

        sceneEvents.emit('player-coins-changed', this._coins)

        console.log(this._coins);
      } else {
        this.throwKnife()
      }

      return
    }

    const speed = 150;

    if (cursor.left.isDown) {
      this.setVelocity(-speed, 0)
      // reverse animation
      this.flipX = true;

      // This is from video, but it seems to be a bad approach
      // this.scaleX = -1;
      // this.body.offset.x = 24

      this.anims.play('faune-run-side', true)
    } else if (cursor.right.isDown) {
      this.setVelocity(speed, 0)
      // reverse animation
      this.flipX = false;

      // this.scaleX = 1;
      // this.body.offset.x = 8

      this.anims.play('faune-run-side', true)
    } else if (cursor.up.isDown) {
      this.setVelocity(0, -speed)
      this.anims.play('faune-run-up', true)
    } else if (cursor.down.isDown) {
      this.setVelocity(0, speed)
      this.anims.play('faune-run-down', true)
    } else {
      this.setVelocity(0, 0)
      const currentKey = this.anims.currentAnim.key
      const actionKey = currentKey.split('-').pop()

      this.anims.play(`faune-idle-${actionKey}`, true)
    }

    if (cursor.left.isDown || cursor.right.isDown || cursor.up.isDown || cursor.down.isDown) {
      this.activeChest = undefined
    }

  } // *** update() ***
}

Phaser.GameObjects.GameObjectFactory.register('faune', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string, frame?: string | number) {
  let sprite = new Faune(this.scene, x, y, texture, frame)

  this.displayList.add(sprite)
  this.updateList.add(sprite)

  this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

  sprite.body.setSize(sprite.width * 0.5, sprite.height * 0.8, true)

  return sprite
})
