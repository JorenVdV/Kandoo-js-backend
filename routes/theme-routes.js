/**
 * Created by nick on 13/02/17.
 */

const cardController = require('../controllers/card-controller');

module.exports = function (app) {
    app.post('/theme/:themeid/card', function (req, res) {
        cardController.addCardToTheme(req, res);
    });

};