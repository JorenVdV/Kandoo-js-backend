/**
 * Created by Seger on 13/02/2017.
 */
class ThemeController {
    constructor() {
        this.themeService = require('../services/theme-service')
    }

    createTheme(req, res) {
        let body = req.body;
        this.themeService.addTheme(body.title, body.description, body.tags, body.isPublic, body.organiser, body.cards, function (theme, err) {
            if (err) {
                res.status(404).send({error: err.message});
            } else if (theme) {
                res.status(201).send({theme: theme});
            }
        });
    }

    getTheme(req, res) {
        let themeId = req.params.themeid;
        this.themeService.getTheme(themeId, function (theme, err) {
            if (err) {
                res.status(404).send({error: err.message});
            }
            else if (theme) {
                res.status(200).send({theme: theme});
            }
        });

    }

    getThemes(req, res) {
        this.themeService.getThemes(function(themes, err){
           if(err) {
               res.status(404).send({error: err.message});
           }else{
               res.status(200).send({themes:themes});
           }
        });
    }

    deleteTheme(req, res) {
        let themeId = req.params.themeid;
        this.themeService.removeTheme(themeId);
        res.sendStatus(!this.themeService.getTheme(themeId) ? 204 : 404);
    }
}

module.exports = new ThemeController();