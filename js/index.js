// so that Object.values and similar es6 stuff works properly
import values from 'object.values'
import keys from 'object.keys'

if(!Object.values) {
  values.shim()
}

if(!Object.keys) {
  keys.shim()
}

import styles from '../css/app.css';
import 'pixi';
import 'phaser';
import 'phaserPlugins/weapon'

if(screen) {
  document.addEventListener("ondeviceready", () => {
    console.log(screen, window.screen)
    // force the screen to landscape orientation if we're running in CORDOVA_BASE
    screen.lockOrientation('landscape');
  })
}

var game = new Phaser.Game(
  1024,
  640,
  Phaser.AUTO,
  ''
);

import Boot from './game_states/Boot'
import Game from './game_states/Game'

game.state.add('Boot', Boot)
game.state.add('Game', Game)
game.state.start('Boot')
