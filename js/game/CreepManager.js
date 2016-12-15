import creepSettings from '../constants/CreepTypes'
import Creep from './Creep'

export default class CreepManager {
  constructor({gameState}) {
    this.gameState = gameState

    this.spriteGroup = this.gameState.add.group(
      this.gameState.game.world,
      'creeps',
      false,
      true,
      Phaser.Physics.ARCADE
    )

    this.creeps = []

    this.spawnCreepTicker()
  }

  spawnCreepTicker() {
    this.spawnCreep('soldier')

    if(this.gameState.shutdown == true) {
      // TODO: also stop when lives run out and the game is over
      return;
    }

    let nextSpawnDelay = Math.ceil(Math.random() * (3 - 1) + 1) * 1000

    setTimeout(() => this.spawnCreepTicker(), nextSpawnDelay)
  }

  spawnCreep(type) {
    let {[type]: creepConfig} = creepSettings

    if(!creepConfig) {
      throw new Error(`unknown creep type: ${type}`)
    }

    let {spawnPoint, tileSide} = this.gameState

    let sprite = this.spriteGroup.create(
      spawnPoint.x * tileSide,
      spawnPoint.y * tileSide,
      'backgroundTiles',
      creepConfig.creepFrame
    )

    sprite.events.onKilled.add(() => {
      if(sprite.health <= 0) {
        this.gameState.alterCoins(creepConfig.reward)
      }
    })

    this.creeps.push(new Creep({sprite, type, gameState: this.gameState}))
  }

  moveCreeps() {
    // filter out creep objects whose child sprite has already been killed
    this.creeps = this.creeps.filter((creep) => creep.sprite.alive == true)
    this.creeps.forEach((creep) => creep.move())
  }
}
