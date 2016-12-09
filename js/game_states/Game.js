import Grid from '../vendor/pathfinding/Grid'
import findPathAsync from '../utils/breadth-first'
import * as moneyActions from '../actions/money'
import * as towerActions from '../actions/towers'
import * as creepActions from '../actions/creeps'
import * as GameObjectStates from '../constants/GameObjectStates'
import * as TowerTypes from '../constants/TowerTypes'
import configureStore from '../store/configureStore'
import {towerObjKey} from '../reducers/towers'
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

    this.store = configureStore()


    this.gridW = 16
    this.gridH = 10
    this.tileSide = 64

    this.spawnPoint = {
      x: 0,
      y: floor(this.gridH/2)
    }

    this.exitPoint = {
      x: 15,
      y: floor(this.gridH/2)
    }

    this.grid = new Grid(this.gridW, this.gridH)

    this.initialised = false;
    this.isCalculatingPath = false;
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

    this.towers = this.add.group(this.game.world, 'towers')

    this.creeps = this.add.group(
      this.game.world,
      'creeps',
      false,
      true,
      Phaser.Physics.ARCADE
    )

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    this.initPromise = findPathAsync(this.exitPoint.x, this.exitPoint.y, this.grid)
    this.initPromise.then((initialGrid) => {
      this.initialised = true
      this.input.onDown.add(this.clickHandler, this);
      this.grid = initialGrid
    })

    // debug - spawn a creep when a key is pressed
    this.spawnKeyBind = this.input.keyboard.addKey(Phaser.Keyboard.ONE);
    this.spawnKeyBind.onDown.add(this.spawnCreep, this);

    setTimeout(() => this.spawnCreepTicker(), 5000)
  }

  shutdown() {
    this.shutdown = true
  }

  update() {
    this.collideBullets()
    this.moveCreeps()
    this.fireBullets()
  }

  collideBullets() {
    this.towers.forEach((tower) => {
      this.physics.arcade.collide(
        this.creeps,
        tower.weapon.bullets,
        null,
        this.handleBulletCollision,
        this
      );
    })
  }

  handleBulletCollision(creep, bullet) {
    creep.damage(bullet._custom_BulletDoesDamage)
    bullet.destroy()
  }

  moveCreeps() {
    let dbgBaseSpeed = 1

    this.creeps.forEachAlive((creepSprite) => {
      if(!creepSprite.destGridSquare) {
        this.assignNewCreepMoveTarget(creepSprite)
      }

      let destNode = this.grid.getNodeAt(
        creepSprite.destGridSquare.x,
        creepSprite.destGridSquare.y
      )

      if(!destNode.walkable) {
        this.assignNewCreepMoveTarget(creepSprite)
        destNode = this.grid.getNodeAt(
          creepSprite.destGridSquare.x,
          creepSprite.destGridSquare.y
        )
      }

      let destPoint = new Phaser.Point(
        destNode.x * this.tileSide,
        destNode.y * this.tileSide
      )

      if(creepSprite.position.distance(destPoint) < dbgBaseSpeed) {
        // if the sprite is within one tick of movement from the
        // destination, move it there and recalculate
        creepSprite.position = destPoint

        if(
          destNode.x == this.exitPoint.x &&
          destNode.y == this.exitPoint.y
        ) {
          // the creep reached the endpoint
          creepSprite.kill()
        }
        else {
          this.assignNewCreepMoveTarget(creepSprite)
        }
        return
      }

      let newPoint = destPoint
        .subtract(creepSprite.position.x, creepSprite.position.y)
        .normalize()
        .multiply(dbgBaseSpeed, dbgBaseSpeed)

      creepSprite.position.add(newPoint.x, newPoint.y, creepSprite.position)
    })
  }

  fireBullets() {
    if(this.creeps.countLiving < 1) {
      return;
    }

    this.towers.forEach((tower) => {
      let target = this.creeps.getClosestTo(tower)

      if(!target) {
        return
      }

      if(tower.position.distance(target) > tower.weapon.bulletKillDistance) {
        return
      }

      tower.weapon.fireAtXY(target.centerX, target.centerY)
    })
  }

  assignNewCreepMoveTarget(creep) {
    let creepGridPos = this.getGridSquare(
      creep.position.x,
      creep.position.y
    )

    let currentNode = this.grid.getNodeAt(
      creepGridPos.x,
      creepGridPos.y
    )

    if(
      currentNode.x == this.exitPoint.x &&
      currentNode.y == this.exitPoint.y
    ) {
      // next target is the exit point and has no parent
      creep.destGridSquare = {x: currentNode.x, y: currentNode.y}
      return
    }

    creep.destGridSquare = {
      x: currentNode.parent.x,
      y: currentNode.parent.y
    }
  }

  spawnCreepTicker() {
    this.spawnCreep()

    if(this.shutdown == true) {
      // TODO: also stop when lives run out and the game is over
      return;
    }

    let nextSpawnDelay = Math.ceil(Math.random() * (3 - 1) + 1) * 1000


    setTimeout(() => this.spawnCreepTicker(), nextSpawnDelay)
  }

  spawnCreep() {
    let creep = this.creeps.create(
      this.spawnPoint.x * this.tileSide,
      this.spawnPoint.y * this.tileSide,
      // (this.exitPoint.x-2) * this.tileSide,
      // this.exitPoint.y * this.tileSide,
      'backgroundTiles',
      32
    )
    creep.health = 100
    creep.body.setSize(16,28,24,20)

    // if this isn't set the creep goes flying away when a bullet hits it :(
    creep.body.immovable = true
  }

  clickHandler(pointer) {
    const {positionDown: {x: clickX, y: clickY}} = pointer
    const gridPos = this.getGridSquare(clickX, clickY)

    let gridSquare = this.grid.getNodeAt(gridPos.x, gridPos.y)

    if(gridPos.x >= this.gridW || gridPos.y >= this.gridH) {
      // click was outside the game area
      return
    }

    if(gridPos.x == this.spawnPoint.x && gridPos.y == this.spawnPoint.y) {
      console.log('cant build on the spawn point')
      return
    }

    if(gridPos.x == this.exitPoint.x && gridPos.y == this.exitPoint.y) {
      console.log('cant build on the exit point')
      return
    }

    if(this.isCalculatingPath) {
      // an existing path calculation is already in progress
      return
    }

    if(!gridSquare.walkable) {
      console.log('there is already a tower here')
      // TODO: select the tower when it's clicked
      return
    }

    this.isCalculatingPath = true

    // check if building a tower here would block the path to the exit
    let blockTestGrid = this.grid.clone()
    blockTestGrid.setWalkableAt(gridPos.x, gridPos.y, false)

    findPathAsync(this.exitPoint.x, this.exitPoint.y, blockTestGrid).then((newGrid) => {
      this.isCalculatingPath = false

      let startNode = newGrid.getNodeAt(this.spawnPoint.x, this.spawnPoint.y)

      if(!startNode.opened) {
        console.log('this tower would block the path, not building it :P')
        return
      }

      this.buildTower(gridPos)

      // update the pathfinding grid once everything is finished
      this.grid = newGrid
    })
  }

  buildTower(gridPos) {
    let newSprite = this.towers.create(
      gridPos.x * this.tileSide,
      gridPos.y * this.tileSide,
      'backgroundTiles',
      22
    )

    let weapon = this.add.weapon(-1, 'backgroundTiles', 44)

    weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE
		weapon.bulletSpeed = 800
		weapon.trackRotation = false;
		weapon.fireRate = 1000;
		weapon.bulletRotateToVelocity = false;
    weapon.bulletKillDistance = 150
    weapon.onFire.add((bullet, weapon) => bullet._custom_BulletDoesDamage = 10)

    weapon.trackSprite(
      newSprite,
      Math.floor(newSprite.width/2),
      Math.floor(newSprite.height/2)
    )

    weapon.setBulletBodyOffset(16, 16, 24,24)

    newSprite.weapon = weapon
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
      x: x == 0 ? 0 : Math.floor(x/this.tileSide),
      y: y == 0 ? 0 : Math.floor(y/this.tileSide)
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
