/**
 * Created by steve on 2/8/2017.
 */
const Theme = require('../models/theme');

class ThemeRepository {
    constructor() {
        this.themeDao = Theme;
    }

    async createTheme(theme) {
        try {
            await theme.save();
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }
        return theme;
    }

    async readThemeById(id) {
        let theme;
        try {
            theme = await this.themeDao.findOne({_id: id}).populate('organisers', 'firstname lastname emailAddress _id');
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }

        if (theme)
            return theme;
        else
            throw new Error('Unable to find theme with id: ' + id);
    }

    async readThemes(organiserId) {
        let themeArray = [];
        let query;

        if (organiserId)
            query = {organisers: {$in: [organiserId]}};
        else
            query = {};

        try {
            let themes = await this.themeDao.find(query).populate('organisers', 'firstname lastname emailAddress _id');
            themes.forEach(function (theme) {
                themeArray.push(theme);
            });
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }
        return themeArray;
    }

    async updateTheme(id, toUpdate) {
        let theme;
        try{
            theme = await this.themeDao.findByIdAndUpdate(id, toUpdate, {new:true}).populate('organisers', 'firstname lastname emailAddress _id');
        }catch(err){
            throw new Error('Unexpected error occurred. ' + err);
        }
        return theme;
    }

    async deleteTheme(theme) {
        try {

            await theme.remove();
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }
        return true;
    }

    // handleError(err){
    //     if(err instanceof MongooseError){
    //         let newError;
    //         switch(err.name){
    //             case 'CastError': newError = new Error('Unexpected error occurred.'); break;
    //             case 'DocumentNotFoundError': newError = new Error(''); break;
    //             case 'ValidationError': newError = new Error(''); break;
    //             case 'ValidatorError': newError = new Error(''); break;
    //             case 'VersionError': newError = new Error('Unexpected error occurred.'); break;
    //             case 'OverwriteModelError': newError = new Error('Unexpected error occurred.'); break;
    //             case 'MissingSchemaError': newError = new Error('Unexpected error occurred.'); break;
    //             case 'DivergentArrayError': newError = new Error('Unexpected error occurred.'); break;
    //             case 'DisconnectedError': newError = new Error('Unexpected error occurred.'); break;
    //             case 'ObjectExpectedError': newError = new Error('Unexpected error occurred.'); break;
    //             case 'StrictModeError': newError = new Error('Unexpected error occurred.'); break;
    //         }
    //         throw newError;
    //     }else{
    //         throw err;
    //     }
    // }
}

module.exports = new ThemeRepository();