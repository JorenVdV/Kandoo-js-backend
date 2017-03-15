/**
 * Created by nick on 13/03/17.
 */

const userService = require('../services/user-service');


class SocketService {
    constructor(io) {
        this.io = io;
        this.setupListeners();
    }

    setupListeners() {
        //Add socket to the logged in user.
        this.io.on('connection', function (ws) {

            ws.on('init', function (data) {
                userService.getUserById(data).then((user) => {
                    console.log('The user: ' + user.firstname + ' connected!');
                    global.sockets.push({socket: ws, user: user._id});
                    // global.sockets.find((o) => o.socket == ws).user = user._id;

                    userService.sendSocketMessage(user, 'messages', 'Socket registered on the server!');
                });
            });

        });
    }

    getSocketofUser(id) {
        // var test = (global.sockets.findIndex(socket => socket.user.toString() === id.toString()) !== -1);

        // global.sockets.forEach(function (o) {
        //    if(o.user.toString() === id.toString()){
        //        test = o;
        //    }
        // });

        // console.log('test: ' + global.sockets[global.sockets.findIndex(socket => socket.user.toString() === id.toString())].socket);
        return global.sockets[global.sockets.findIndex(socket => socket.user.toString() === id.toString())].socket;
    }


    sendNotification(socket, name, data) {
        console.log(data);
        socket.emit(name, data);
    }
}
// module.exports = require('./lib/express');
module.exports = SocketService;