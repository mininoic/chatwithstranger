var uuid = require('node-uuid');
var rooms = [];
var connectCounter = 0;

module.exports = function(app,io){
	// Initialize a new socket.io application, named 'chat'
	app.get('/', function(req,res){

		// Render the chant.html view
		res.render('chat');
	});

	var chat = io.of('/socket').on('connection', function (socket) {

		
		// load khi connect den server
		// tra ve du lieu so nguoi online
		socket.on('load',function(data){
			connectCounter++;
			socket.emit('connectCounter', connectCounter);
			socket.broadcast.emit('connectCounter', connectCounter);
		});

		// nguoi dung login chuan bi chat
		socket.on('login', function(data) {

			// duyet qua tat ca cac room xem room nao con trong?
			var flag = 0;
			for(var i = 0;i < rooms.length; i++){
				console.log(rooms[i], chat.clients(rooms[i]).length);
				if(chat.clients(rooms[i]).length < 2){
					socket.join(rooms[i]);

					socket.room = rooms[i];

					socket.emit('statusRoom', '1');
					socket.broadcast.to(socket.room).emit('statusRoom', '1');
					console.log('sau join ', chat.clients(rooms[i]).length);
					flag = 1;
					break;
				}
			}

			// neu khong con phong trong
			// tao phong moi
			if(!flag){
				// random id cho room
				var roomId = uuid.v4();
				rooms.push(roomId);
				socket.join(roomId);
				socket.room = rooms[i];

				socket.emit('statusRoom', '0');
			}
		});

		// co nguoi ngat ket noi
		socket.on('disconnect', function() {

			// thong bao ve client nguoi nay da roi khoi phong
			socket.broadcast.to(socket.room).emit('leave', '1');

			// leave the room
			socket.leave(socket.room);

			// kiem tra neu room co so luong nguoi = 0 thi xoa khoi mang
			if(chat.clients(socket.room).length < 1){
				for(var i = 0; i < rooms.length; i++){
					if(socket.room == rooms[i]){
						rooms.splice(i, 1);
						break;
					}
				}
			}

			//giam so nguoi online di 1
			connectCounter--;
		});


		// Handle the sending of messages
		socket.on('msg', function(data){
			console.log(data, socket.room);
			// nhan tin nhan va gui tin nhan den nhung nguoi khac trong room
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg});
		});
	});
};