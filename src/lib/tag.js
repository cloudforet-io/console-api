import httpContext from 'express-http-context';
import asyncHandler from 'express-async-handler';
import _ from 'lodash';

class Tag {
    async bulkTagsAction(parameters) {

        const selectAction = _.get(parameters, 'tag_action.list', null);
        const updateAction = _.get(parameters, 'tag_action.update', null);
        const itemKey = _.get(parameters, 'tag_action.key', null);
        const action = _.get(parameters, 'tag_action.actionURI', null);
        const items = _.get(parameters, 'items', null);

        if(!items){
            throw new Error('Required Parameter. (key = items)');
        }

        if(!parameters.tags && !parameters.tag_keys){
            throw new Error('Required Parameter. (key = tags or tag_keys)');
        }

        const selectParam = getSelectParam(itemKey, items);
        const selectedItems = await selectAction(selectParam);

        if(selectedItems.results.length === 0){
            throw new Error(`Not found value. any items in [${items}]`);
        } else {
            if(['/set','/update', '/delete' ].indexOf(action) == -1){
                throw new Error(`Request with wrong route . ${action}`);
            }else if(action === '/set'){
                return setTag(selectedItems.results, updateAction, parameters, itemKey);
            } else if(action === '/update'){
                return updateTag(selectedItems.results, updateAction, parameters, itemKey);
            } else {
                return deleteTag(selectedItems.results, updateAction, parameters, itemKey);
            }
        }
    }

    bulkMiddleHandler(essentialTagParam) {
        return asyncHandler(async (req, res, next) => {
            const actionURI = req.path.toString();
            essentialTagParam['actionURI'] = actionURI;
            essentialTagParam['domain_id'] = essentialTagParam.domain_id ? essentialTagParam.domain_id : httpContext.get('domain_id');
            req.body.tag_action = essentialTagParam;
            next();
        });
    }
}

const getSelectParam = (key, items) =>  {
    return {
        query: {
            filter: [{
                key: key,
                value: items,
                operator: 'in'
            }],
            only: [key, 'tags']
        }
    };
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
