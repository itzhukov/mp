import BootState from './states/Boot'
import GameState from './states/Game'

require('../sass/default.sass')

class Game extends Phaser.Game {
  constructor () {
	const docElement = document.documentElement
	const width = docElement.clientWidth > 800 ? 800 : docElement.clientWidth
	const height = docElement.clientHeight > 300 ? 300 : docElement.clientHeight

	super(width, height, Phaser.AUTO, 'root', null);
	
	this.state.add('Boot', BootState, false)
	this.state.add('Game', GameState, false)

	this.state.start('Boot')
  }
}

window.game = new Game()
