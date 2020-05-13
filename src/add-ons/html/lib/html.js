import _ from 'lodash';
import { DateTime } from 'luxon';

const setDefaultOption = (params) => {
    const updateKeys = ['path', 'title', 'length'];
    const defaultRenderOptions = {
        path: 'template/main-container',
        title: 'default-reporting',
        length: 5
    };
    for(let [key, value] of Object.entries(params)) {
        if(updateKeys.indexOf(key) < -1){
            _.set(defaultRenderOptions, key, value);
        }
    }
    return defaultRenderOptions;
};

const getDynamicData = async (serviceClient, params) => {
    let results = [];
    if(!_.isEmpty(params)){
        const selectedClient = await serviceClient.get(params.client, 'v1');
        const responseResults = await selectedClient.post(params.url, params.body);
        results = responseResults;
    }
    return results;
};

const getLocalDate = (ts, timeZone) => DateTime.fromSeconds(Number(ts)).setZone(timeZone).toFormat('yyyy-LL-dd HH:mm:ss ZZZZ');

const cssStyler = (sheet, columnLetters) => {

};

const getHtmlOption = (templates) => {
};

export {
    setDefaultOption,
    cssStyler,
    getHtmlOption,
    getDynamicData
};