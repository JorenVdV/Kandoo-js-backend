/**
 * Created by Seger on 13/02/2017.
 */
class ThemeController {
    constructor() {
        this.themeService = require('../services/theme-service');
        this.userService = require('../services/user-service');


    }
    setIO(io){
        this.io = io;
    }

    createTheme(req, res) {
        let body = req.body;
        this.themeService.addTheme(body.title, body.description, body.tags, body.isPublic, body.organiser, body.cards)
            .then((theme) => res.status(201).send({theme: theme}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    getTheme(req, res) {
        // try{
        //     this.io.emit('themes');
        //     console.log('SOCKET.IO - Emitted Themes event')
        // }catch(exception){
        //     console.log(exception);
        // }

        this.themeService.getTheme(req.params.themeId)
            .then((theme) => res.status(200).send({theme: theme}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    getThemes(req, res) {
        this.themeService.getThemes(req.params.userId)
            .then((themes) => res.status(200).send({themes: themes}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    addOrganiser(req,res){
        let body = req.body;
        this.themeService.addOrganiser(req.params.themeId, body.organiserEmail)
            .then((theme) => res.status(200).send({theme: theme}))
            .catch((err) => res.status(400).send({error: err.message}));
    }

    removeOrganiser(req,res){
        let body = req.body;
        this.themeService.removeOrganiser(req.params.themeId, body.organiserId)
            .then((theme) => res.status(200).send({theme: theme}))
            .catch((err) => res.status(400).send({error: err.message}));
    }

    updateTheme(req,res){
        let body = req.body;
        let toUpdate = {
            title: body.title,
            description: body.description,
            tags: body.tags,
            isPublic: body.isPublic
        };
        this.themeService.changeTheme(req.params.themeId, toUpdate)
            .then((theme) => res.status(200).send({theme: theme}))
            .catch((err) => res.status(400).send({error: err.message}));
    }

    deleteTheme(req, res) {
        this.themeService.removeTheme(req.params.themeId)
            .then((successful) => res.sendStatus(204))
            .catch((err) => res.status(404).send({error: err.message}));
    }
}

module.exports = new ThemeController();