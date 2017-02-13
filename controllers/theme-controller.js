/**
 * Created by Seger on 13/02/2017.
 */
class ThemeController {
    constructor() {
        this.service = require('../services/theme-service')
    }
    
    addTheme(req, res){
        let body = req.body;
        let theme = this.service.addTheme(body.title, body.description, body.tags, body.isPublic, body.organiser, body.cards);
        if(theme){
            res.sendStatus(201);
        }else{
            res.sendStatus(404);
        }
    }
    
    getThemes(req, res){
        let body = req.body;
        let themes = this.service.getThemes();
        if(themes) res.send({themes: themes});
        else res.sendStatus(404);
    }
    
/*    deleteTheme(req, res){
        let themeId = req.param("id");
        this.service.removeTheme(themeId);
        console.log("ID:"+themeId);
        res.sendStatus(!this.service.getTheme(themeId)?204:404);
    }*/
}

module.exports = new ThemeController();