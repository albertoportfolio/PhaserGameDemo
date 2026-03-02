import Phaser from 'phaser'
import { MainScene } from './scenes/MainScene';
import { MenuScene } from './scenes/Menuscene';
import { GameOverScene } from './scenes/Gameoverscene';
import { VictoryScene } from './scenes/Victoryscene';
import { OptionsScene } from './scenes/Optionsscene';
import { HighscoresScene } from './scenes/Highscoresscene';
import { PauseScene } from './scenes/Pausescene';


export const GAME_WIDTH  = 800
export const GAME_HEIGHT = 600

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width:  GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: '#07090f',
    scene: [MenuScene,MainScene,GameOverScene,VictoryScene,OptionsScene,HighscoresScene,PauseScene],
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
