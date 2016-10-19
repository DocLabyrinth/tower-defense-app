import Grid from '../vendor/pathfinding/Grid'
import findPathAsync from '../utils/breadth-first'
import * as moneyActions from '../actions/money'
import * as towerActions from '../actions/towers'
import * as TowerTypes from '../constants/TowerTypes';
import configureStore from '../store/configureStore';
import range from 'lodash/range'
import floor from 'lodash/floor'

export default class Game {
  constructor(game) {
    //	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    // this.game;		//	a reference to the currently running game
    // this.add;		//	used to add sprites, text, groups, etc
    // this.camera;	//	a reference to the game camera
    // this.cache;		//	the game cache
    // this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    // this.load;		//	for preloading assets
    // this.math;		//	lots of useful common math operations
    // this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    // this.stage;		//	the game stage
    // this.time;		//	the clock
    // this.tweens;	//	the tween manager
    // this.world;		//	the game world
    // this.particles;	//	the particle manager
    // this.physics;	//	the physics manager
    // this.rnd;		//	the repeatable random number generator

    this.store = configureStore();

    this.gridW = 20
    this.gridH = 10
    this.tileSide = 64

    this.spawnPoint = {
      x: 0,
      y: floor(this.gridH/2)
    }

    this.exitPoint = {
      x: 19,
      y: floor(this.gridH/2)
    }

    this.grid = new Grid(this.gridW, this.gridH)

    this.initialised = false;
  }

  preload() {
    // this.load.image('backgroundTiles', 'images/towerDefense_tilesheet.png');
    this.load.spritesheet(
      'backgroundTiles',
      'images/towerDefense_tilesheet.png',
      this.tileSide,
      this.tileSide,
      49
    );
  }

  create() {
    this.createInitialBackground()
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    this.initPromise = findPathAsync(this.exitPoint.x, this.exitPoint.y, this.grid)
    this.initPromise.then((initialGrid) => {
      this.initialised = true
      this.input.onDown.add(this.clickHandler, this);
    })
  }

  clickHandler(pointer) {
    const {positionDown: {x: clickX, y: clickY}} = pointer
    const gridPos = this.getGridSquare(clickX, clickY)
    const action = towerActions.buildTower(
      TowerTypes.DEFAULT_TOWER_TYPE,
      gridPos
    )

    try {
      this.store.dispatch(action)
    }
    catch(e) {
      console.log('failed to build tower', e)
      return
    }

    var tower = this.add.sprite(
      gridPos.x * this.tileSide,
      gridPos.y * this.tileSide,
      'backgroundTiles'
    )

    tower.frame = 22
  }

  drawLine(canvas, startX, startY, endX, endY, colour = '#000000', thickness = 1) {
    canvas.beginFill(colour);
    canvas.lineStyle(thickness, colour, 1);
    canvas.moveTo(startX, startY);
    canvas.lineTo(endX, endY);
    canvas.endFill();
  }

  getGridSquare(x, y) {
    return {
      x: floor(x/this.tileSide),
      y: floor(y/this.tileSide)
    }
  }

  createInitialBackground() {
    this.game.stage.backgroundColor = "#000000"

    let gridRealW = this.gridW * this.tileSide,
      gridRealH = this.gridH * this.tileSide,
      tileSprite = this.make.sprite(0, 0, 'backgroundTiles'),
      gridGraphics = this.game.make.graphics(this.gridRealW, this.gridRealH)

    // the default background is generic green grass
    tileSprite.frame = 4

    this.backgroundTexture = this.game.add.renderTexture(
      gridRealW,
      gridRealH,
      'backgroundTexture'
    );

    range(this.grid.width).forEach((x) => {
      range(this.grid.height).forEach((y) => {
        let tileX = x * this.tileSide
        let tileY = y * this.tileSide

        // horizontal gridline
        this.drawLine(gridGraphics, 0, tileY, this.game.width, tileY)

        // vertical gridline
        this.drawLine(gridGraphics, tileX, 0, tileX, this.game.height)

        this.backgroundTexture.renderXY(
          tileSprite,
          tileX,
          tileY
        );
      })
    })

    this.backgroundTexture.renderXY(
      gridGraphics,
      0,
      0
    );

    this.game.add.sprite(0, 0, this.backgroundTexture);
  }
}

