import httpContext from 'express-http-context';

class Tag {
    async bulkTagsAction(parameters) {
        const selectParameter = { query: { page: { start:1, limit:1 }, minimal: true },
            domain_id: httpContext.get('domain_id')
        };
        const aSingleInList = await parameters.list(selectParameter);
        if(selectParameter.query.minimal){
            delete selectParameter.query.minimal;
        }
        delete selectParameter.query.page;
        const key = aSingleInList.results.length > 0 ? getActionKey(aSingleInList.results[0], parameters) : null;
        console.log('key: ', key);
        const filter = [ {
            key: key,
            value: parameters.body.items,
            operator: 'in'
        }];

        selectParameter.query.filter = filter;
        const SelectedList = await parameters.list(selectParameter);

        if(SelectedList.results.length === 0){
            throw new Error(`Not found value. any of items within ids in [${parameters.body.items}]`);
        }

        if(SelectedList.results.length > 0 && parameters.action){
            if(parameters.action === 'set'){
                return setTag(SelectedList.results, parameters.update, parameters.body, key);
            } else if(parameters.action === 'update'){
                return updateTag(SelectedList.results, parameters.update, parameters.body, key);
            } else {
                return deleteTag(SelectedList.results, parameters.update, parameters.body, key);
            }
        }
    }
}

const tagError = (msg) => {
    let err = new Error(msg);
    err.status = 500;
    err.error_code = 'ERROR_NOT_FOUND';

    throw err;
}

const getActionKey = (objectData, params) => {
    const keyString = '_id';
    let key = null;

    Object.keys(objectData).map(item => {
        if(item.indexOf(keyString) > -1 && item.startsWith(params.key)){
            key = item;
        }
    });
    return key;
};


const  setTag = async (targetItems, updateClient, param, key)=> {
    if (!param.tags) {
        throw new Error('Required Parameter. (key = tags)');
    }

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    for (let i=0; i < targetItems.length; i++) {
        let currentItem = targetItems[i];

        try {
            let reqParams = {domain_id: httpContext.get('domain_id')};
            reqParams[key] = currentItem[key];
            reqParams['tags'] = param.tags;
            await updateClient(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[currentItem[key]] = e.details || e.message;
            failCount = failCount + 1;
        }
    }

    if (failCount > 0) {
        let error = new Error(`Failed to set Tags on selected target. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const updateTag = async (targetItems, updateClient, param, key)=> {
    if (!param.tags) {
        throw new Error('Required Parameter. (key = tags)');
    }
    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    for (let i=0; i < targetItems.length; i++) {
        let currentItem = targetItems[i];

        try {
            let reqParams = {domain_id: httpContext.get('domain_id')};
            const newTags = {...currentItem.tags, ...param.tags};

            reqParams[key] = currentItem[key];
            reqParams['tags'] = newTags;

            await updateClient(reqParams);
            successCount = successCount + 1;

        } catch (e) {
            failItems[currentItem[key]] = e.details || e.message;
            failCount = failCount + 1;
        }
    }

    if (failCount > 0) {
        let error = new Error(`Failed to update Tags on selected target. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const deleteTag = async (targetItems, updateClient, param, key)=> {
    if (!param.tag_keys) {
        throw new Error('Required Parameter. (key = tag_keys)');
    }

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    for (let i=0; i < targetItems.length; i++) {
        let currentItem = targetItems[i];

        try {

            if(param.tag_keys.length > 0 && currentItem['tags']) {
                let reqParams = {domain_id: httpContext.get('domain_id')};
                param.tag_keys.map(key => {
                    if(currentItem['tags'].hasOwnProperty(key)){
                        delete currentItem['tags'][key];
                    }
                });
                reqParams[key] = currentItem[key];
                reqParams['tags'] = currentItem.tags;
                await updateClient(reqParams);
                successCount = successCount + 1;
            }
        } catch (e) {
            failItems[currentItem[key]] = e.details || e.message;
            failCount = failCount + 1;
        }
    }

    if (failCount > 0) {
        let error = new Error(`Failed to delete Tags on selected target. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

export default new Tag();
