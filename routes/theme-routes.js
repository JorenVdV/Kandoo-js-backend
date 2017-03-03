/**
 * Created by nick on 13/02/17.
 */

const themeController = require('../controllers/theme-controller');

module.exports = function(app) {
    app.post('/theme', function(req,res){
        themeController.createTheme(req,res);
    });

    app.delete('/theme/:themeId/delete', function(req,res){
        themeController.deleteTheme(req,res);
    });

    app.put('/theme/:themeId/update', function(req,res){
        themeController.updateTheme(req,res);
    });
    app.put('/theme/:themeId/addorganiser', function(req,res){
        themeController.addOrganiser(req,res);
    });
    app.put('/theme/:themeId/removeorganiser', function(req,res){
        themeController.removeOrganiser(req,res);
    });

    app.get('/theme/:themeId', function(req,res){
        themeController.getTheme(req,res);
    });

    app.get('/themes', function(req,res){
        themeController.getThemes(req,res);
    });

    app.get('/user/:organiserId/themes', function(req,res){
        themeController.getThemes(req,res);
    });
};