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
        let card = this.cardService.addCard(body.description);
        let theme = this.themeService.addCard(req.params.themeid, card);

        res.status(201).send({theme: theme});
    }


}
module.exports = new CardController();