/**
 * Created by nick on 13/03/17.
 */

const userService = require('../services/user-service');


class SocketService {
    constructor() {
        this.io = global.io;
        this.setupListeners();
    }

    setupListeners() {
        //Add socket to the logged in user.
        this.io.on('connection', function (ws) {

            ws.on('loggedin', function (data) {
                userService.getUserById(data).then(function (user) {
                    console.log(user);
                });
            });

            // ws.on('session_started', function (data) {
            //     userService.getUserById(data.user).then(function (user) {
            //         console.log('Organiser started session!');
            //         console.log(data.data);
            //         console.log(user);
            //     });
            // });
            ws.on('ping', function (data) {
                console.log('PONG | Got ping from : ');

                userService.getUserById(data.user).then(function (user) {
                    console.log('PONG | Got ping from : ' + user.firstname);
                });
            });
            ws.once('disconnect', function () {
                console.log('socket disconnected');

                // this.io.sockets.emit('count', {
                //     number: this.io.engine.clientsCount
                // });
            });
        });
    }

    sendNotification(userid, name, data) {
        this.io.sockets.emit(name, data);
    }
}
// module.exports = require('./lib/express');
module.exports = new SocketService();