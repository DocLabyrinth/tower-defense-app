// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './containers/App';
//
// ReactDOM.render(<App />, document.getElementById('main'));

import 'pixi';
import 'phaser';
import Grid from './vendor/pathfinding/Grid'
import {findPathAsync} from './utils/breadth-first'
import range from 'lodash/range'

console.log(findPathAsync)

var gridW = 20,
    gridH = 10,
    tileSide = 16,
    targetX = 19,
    targetY = 5;

var blankGrid = new Grid(gridW, gridH);
var promise = findPathAsync(targetX, targetY, blankGrid)
  .then(function(grid) {
    console.log('the grid with parent info injected', grid)

    var game = new Phaser.Game(gridW * tileSide, gridH * tileSide, Phaser.AUTO, 'main', { preload: preload, create: create });

    function preload() {

        //  You can fill the preloader with as many assets as your game requires

        //  Here we are loading an image. The first parameter is the unique
        //  string by which we'll identify the image later in our code.

        //  The second parameter is the URL of the image (relative)
        game.load.image('up', 'images/arrow_up.png');
        game.load.image('down', 'images/arrow_down.png');
        game.load.image('left', 'images/arrow_left.png');
        game.load.image('right', 'images/arrow_right.png');
        game.load.image('anchor', 'images/anchor.png');
        game.load.image('unreachable', 'images/cross.png');
        game.load.image('tower', 'images/emoticon_evilgrin.png');
    }

    function create() {
        //  This creates a simple sprite that is using our loaded image and
        //  displays it on-screen

        range(gridW).forEach(function(x) {
          range(gridH).forEach(function(y) {
            if(x == targetX && y == targetY) {
              game.add.sprite(x * tileSide, y * tileSide, 'anchor');
              return;
            }

            var node = grid.getNodeAt(x, y);

            if(!node.walkable) {
              game.add.sprite(x * tileSide, y * tileSide, 'tower');
              return;
            }


            if(node.parent.x < node.x) {
              game.add.sprite(x * tileSide, y * tileSide, 'left');
            }
            else if (node.parent.x > node.x) {
              game.add.sprite(x * tileSide, y * tileSide, 'right');
            }
            else if(node.parent.y < node.y) {
              game.add.sprite(x * tileSide, y * tileSide, 'up');
            }
            else if (node.parent.y > node.y) {
              game.add.sprite(x * tileSide, y * tileSide, 'down');
            }
          })
        })
    }
  })
  .catch(function(err) {
    throw err
  })
