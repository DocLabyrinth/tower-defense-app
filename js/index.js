// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './containers/App';
//
// ReactDOM.render(<App />, document.getElementById('main'));

import 'pixi';
import 'phaser';

import Game from './game_states/Game'

var game = new Phaser.Game(
  1024,
  768,
  Phaser.AUTO,
  'main'
);

console.log('game state', Game)
game.state.add('Game', Game)
game.state.start('Game')
