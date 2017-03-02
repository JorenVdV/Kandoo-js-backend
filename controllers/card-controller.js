/**
 * Created by nick on 13/02/17.
 */


class CardController {
    constructor() {
        this.themeService = require('../services/theme-service');
        this.cardService = require('../services/card-service');
    }

    addCardToTheme(req, res) {
        let body = req.body;
        this.cardService.addCard(body.description, req.params.themeId)
            .then((card) => res.status(201).send({card: card}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    getCardById(req, res) {
        this.cardService.getCardById(req.params.cardId)
            .then((card) => res.status(200).send({card: card}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    getCardsByThemeId(req, res) {
        this.cardService.getCardByThemeId(req.params.themeId)
            .then((cards) => res.status(200).send({cards: cards}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    removeCard(req, res) {
        this.cardService.removeCard(req.params.cardId)
            .then((succes) => res.sendStatus(204))
            .catch((err) => res.status(404).send({error: err.message}));
    }


}
module.exports = new CardController();