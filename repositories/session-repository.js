/**
 * Created by steve on 2/8/2017.
 */
const Session = require('../models/session');

class SessionRepository {
    constructor() {
        this.sessionDao = Session;
    }

    createSession(session, callback) {
        session.save(function (err) {
            if (err)
                callback(null, new Error('Error whilst creating session'));
            else
                callback(session);
        });
    }

    readSessionById(id, callback) {
        this.sessionDao.findOne({_id: id}, function (err, session) {
            if (err)
                callback(null, new Error('Error whilst retrieving session with id: ' + id + ' ' + err));
            else {
                if (session)
                    callback(session);
                else
                    callback(null, new Error('Unable to find session with id ' + id));
            }
        });
    }

    readSessions(themeId, callback) {
        this.sessionDao.find({theme: themeId}, function (err, sessions) {
            if (err) {
                callback(null, new Error('Error whilst retrieving sessions of theme with id: ' + themeId + ' ' + err));
            } else {
                let sessionArray = [];
                sessions.forEach(function (session) {
                    sessionArray.push(session);
                });
                callback(sessionArray);
            }
        });
    }

    // updateSession(session, callback) {
    //     session.save(function (err) {
    //         if (err)
    //             callback(null, new Error('Error whilst updating session with id: ' + session._id));
    //         else
    //             callback(session);
    //     });
    // }

    updateSession(sessionId, toUpdate, callback) {
        this.sessionDao.findOneAndUpdate({_id: sessionId}, toUpdate, function (err) {
            if (err)
                callback(false, err);
            else {
                callback(true);
            }
        })
    }

    deleteSession(id, callback) {
        this.readSessionById(id, function (session, err) {
            if (err)
                callback(false, err);
            else
                session.remove(function (err) {
                    if (err) {
                        callback(false, new Error('Error whilst trying to remove session with id: ' + id));
                    } else {
                        callback(true);
                    }
                });
        });
        // this.sessionDao.findOne({_id: id}, function (err, session) {
        //     if (err)
        //         callback(false, err);
        //     else {
        //         if (session)
        //             session.remove(function (err) {
        //                 if (err) {
        //                     callback(false, new Error('Error whilst trying to remove session with id: ' + id));
        //                 } else {
        //                     callback(true);
        //                 }
        //             });
        //         else
        //             callback(false, new Error('Id does not exist'));
        //     }
        // });
    }
}

module.exports = new SessionRepository();