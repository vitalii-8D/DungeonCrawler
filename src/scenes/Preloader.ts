export default class Preloader extends Phaser.Scene {
  constructor() {
    super('preloader');

  }

  preload() {
    // this.load.image('tiles', 'src/assets/dungeon_tilemap.png')
    this.load.image('tiles_ext', 'src/assets/dungeon_tilemap_ext.png')
    this.load.tilemapTiledJSON('dungeon', 'src/levels/level-01.json')

    this.load.atlas('faune', 'src/assets/faune.png', 'src/assets/faune.json')
    this.load.spritesheet('green_lizard', 'src/assets/green_lizard.png', {frameWidth: 16, frameHeight: 28})
  }

  create() {
    this.scene.start('game')
  }

}
