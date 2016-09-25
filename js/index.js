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
import floor from 'lodash/floor'

var gridW = 20,
    gridH = 10,
    tileSide = 16,
    targetX = 19,
    targetY = 5;

var blankGrid = new Grid(gridW, gridH);

function createGridSpriteIndex(grid, tileSide, game) {
  var gridSpriteIndex = {};

  range(grid.width).forEach(function(x) {
    range(grid.height).forEach(function(y) {
      gridSpriteIndex[`${x}x${y}`] = game.add.sprite(x * tileSide, y * tileSide, 'anchor');
    })
  })

  console.log('created gridSpriteIndex', gridSpriteIndex)
  return gridSpriteIndex
}

function redrawGridSprites(grid, gridSpriteIndex, tileSide) {
  range(grid.width).forEach(function(x) {
    range(grid.height).forEach(function(y) {
      var gridSprite = gridSpriteIndex[`${x}x${y}`];

      if(!gridSprite) {
        return;
      }

      if(x == targetX && y == targetY) {
        gridSprite.loadTexture('anchor');
        return;
      }

      var node = grid.getNodeAt(x, y);

      if(!node.walkable) {
        gridSprite.loadTexture('tower');
        return;
      }

      if(node.parent.x < node.x) {
        gridSprite.loadTexture('left');
      }
      else if (node.parent.x > node.x) {
        gridSprite.loadTexture('right');
      }
      else if(node.parent.y < node.y) {
        gridSprite.loadTexture('up');
      }
      else if (node.parent.y > node.y) {
        gridSprite.loadTexture('down');
      }
    })
  })
}

var hackyGlobalGrid;
findPathAsync(targetX, targetY, blankGrid)
  .then(function(initialGrid) {

    hackyGlobalGrid = initialGrid

    var game = new Phaser.Game(
      gridW * tileSide,
      gridH * tileSide,
      Phaser.AUTO,
      'main',
      { render: render, preload: preload, create: create }
    );

    var gridSpriteIndex,
      calculating = false;
      // console.log(game.input.mousePointer.x, game.input.mousePointer.y)

    function create() {
        //  This creates a simple sprite that is using our loaded image and
        //  displays it on-screen
        gridSpriteIndex = createGridSpriteIndex(initialGrid, tileSide, game)
        redrawGridSprites(hackyGlobalGrid, gridSpriteIndex, tileSide)

        game.input.mouse.mouseUpCallback = function() {
          if(calculating) {
            console.log('not yet :P')
            return;
          }

          var inSquare = {
            x: floor(game.input.mousePointer.x / tileSide),
            y: floor(game.input.mousePointer.y / tileSide)
          }

          var clickedNode = hackyGlobalGrid.getNodeAt(
            inSquare.x,
            inSquare.y
          );
          if(!clickedNode) {
            console.log('couldn\'t find the node',
              inSquare.x,
              inSquare.y
            )
            return
          }

          if(!clickedNode.walkable) {
            console.log('already a tower here :P')
            return;
          }

          clickedNode.walkable = false

          calculating = true;
          findPathAsync(targetX, targetY, hackyGlobalGrid)
            .then(function(reworkedGrid) {
              calculating = false
              hackyGlobalGrid = reworkedGrid
              console.log('the new grid', hackyGlobalGrid)
              redrawGridSprites(hackyGlobalGrid, gridSpriteIndex, tileSide)
            })
            .catch(function(err) {
              throw err
            })
        }

    }

    function render() {
      // console.log()
    }

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

  })
  .catch(function(err) {
    throw err
  })
