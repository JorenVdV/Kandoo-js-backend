/**
 * Created by steve on 2/8/2017.
 */
const Theme = require('../models/theme');

class ThemeRepository {
    constructor() {
        this.themeDao = Theme;
    }

    createTheme(theme, callback) {
        theme.save(function (err) {
            if (err) {
                callback(null, new Error('Error whilst trying to save theme: ' + theme.title + ' ' + err));
            } else {
                callback(theme);
            }
        });
    }

    readThemeById(id, callback) {
        this.themeDao.findOne({_id: id}, function (err,theme) {
            if (err) {
                callback(null, err);
            } else {
                if (!theme) {
                    callback(null, new Error("Unable to find theme with id: " + id));
                } else {
                    callback(theme);
                }
            }
        });
    }

    readThemes(callback) {
        this.themeDao.find({}, function (err,themes) {
            if (err) {
                callback(null, err);
            } else {
                let themeArray = [];
                themes.forEach(function (theme) {
                    themeArray.push(theme);
                });
                callback(themeArray);
            }
        });
    }

    updateTheme(id, title, description, tags, isPublic, cards, callback) {
        let updates = {
            title: title,
            description: description,
            tags: tags,
            isPublic: isPublic,
            cards: cards
        };
        this.themeDao.update({_id: id}, updates, function (err, result) {
            if (err)
                callback(null, err);
            else {
                if (result.ok) {
                    if(result.nModified == 1){
                        callback(true);
                    }else{
                        callback(true, new Error("More than one document has been updated..."));
                    }
                }
                else
                    callback(false, new Error("Unable to update theme"));
            }
        });
        // this.themeDao.findOne({_id: id}, function (err, theme) {
        //     if (err)
        //         callback(null, err);
        //     else {
        //         theme.title = title;
        //         theme.description = description;
        //         theme.tags = tags;
        //         theme.isPublic = isPublic;
        //         theme.organisers = [organisers];
        //         theme.cards = cards;
        //         theme.visits.$inc();
        //         theme.save(function (err) {
        //             if (err)
        //                 callback(false, new Error("Error whilst trying to save updated theme"));
        //             else {
        //                 callback(true);
        //             }
        //         });
        //     }
        // });
    }

    deleteTheme(id, callback) {
        this.themeDao.findOne({_id: id}, function (err, theme) {
            if (err)
                callback(false, err);
            else {
                if (theme) {
                    theme.remove(function (err) {
                        if (err) {
                            callback(false, new Error('Error whilst trying to remove theme with id: ' + id + ' ' + err));
                        } else {
                            callback(true);
                        }
                    });
                } else {
                    callback(false, new Error('Id does not exist'))
                }
            }
        });
    }
}

module.exports = new ThemeRepository();