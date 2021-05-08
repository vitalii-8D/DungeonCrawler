import {sceneEvents} from "~/events/EventsCenter";

export default class GameUI extends Phaser.Scene {
  private hearts!: Phaser.GameObjects.Group

  constructor() {
    super({key: 'game-ui'});
  }

  create() {
    this.hearts = this.add.group({
      classType: Phaser.GameObjects.Image
    })

    this.hearts.createMultiple({
      key: 'ui-heart-full',
      setScale: {x: 2, y: 2},
      setXY: {x: 18, y: 18, stepX: 30},
      quantity: 3,
    })

    sceneEvents.on('player-health-changed', this.handlePlayerHealthChanged, this)
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      sceneEvents.off('player-health-changed', this.handlePlayerHealthChanged, this)
    })
  }

  private handlePlayerHealthChanged(health: number) {

    this.hearts.children.each((go, ind) => {
      const heart = go as Phaser.GameObjects.Image
      if (ind < health) {
        heart.setTexture('ui-heart-full')
      } else {
        heart.setTexture('ui-heart-empty')
      }

    })
  }

}
