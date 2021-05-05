import 'phaser'
import Game from "~/scenes/Game";
import Preloader from "~/scenes/Preloader";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  parent: 'phaser',
  // canvasStyle: 'image-rendering: crisp-edges;',
  width: 600,
  height: 450,
  scale: {
    zoom: 2
    // mode: Phaser.Scale.FIT,
    // autoCenter: Phaser.Scale.CENTER_BOTH,
    // width: 400,
    // height: 250
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 0},
      debug: true
    },
  },
  scene: [Preloader, Game]
}

const game = new Phaser.Game(config)
