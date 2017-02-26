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

    app.post('/session/:sessionId/invite', function (req, res) {
        sessionController.inviteUser(req,res);
    });


    app.get('/theme/:themeId/sessions', function(req,res){
        sessionController.getSessionsByTheme(req,res);
    });

    app.get('/:participantId/sessions/participating', function(req,res){
        sessionController.getSessionsByParticipant(req,res);
    });
    app.get('/:inviteeId/sessions/invited', function(req,res){
        sessionController.getSessionsByInvitee(req,res);
    });

    app.delete('/session/:sessionId/delete', function(req,res){
        sessionController.deleteSession(req,res);
    });

    app.post('/session/:sessionId/start', function (req, res) {
        sessionController.startSession(req, res);
    });

    app.post('/session/:sessionId/stop', function (req, res) {
        sessionController.stopSession(req, res);
    });
};