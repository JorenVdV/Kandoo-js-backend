/**
 * Created by nick on 13/02/17.
 */

const cardController = require('../controllers/card-controller');

module.exports = function (app) {
    app.post('/theme/:themeid/card', function (req, res) {
        cardController.addCardToTheme(req, res);
    });

 * Created by Seger on 13/02/2017.
 */
const themeController = require('../controllers/theme-controller');

module.exports = function(app) {
    app.post('/theme', function(req,res){
        themeController.addTheme(req,res);
    });

/*    app.delete('/theme/:id', function(req,res){
        themeController.deleteTheme(req,res);
    });*/

    app.get('/themes', function(req,res){
        themeController.getThemes(req,res);
    });
};