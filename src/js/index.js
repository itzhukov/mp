import BootState from './states/Boot'
import GameState from './states/Game'
import io from 'socket.io-client'
require('../sass/default.sass')

class Game extends Phaser.Game {
  constructor () {
    const docElement = document.documentElement
    const width = docElement.clientWidth > 800 ? 800 : docElement.clientWidth
    const height = docElement.clientHeight > 300 ? 300 : docElement.clientHeight

    super(width, height, Phaser.AUTO, 'root', null);

    window.socket = io.connect('http://localhost:3030');
    window.clientId = 'id';

    window.socket.on('connected', (data) => {
        console.info(data.allPlayers);
        window.clientId = data.clientId;
        window.allPlayers = data.allPlayers;
    });

    window.socket.on('updatePlayers', (data) => {
        // console.info(data.allPlayers);
        window.allPlayers = data.allPlayers;
    });

    this.state.add('Boot', BootState, false)
    this.state.add('Game', GameState, false)

    this.state.start('Boot')
  }
}

window.game = new Game()
