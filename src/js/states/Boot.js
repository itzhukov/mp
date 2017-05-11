export default class extends Phaser.State {
  init () {
    this.stage.backgroundColor = '#000000'
  }

  preload () { }

  render () {
      this.state.start('Game')
  }
}
