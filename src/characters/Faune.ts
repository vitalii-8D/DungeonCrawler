
declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      faune(x: number, y: number, texture: string, frame?: string | number)
    }
  }
}

enum HealthState {
  IDLE,
  DAMAGE,
  DEAD
}

export default class Faune extends Phaser.Physics.Arcade.Sprite {
  private healthState = HealthState.IDLE
  private damageTime = 0

  private _health = 3

  get health() {
    return this._health
  }

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);

    this.anims.play('faune-idle-down')
  }

  handleDamage(dir: Phaser.Math.Vector2) {
    if (this.healthState === HealthState.DAMAGE) return false
    if (this._health <= 0) return false

    this.setVelocity(dir.x, dir.y)

    this.setTint(0xff0000)

    this.healthState = HealthState.DAMAGE
    this.damageTime = 0

    --this._health

    if (this._health <= 0) {
      // die
      this.healthState = HealthState.DEAD
    }
  }

  protected preUpdate(t: number, dt: number) {
    super.preUpdate(t, dt);

    switch (this.healthState) {
      case HealthState.IDLE:
        break
      case HealthState.DAMAGE:
        this.damageTime+=dt
        if (this.damageTime >= 250) {
          this.healthState = HealthState.IDLE
          this.setTint(0xffffff)
          this.damageTime = 0
        }
        break
      case HealthState.DEAD:
        this.anims.play('faune-idle-down')
        this.setVelocity(0, 0)
        break

    }
  }

  update(cursor: Phaser.Types.Input.Keyboard.CursorKeys) {
    super.update()
    if (!cursor) return false
    if (this.healthState === HealthState.DEAD) return false
    if (this.healthState === HealthState.DAMAGE) {
      // const currentKey = this.anims.currentAnim.key
      // const actionKey = currentKey.split('-').pop()
      //
      // this.anims.play(`faune-idle-${actionKey}`, true)

      return false
    }

    const speed = 150;

    if (cursor.left.isDown) {
      this.setVelocity(-speed, 0)
      // reverse animation
      this.flipX = true;

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
  }
}

Phaser.GameObjects.GameObjectFactory.register('faune', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string, frame?: string | number) {
  let sprite = new Faune(this.scene, x, y, texture, frame)

  this.displayList.add(sprite)
  this.updateList.add(sprite)

  this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

  sprite.body.setSize(sprite.width * 0.5, sprite.height * 0.8, true)

  return sprite
})
