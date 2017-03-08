/**
 * Created by steve on 2/13/2017.
 */
const sessionController = require('../controllers/session-controller');

module.exports = function(app){
    app.post('/theme/:themeId/session', function(req,res){
        sessionController.createSession(req,res);
    });

    app.get('/session/:sessionId', function(req,res){
        sessionController.getSession(req,res);
    });

    app.post('/session/:sessionId/turn', function (req, res) {
        sessionController.playTurn(req,res);
    });

    app.put('/session/:sessionId/invitees', function (req, res) {
        sessionController.updateSessionInvitees(req,res);
    });

    app.put('/session/:sessionId/update', function(req,res){
        sessionController.updateSession(req,res);
    });


    app.get('/theme/:themeId/sessions', function(req,res){
        sessionController.getSessionsByTheme(req,res);
    });

    app.get('/user/:participantId/sessions/participating', function(req,res){
        sessionController.getSessionsByParticipant(req,res);
    });

    app.get('/user/:inviteeId/sessions/invited', function(req,res){
        sessionController.getSessionsByInvitee(req,res);
    });

    app.delete('/session/:sessionId/delete', function(req,res){
        sessionController.deleteSession(req,res);
    });

    app.put('/session/:sessionId/start', function (req, res) {
        sessionController.startSession(req, res);
    });

    app.put('/session/:sessionId/pause', function (req, res) {
        sessionController.pauseSession(req, res);
    });

    app.put('/session/:sessionId/stop', function (req, res) {
        sessionController.stopSession(req, res);
    });
};