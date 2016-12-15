import creepSettings from '../constants/CreepTypes'

export default class Creep {
  constructor({sprite, type, gameState}) {
    let {[type]: creepConfig} = creepSettings

    if(!creepConfig) {
      throw new Error(`unknown creep type: ${type}`)
    }

    this.gameState = gameState

    this.sprite = sprite
    this.speed = creepConfig.speed

    this.moveTarget = null

    this.sprite.health = creepConfig.health
    this.sprite.body.setSize(...creepConfig.collisionBody)

    // if this isn't set the creep goes flying away when a bullet hits it :(
    this.sprite.body.immovable = true
  }

  assignMoveTarget() {
    let creepGridPos = this.gameState.getGridSquare(
      this.sprite.position.x,
      this.sprite.position.y
    )

    let currentNode = this.gameState.grid.getNodeAt(
      creepGridPos.x,
      creepGridPos.y
    )

    if(
      currentNode.x == this.gameState.exitPoint.x &&
      currentNode.y == this.gameState.exitPoint.y
    ) {
      // next target is the exit point and has no parent
      this.moveTarget = {x: currentNode.x, y: currentNode.y}
      return
    }


    this.moveTarget = {
      x: currentNode.parent.x,
      y: currentNode.parent.y
    }
  }

  move() {
    let destPoint = this._refreshDestPoint()

    if(this.sprite.position.distance(destPoint) < this.speed) {
      // if the sprite is within one tick of movement from the
      // destination, move it there and recalculate
      this.sprite.position = destPoint

      if(
        this.moveTarget.x == this.gameState.exitPoint.x &&
        this.moveTarget.y == this.gameState.exitPoint.y
      ) {
        // the creep reached the endpoint
        this.sprite.kill()
      }
      else {
        this.assignMoveTarget()
      }

      return
    }

    let newPoint = destPoint
      .subtract(this.sprite.position.x, this.sprite.position.y)
      .normalize()
      .multiply(this.speed, this.speed)

    this.sprite.position.add(newPoint.x, newPoint.y, this.sprite.position)
  }

  _refreshDestPoint() {
    if(!this.moveTarget) {
      this.assignMoveTarget()
    }

    let destNode = this.gameState.grid.getNodeAt(
      this.moveTarget.x,
      this.moveTarget.y
    )

    if(!destNode.walkable) {
      this.assignMoveTarget()
      destNode = this.gameState.grid.getNodeAt(
        this.moveTarget.x,
        this.moveTarget.y
      )
    }

    return new Phaser.Point(
      destNode.x * this.gameState.tileSide,
      destNode.y * this.gameState.tileSide
    )
  }
}
