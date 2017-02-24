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
        // console.log((req));
        // console.log(req.params.themeId);
        this.cardService.addCard(body.description, req.params.themeId,
            (card, err) => {
                if(err)
                    res.status(404).send({error: err.message});
                else
                    res.status(201).send({card: card});
            });
    }

    getCardById(req, res) {
        this.cardService.getCardById(req.params.cardId,
            (card, err) => {
                if (err) {
                    res.status(404).send({error: err.message});
                } else {
                    res.status(200).send({card: card});
                }
            });
    }

    getCardsByThemeId(req, res) {
        this.cardService.getCardByThemeId(req.params.themeId,
            (cards, err) => {
                if (err)
                    res.status(404).send({error: err.message});
                else
                    res.status(200).send({cards: cards});
            });
    }

    removeCard(req, res) {
        this.cardService.removeCard(req.params.cardId,
            (success, err) => {
                if (err) {
                    res.status(404).send({error: err.message});
                } else {
                    res.sendStatus(204);
                }
            })
    }


}
module.exports = new CardController();