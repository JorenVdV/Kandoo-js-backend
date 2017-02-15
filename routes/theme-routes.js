const cardController = require('../controllers/card-controller');
const themeController = require('../controllers/theme-controller');

module.exports = function(app) {
    app.post('/theme', function(req,res){
        themeController.createTheme(req,res);
    });

    app.delete('/theme/:themeid', function(req,res){
        themeController.deleteTheme(req,res);
    });

    app.get('/theme/:themeid', function(req,res){
        themeController.getTheme(req,res);
    });

    app.get('/themes', function(req,res){
        themeController.getThemes(req,res);
    });

    app.post('/theme/:themeid/card', function (req, res) {
        cardController.addCardToTheme(req, res);
    });
};