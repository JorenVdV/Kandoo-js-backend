/**
 * Created by steve on 2/13/2017.
 */
const sessionController = require('../controllers/session-controller');
const auth = require('../controllers/authentication-controller');

module.exports = function(app){
    app.post('/theme/:themeId/session', auth.organiserAccess, function(req,res){
        sessionController.createSession(req,res);
    });

    app.post('/session/:sessionId/copy',auth.organiserAccess, function(req,res){
        sessionController.copySession(req,res);
    });

    app.get('/session/:sessionId',auth.participantAccess, function(req,res){
        sessionController.getSession(req,res);
    });

    app.put('/session/:sessionId/turn',auth.participantAccess, function (req, res) {
        sessionController.playTurn(req,res);
    });

    app.put('/session/:sessionId/invitees',auth.organiserAccess, function (req, res) {
        sessionController.updateSessionInvitees(req,res);
    });

    app.put('/session/:sessionId/accept', auth.userAccess, function(req,res){
        sessionController.acceptInviteToSession(req,res);
    });

    app.put('/session/:sessionId/update',auth.organiserAccess, function(req,res){
        sessionController.updateSession(req,res);
    });

    app.put('/session/:sessionId/pick',auth.participantAccess, function(req,res){
        sessionController.pickCardsByUserId(req,res);
    });


    app.get('/theme/:themeId/sessions',auth.organiserAccess, function(req,res){
        sessionController.getSessionsByTheme(req,res);
    });

    app.get('/user/:userId/sessions/participating', auth.userAccess, function(req,res){
        sessionController.getSessionsByParticipant(req,res);
    });

    app.get('/user/:userId/sessions/invited', auth.userAccess, function(req,res){
        sessionController.getSessionsByInvitee(req,res);
    });

    app.delete('/session/:sessionId/delete',auth.organiserAccess, function(req,res){
        sessionController.deleteSession(req,res);
    });

    app.put('/session/:sessionId/start',auth.organiserAccess, function (req, res) {
        sessionController.startSession(req, res);
    });

    app.put('/session/:sessionId/pause',auth.organiserAccess, function (req, res) {
        sessionController.pauseSession(req, res);
    });

    app.put('/session/:sessionId/stop',auth.organiserAccess, function (req, res) {
        sessionController.stopSession(req, res);
    });

    app.get('/session/:sessionId/history',auth.participantAccess, function (req, res) {
        sessionController.getEvents(req, res);
    });
};