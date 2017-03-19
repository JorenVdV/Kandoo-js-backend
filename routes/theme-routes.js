/**
 * Created by nick on 13/02/17.
 */
const auth = require('../controllers/authentication-controller');
const themeController = require('../controllers/theme-controller');

module.exports = function (app) {

    app.post('/theme', function (req, res) {
        themeController.createTheme(req, res);
    });

    app.delete('/theme/:themeId/delete', auth.organiserAccess, function (req, res) {
        themeController.deleteTheme(req, res);
    });

    app.put('/theme/:themeId/update', auth.organiserAccess, function (req, res) {
        themeController.updateTheme(req, res);
    });
    app.put('/theme/:themeId/addorganiser', auth.organiserAccess, function (req, res) {
        themeController.addOrganiser(req, res);
    });
    app.put('/theme/:themeId/removeorganiser', auth.organiserAccess, function (req, res) {
        themeController.removeOrganiser(req, res);
    });

    app.get('/theme/:themeId', function (req, res) {
        themeController.getTheme(req, res);
    });

    app.get('/themes', function (req, res) {
        themeController.getThemes(req, res);
    });

    app.get('/user/:userId/themes', auth.userAccess, function (req, res) {
        themeController.getThemes(req, res);
    });
};


