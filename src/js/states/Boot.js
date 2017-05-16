export default class extends Phaser.State {
  init () {
    this.stage.backgroundColor = '#000000'
    this.game.stage.disableVisibilityChange = true;
  }

  preload () { }

  render () {
      this.state.start('Game')
  }
}
