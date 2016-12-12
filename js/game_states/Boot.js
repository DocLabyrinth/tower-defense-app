
export default class Boot {
  init() {
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    this.scale.pageAlignVertically = true;
    this.scale.pageAlignHorizontally = true;
  }

  create() {
    this.state.start('Game')
  }
}
