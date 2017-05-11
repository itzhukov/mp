export default class extends Phaser.State {
  init () {}

  preload () {
      this.load.image('player', 'assets/images/player.png');

  }

  create () {
    this.currentPos = {
      x: null,
      y: null
    }

    this.player = new Phaser.Sprite(this, this.world.centerX, this.world.centerY, 'player');
    this.player.anchor.setTo(0.5);
    this.game.add.existing(this.player);

    this.labelId = this.game.add.text(0, 0, window.clientId, {
      font: "17px Arial",
      fill: "#ffffff",
      align: "center"
    });
    this.labelId.anchor.setTo(0.5, 1);

  }

  update () {
    let input = this.game.input;
    let newPosition = {
      x: input.x,
      y: input.y
    }

    // console.info(window.allPlayers);

    if (this.currentPos.x != newPosition.x || this.currentPos.y != newPosition.y){

      this.labelId.x = this.currentPos.x = this.player.x = newPosition.x;
      this.labelId.y = this.currentPos.y = this.player.y = newPosition.y;
      this.labelId.text = window.clientId;

      window.socket.emit('newPosition', {
        clientId: window.game.clientId,
        position: newPosition
      });
    }

  }
}
