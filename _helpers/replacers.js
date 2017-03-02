/**
 * Created by Steven Gentens on 3/2/2017.
 */

module.exports.replaceUndefinedOrNullOrEmptyObject = function (key, value) {
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value === 'object' && Object.entries(value).length === 0)
        return undefined;
    return value;
};