// function createGridSpriteIndex(grid, tileSide, game) {
//   var gridSpriteIndex = {};
//
//   range(grid.width).forEach(function(x) {
//     range(grid.height).forEach(function(y) {
//       gridSpriteIndex[`${x}x${y}`] = game.add.sprite(x * tileSide, y * tileSide, 'anchor');
//     })
//   })
//
//   console.log('created gridSpriteIndex', gridSpriteIndex)
//   return gridSpriteIndex
// }
//
// function redrawGridSprites(grid, gridSpriteIndex, tileSide) {
//   range(grid.width).forEach(function(x) {
//     range(grid.height).forEach(function(y) {
//       var gridSprite = gridSpriteIndex[`${x}x${y}`];
//
//       if(!gridSprite) {
//         return;
//       }
//
//       if(x == targetX && y == targetY) {
//         gridSprite.loadTexture('anchor');
//         return;
//       }
//
//       var node = grid.getNodeAt(x, y);
//
//       if(!node.walkable) {
//         gridSprite.loadTexture('tower');
//         return;
//       }
//
//       if(node.parent.x < node.x) {
//         gridSprite.loadTexture('left');
//       }
//       else if (node.parent.x > node.x) {
//         gridSprite.loadTexture('right');
//       }
//       else if(node.parent.y < node.y) {
//         gridSprite.loadTexture('up');
//       }
//       else if (node.parent.y > node.y) {
//         gridSprite.loadTexture('down');
//       }
//     })
//   })
// }
//
// var hackyGlobalGrid;
// findPathAsync(targetX, targetY, blankGrid)
//   .then(function(initialGrid) {
//
//     hackyGlobalGrid = initialGrid
//
//     var game = new Phaser.Game(
//       gridW * tileSide,
//       gridH * tileSide,
//       Phaser.AUTO,
//       'main',
//       { render: render, preload: preload, create: create }
//     );
//
//     var gridSpriteIndex,
//       calculating = false;
//       // console.log(game.input.mousePointer.x, game.input.mousePointer.y)
//
//     function create() {
//         //  This creates a simple sprite that is using our loaded image and
//         //  displays it on-screen
//         gridSpriteIndex = createGridSpriteIndex(initialGrid, tileSide, game)
//         redrawGridSprites(hackyGlobalGrid, gridSpriteIndex, tileSide)
//
//         game.input.mouse.mouseUpCallback = function() {
//           if(calculating) {
//             console.log('not yet :P')
//             return;
//           }
//
//           var inSquare = {
//             x: floor(game.input.mousePointer.x / tileSide),
//             y: floor(game.input.mousePointer.y / tileSide)
//           }
//
//           var clickedNode = hackyGlobalGrid.getNodeAt(
//             inSquare.x,
//             inSquare.y
//           );
//
//           if(!clickedNode) {
//             console.log('couldn\'t find the node',
//               inSquare.x,
//               inSquare.y
//             )
//             return
//           }
//
//           if(!clickedNode.walkable) {
//             console.log('already a tower here :P')
//             return;
//           }
//
//           clickedNode.walkable = false
//
//           calculating = true;
//           findPathAsync(targetX, targetY, hackyGlobalGrid)
//             .then(function(reworkedGrid) {
//               calculating = false
//               hackyGlobalGrid = reworkedGrid
//               console.log('the new grid', hackyGlobalGrid)
//               redrawGridSprites(hackyGlobalGrid, gridSpriteIndex, tileSide)
//             })
//             .catch(function(err) {
//               throw err
//             })
//         }
//
//     }
//
//     function render() {
//       // console.log()
//     }
//
//     function preload() {
//
//         //  You can fill the preloader with as many assets as your game requires
//
//         //  Here we are loading an image. The first parameter is the unique
//         //  string by which we'll identify the image later in our code.
//
//         //  The second parameter is the URL of the image (relative)
//         game.load.image('up', 'images/arrow_up.png');
//         game.load.image('down', 'images/arrow_down.png');
//         game.load.image('left', 'images/arrow_left.png');
//         game.load.image('right', 'images/arrow_right.png');
//         game.load.image('anchor', 'images/anchor.png');
//         game.load.image('unreachable', 'images/cross.png');
//         game.load.image('tower', 'images/emoticon_evilgrin.png');
//     }
//
//   })
//   .catch(function(err) {
//     throw err
//   })
