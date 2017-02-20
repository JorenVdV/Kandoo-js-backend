/**
 * Created by Seger on 13/02/2017.
 */
class ThemeController {
    constructor() {
        this.themeService = require('../services/theme-service')
    }

    createTheme(req, res){
        let body = req.body;
        let theme = this.themeService.addTheme(body.title, body.description, body.tags, body.isPublic, body.organiser, body.cards);
        if(theme){
            res.sendStatus(201)
        }else{
            res.sendStatus(404);
        }
    }

    getTheme(req, res){
        let themeId = req.params.themeid;
        let theme = this.themeService.getTheme(themeId);
        if(theme) res.send({theme: theme});
        else res.sendStatus(404);
    }

    getThemes(req, res){
        let themes = this.themeService.getThemes();
        if(themes) res.send({themes: themes});
        else res.sendStatus(404);
    }

    deleteTheme(req, res){
        let themeId = req.params.themeid;
        this.themeService.removeTheme(themeId);
        res.sendStatus(!this.themeService.getTheme(themeId)?204:404);
    }
}

module.exports = new ThemeController();