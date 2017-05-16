const app = require('http').createServer(httpHandler)
const io = require('socket.io')(app);
const fs = require('fs');

app.listen(3030);

let playerID = null;
let PlayersList = {};

let frameTime = 45; //  45ms, 22hz
let lastTime = 0;
let currTime = Date.now()
let timeToCall = 0;
let connect = null;

io.on('connection', onConnected);

setTimeout(frameWatcher, frameTime);


function onConnected(socket){
		console.log('-> Player connected', socket.id);

		connect = socket;
		playerID = socket.id;

		if (playerID){
			PlayersList[playerID] = {
				playerID: playerID,
				x: 0,
				y: 0
			};

			socket.emit('connected', { playerID });
			socket.broadcast.emit('anotherConnected', { playerID });

			printPlayersList();

			socket.on('disconnect', onDisconnect.bind(this, socket) );
			socket.on('clientUpdate', onClientUpdate.bind(this, socket) );
		}
}

function onClientUpdate(socket, data){
	// console.log('-> ClientUpdate', data);

	let playerID = data.playerID;
	let x = data.x;
	let y = data.y;

	if (playerID){
		if ( !PlayersList[playerID] ){
			PlayersList[playerID] = {
				playerID: playerID,
				x: 0,
				y: 0
			};
		}

		PlayersList[playerID].x = x;
		PlayersList[playerID].y = y;
	}
}

function onDisconnect(socket){
	if ( playerID && PlayersList[playerID] ){
		console.log('-> Player disconnected', playerID);

		delete PlayersList[playerID]

		socket.emit('disconnected', { playerID });
		socket.broadcast.emit('anotherDisconnected', { playerID });

		printPlayersList();
	}
}

function tick() {
		// console.log('-> tick', currTime);

		if (connect){
			connect.emit('serverUpdate', {
				PlayersList
			});

			connect.broadcast.emit('serverUpdate', {
				PlayersList
			});
		}

		lastTime = currTime + timeToCall;

		setTimeout(frameWatcher, frameTime);
}

function frameWatcher() {
	currTime = Date.now(),
	timeToCall = Math.max( 0, frameTime - ( currTime - lastTime ) );
	
	if (timeToCall == 0) tick();
}

function printPlayersList(){
	console.log('------------------PlayersList----------------');
	
	for(let key in PlayersList){
		console.log(PlayersList[key]);
	}

	console.log('--------------------------------------------');
}

function httpHandler (req, res) {
	res.writeHead(200);
	res.end('Server is up!');
}
