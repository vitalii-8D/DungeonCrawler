const createLizardAnims = (anims: Phaser.Animations.AnimationManager) => {
  // Lizard anims
  anims.create({
    key: 'lizard-hit',
    frames: [{key: 'green_lizard', frame: 0}]
  })

  anims.create({
    key: 'lizard-idle',
    frames: anims.generateFrameNames('green_lizard', {
      start: 1, end: 4
    }),
    repeat: -1,
    frameRate: 10
  })

  anims.create({
    key: 'lizard-run',
    frames: anims.generateFrameNames('green_lizard', {
      start: 5, end: 8
    }),
    repeat: -1,
    frameRate: 10
  })

}

export {
  createLizardAnims
}
