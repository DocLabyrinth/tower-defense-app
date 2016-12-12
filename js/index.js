// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './containers/App';
//
// ReactDOM.render(<App />, document.getElementById('main'));

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
