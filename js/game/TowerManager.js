import towerSettings from '../constants/TowerTypes'
import Tower from './Tower'

export default class TowerManager {
  constructor(opts) {
    var {gameState} = opts

    this.gameState = gameState
    this.towers = {}
    this.spriteGroup = this.gameState.add.group(this.gameState.game.world, 'towers')
  }

  _objectKey(gridX, gridY) {
    return `${gridX}x${gridY}`
  }

  _towerConfig(towerType) {
    let {[towerType]: towerConfig} = towerSettings

    if(!towerConfig) {
      throw new Error(`Unknown tower type: ${towerType}`)
    }

    return towerConfig
  }

  getBuildCost(towerType) {
    let {[towerType]: towerConfig} = towerSettings

    if(!towerConfig) {
      throw new Error(`Unknown tower type: ${towerType}`)
    }

    return towerConfig.cost
  }

  getTowerAt(gridX, gridY) {
    let objectKey = this._objectKey(gridX, gridY)

    if(!this.towers[objectKey]) {
      return null
    }
  }

  buildTowerAt(gridX, gridY, towerType) {
    let towerConfig = this._towerConfig(towerType)

    if( this.getTowerAt(gridX, gridY) ) {
      throw new Error(`A tower already exists at ${gridX}x${gridY}`)
    }

    let sprite = this.spriteGroup.create(
      gridX * this.gameState.tileSide,
      gridY * this.gameState.tileSide,
      'backgroundTiles',
      towerConfig.towerFrame
    )

    let objectKey = this._objectKey(gridX, gridY)

    this.towers[objectKey] = new Tower({
      gameState: this.gameState,
      type: towerType,
      sprite
    })
  }

  fireBullets(creepSpriteGroup) {
    if(creepSpriteGroup.countLiving < 1) {
      return;
    }

    Object.values(this.towers).forEach((tower) => {
      let target = creepSpriteGroup.getClosestTo(tower.sprite)

      if(!target) {
        return
      }

      if(tower.sprite.position.distance(target) > tower.weapon.bulletKillDistance) {
        return
      }

      tower.weapon.fireAtXY(target.centerX, target.centerY)
    })
  }

  collideBullets(creepSpriteGroup) {
    Object.values(this.towers).forEach((tower) => {
      this.gameState.physics.arcade.collide(
        creepSpriteGroup,
        tower.weapon.bullets,
        null,
        (creep, bullet) => {
          creep.damage(bullet._custom_BulletDoesDamage)
          bullet.destroy()
        },
        this.gameState
      );
    })
  }
}
