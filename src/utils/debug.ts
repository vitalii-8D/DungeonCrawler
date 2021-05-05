import Phaser from 'phaser'

const debugDraw = (scene, layer) => {
  // Adding debugging
  const debugGraphic = scene.add.graphics().setAlpha(0.7)
  layer.renderDebug(debugGraphic, {
    tileColor: null,
    collidingTileColor: new Phaser.Display.Color(243, 234, 45, 255),
    faceColor: new Phaser.Display.Color(40, 39, 37, 255)
  })
}

export {
  debugDraw
}
