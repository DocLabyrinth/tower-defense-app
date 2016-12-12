import towerSettings from '../constants/TowerTypes'

export default class Tower {
  constructor({gameState, type, sprite, upgradeLevel = 0}) {
    let {[type]: towerInitOpts} = towerSettings

    this.gameState = gameState
    this.type = type
    this.sprite = sprite
    this.upgradeLevel = 0

    let weapon = this.gameState.add.weapon(-1, 'backgroundTiles', towerInitOpts.bulletFrame)

    weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE
    weapon.bulletSpeed = towerInitOpts.bulletSpeed
    weapon.trackRotation = false;
    weapon.fireRate = towerInitOpts.fireRate
    weapon.bulletRotateToVelocity = false;
    weapon.bulletKillDistance = towerInitOpts.range
    weapon.onFire.add((bullet, weapon) => {
      bullet._custom_BulletDoesDamage = towerInitOpts.damage
    })

    weapon.trackSprite(
      this.sprite,
      Math.floor(this.sprite.width/2),
      Math.floor(this.sprite.height/2)
    )

    weapon.setBulletBodyOffset(16, 16, 24,24)

    this.weapon = weapon
  }
}
