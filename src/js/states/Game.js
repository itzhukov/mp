import io from 'socket.io-client'

const options = {
	playerID: '',
	playerStep: 3,
	socketAddress: 'http://localhost:3030',
	textSettings: {
		font: "17px Arial",
		fill: "#ffffff",
		align: "center"
	}
}

let PlayersList = {};
let PlayersSprites = {};
let frameTime = 60/1000; // 16ms/ 60hz
let lastTime = 0;
let currTime = Date.now()
let timeToCall = 0;

// (4.22208334636).fixed(n) will return fixed point value to n places, default n = 3
Number.prototype.fixed = function(n) {
	n = n || 3;
	return parseFloat( this.toFixed(n) );
}

//copies a 2d vector like object from one to another
function pos(a) {
		return {
			x:a.x,
			y:a.y
	}
}

// Add a 2d vector with another one and return the resulting vector
function v_add(a, b) {
	return {
		x:(a.x + b.x).fixed(),
		y:(a.y + b.y).fixed()
	}
}

// Subtract a 2d vector with another one and return the resulting vector
function v_sub(a, b) {
	return {
		x:(a.x - b.x).fixed(),
		y:(a.y - b.y).fixed()
	}
}

//Multiply a 2d vector with a scalar value and return the resulting vector
function v_mul_scalar(a, b) {
	return {
		x: (a.x*b).fixed(),
		y:(a.y*b).fixed()
	}
}

//Simple linear interpolation
function lerp(p, n, t) {
		var _t = Number(t);
		_t = ( Math.max( 0, Math.min(1, _t) ) ).fixed();
		return (p + _t * (n - p) ).fixed();
};

//Simple linear interpolation between 2 vectors
function v_lerp(v, tv, t) {
		return {
				x: this.lerp(v.x, tv.x, t),
				y:this.lerp(v.y, tv.y, t)
		};
};

export default class extends Phaser.State {
	init () {
		this.game.stage.disableVisibilityChange = true;
		this.initNetwork();
	}

	preload () {
			this.load.image('player', 'assets/images/player.png');
	}

	create () {
		this.player = new Phaser.Sprite(this, this.world.centerX, this.world.centerY, 'player');
		this.player.anchor.setTo(0.5);
		this.game.add.existing(this.player);

		this.textID = new Phaser.Text(this.game, 0, 0, options.playerID, options.textSettings);
		this.textID.anchor.setTo(0.5, 1);
		this.game.add.existing(this.textID);
	}

	update () {
		this.keyWatcher();
		this.frameWatcher();
		this.textID.text = options.playerID;
		this.textID.position = this.player.position;
		this.checkSprites();
	}

	checkSprites() {

		if (!!options.playerID){
			for(let key in PlayersList){
				let player = PlayersList[key];

				if (!PlayersSprites[key] && key != options.playerID){
					PlayersSprites[key] = new Phaser.Sprite(this, player.x, player.y, 'player');
					PlayersSprites[key].anchor.setTo(0.5);
					this.game.add.existing( PlayersSprites[key] );
					console.log('ADD SRPITE');
				} else {
					if (PlayersSprites[key]){
						PlayersSprites[key].x =player.x;
						PlayersSprites[key].y =player.y;
						
					}
				}
			}
		}

	}

	tick() {
		this.socket.emit('clientUpdate', {
			playerID: options.playerID,
			x: this.player.x,
			y: this.player.y
		});

		lastTime = currTime + timeToCall;
	}

	frameWatcher() {
		currTime = Date.now(),
		timeToCall = Math.max( 0, frameTime - ( currTime - lastTime ) );
		
		if (timeToCall == 0) this.tick()
	}

	initNetwork() {
		this.socket = io.connect(options.socketAddress);
		this.socket.on('connected', this.onConnected.bind(this) );
		this.socket.on('serverUpdate', this.onServerUpdate.bind(this) );
		this.socket.on('anotherConnected', this.onAnotherConnected.bind(this) );
		this.socket.on('disconnected', this.onDisconnected.bind(this) );
		this.socket.on('anotherDisconnected', this.onAnotherDisconnected.bind(this) );
	}

	onConnected(data) {
		console.log('-> connected', data);

		options.playerID = data.playerID;
	}

	onServerUpdate(data) {
		// console.log('-> onServerUpdate', data);

		PlayersList = data.PlayersList;
	}

	onAnotherConnected(data) {
		console.log('-> anotherConnected', data);
	}

	onDisconnected(data) {
		console.log('-> disconnected', data);
	}

	onAnotherDisconnected(data) {
		console.log('-> anotherDisconnected', data);
		let playerID = data.playerID;

		if ( PlayersSprites[playerID] ){
			PlayersSprites[playerID].destroy();
			delete PlayersSprites[playerID];
		}
	}

	keyWatcher() {
		let [up, down, left, right] = [
			this.game.input.keyboard.isDown(Phaser.Keyboard.UP),
			this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN),
			this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT),
			this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT),
		];

		if (up){
			this.player.y -= options.playerStep;
		} else if(down){
			this.player.y += options.playerStep;
		}

		if (left){
			this.player.x -= options.playerStep;
		} else if(right){
			this.player.x += options.playerStep;
		}
	}
}
