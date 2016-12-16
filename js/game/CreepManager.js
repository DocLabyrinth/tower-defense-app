import creepSettings from '../constants/CreepTypes'
import waves from '../constants/Waves'
import Creep from './Creep'

import sample from 'lodash/sample'
import cloneDeep from 'lodash/cloneDeep'
import times from 'lodash/times'

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

    this.waveCounter = -1
    this.waveDuration = Phaser.Timer.SECOND * 40
    this.waveTimeGap = Phaser.Timer.SECOND * 1
    this.currentWave = null
    this.creepSpawnQueue = []

    this.creeps = []

    this.gameState.time.events.add(this.waveTimeGap, () => {
      this.startNextWave()
    }, this);
  }

  startNextWave() {
    this.waveCounter += 1

    if(!waves[this.waveCounter]) {
      console.log(`no more waves are defined, counter is: ${this.waveCounter}`)
      return
    }

    this.currentWave = waves[this.waveCounter]

    console.log(`Starting wave ${this.waveCounter + 1}: ${this.currentWave.name}`, this.currentWave)
    this.gameState.waveLabel.text = `Wave ${this.waveCounter + 1}: ${this.currentWave.name}`

    // convert the wave definition into objects in the creep spawn queue
    let totalWaveCreeps = 0

    this.currentWave.creeps.forEach((creepObj) => {
      totalWaveCreeps += creepObj.count

      times(creepObj.count, (_) => {
        this.creepSpawnQueue.push({type: creepObj.type})
      })
    })

    // distribute the creep spawn times evenly over the wave duration
    this.gameState.time.events.repeat(
      this.waveDuration / totalWaveCreeps,
      totalWaveCreeps,
      this.spawnCreepTicker,
      this
    );
  }

  spawnCreepTicker() {
    if(this.gameState.shutdown == true) {
      // TODO: also stop when lives run out and the game is over
      return;
    }

    let nextCreep = this.creepSpawnQueue.pop()

    if(!nextCreep) {
      return
    }

    this.spawnCreep(nextCreep.type)

    if(this.creepSpawnQueue.length < 1) {
      // wave is finished, start the next one after the configured delay
      console.log('out of creeps, next wave after', this.waveTimeGap)
      this.gameState.time.events.add(this.waveTimeGap, () => {
        this.startNextWave()
      }, this);
    }
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
