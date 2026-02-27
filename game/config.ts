import Phaser from 'phaser'
import { MainScene } from './scenes/MainScene';


export const GAME_WIDTH  = 800
export const GAME_HEIGHT = 600

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width:  GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: '#07090f',
    scene: [MainScene],
    physics: {
  default: 'arcade',
  arcade: { gravity: { x: 0, y: 300 }, debug: false },  // ← y: 300
},
scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
},
    audio: {
      disableWebAudio: false,
    },
  })
}
