import _ from 'lodash';

const pageItems = (items, page) => {
    if (page.start) {
        if (page.limit) {
            return items.slice((page.start-1), (page.start+page.limit-1));
        } else {
            return items.slice(page.start-1);
        }
    }

    return items;
};

const filterItems = (items, keyword, filterKeys) => {
    return _.filter(items, function(item) {
        return filterKeys.some((key) => {
            let value = getObjectValue(item, key);
            if (Array.isArray(value)) {
                return value.some((v) => {
                    return String(v).indexOf(keyword) >= 0;
                });
            } else {
                return String(value).indexOf(keyword) >= 0;
            }
        });
    });
};

const getObjectValue = (object, dottedKey) => {
    if (dottedKey.indexOf('.') >= 0) {
        let key = dottedKey.split('.')[0];
        let rest = dottedKey.slice(dottedKey.indexOf('.')+1);

        if (key in object) {
            if (Array.isArray(object[key])) {
                // Array Values
                let values = object[key];

                if (rest.indexOf('.' >= 0)) {
                    let restKey = rest.split('.')[0];

                    if (typeof restKey == 'number') {
                        let index = parseInt(restKey);
                        let nextRest = rest.slice(rest.indexOf('.')+1);
                        if (index >= object[key].length) {
                            return null;
                        } else {
                            values = [object[key][index]];
                            rest = nextRest;
                        }
                    }
                } else {
                    if (typeof rest == 'number') {
                        if (rest >= object[key].length) {
                            return null;
                        } else {
                            return object[key];
                        }
                    }
                }

                let data = [];
                values.map((item) => {
                    let result = getObjectValue(item, rest);
                    if (result !== null) {
                        if(Array.isArray(result)) {
                            Array.prototype.push.apply(data, result);
                        } else {
                            data.push(result);
                        }
                    }
                });

                return data;
            } else {
                // Object Value
                return getObjectValue(object[key], rest);
            }
        } else {
            return null;
        }
    } else {
        if (dottedKey in object) {
            return object[dottedKey];
        } else {
            return null;
        }
    }
};

export {
    pageItems,
    filterItems,
    getObjectValue
};
