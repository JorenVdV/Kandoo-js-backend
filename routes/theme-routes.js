/**
 * Created by nick on 13/02/17.
 */

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
};