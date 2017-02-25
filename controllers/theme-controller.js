/**
 * Created by Seger on 13/02/2017.
 */
class ThemeController {
    constructor() {
        this.themeService = require('../services/theme-service')
    }

    createTheme(req, res) {
        let body = req.body;
        this.themeService.addTheme(body.title, body.description, body.tags, body.isPublic, body.organiser, body.cards)
            .then((theme) => res.status(201).send({theme: theme}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    getTheme(req, res) {
        this.themeService.getTheme(req.params.themeId)
            .then((theme) => res.status(200).send({theme: theme}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    getThemes(req, res) {
        let body = req.body;
        this.themeService.getThemes(body.organiserId)
            .then((themes) => res.status(200).send({themes: themes}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    deleteTheme(req, res) {
        this.themeService.removeTheme(req.params.themeId)
            .then((successful) => res.sendStatus(204))
            .catch((err) => res.status(404).send({error: err.message}));
    }
}

module.exports = new ThemeController();