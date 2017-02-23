/**
 * Created by steve on 2/23/2017.
 */
const cardController = require('../controllers/card-controller');

module.exports = function(app){
    app.post('/theme/:themeId/card', function(req,res){
        cardController.addCardToTheme(req,res);
    });

    app.get('/card/:cardId', function(req,res){
        cardController.getCardById(req,res);
    });

    app.get('/theme/:themeId/cards', function(req,res){
        cardController.getCardsByThemeId(req,res);
    });

    app.delete('/card/:cardId/delete', function(req,res){
        cardController.removeCard(req,res);
    });
};