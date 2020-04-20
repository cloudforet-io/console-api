import _ from 'lodash';
import { DateTime } from 'luxon';

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

const setPDFResponseHeader = (response, fileName) => {
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
};


const getPDFOption = (templates) => {
    const results = {};
    const options = _.get(templates,'options', null);

    /** Any Excel Option must be placed on here.
     * @ext_no_column: extra number column on left column( true/false ),
     * @file_name: download file's name
     * @sheet_name: excel's sheet name
     * @timezone: current user's timeZone
     */

    const defaultOption = {
        timezone: options.timezone,      //Optional: default => user's time zone
        file_name: 'export',             //Optional: default =>  'export_' ex) export.xlsx
        include_date: true,              //Optional: default =>  true
        page_breaker: false,             //Optional: default =>  false or array print out overall html page without selected pages
        selected_pg: 1                   //Optional: default =>  1 first page only if it's array this must be
    };
    /*order does't guarantee on each browser*/
    const pdfOptionKey = ['timezone', 'include_date', 'file_name', 'page_breaker', 'selected_pg'];

    pdfOptionKey.map((key) => {

        const defaultVal = defaultOption[key];
        const setVal = _.get(options, key, defaultVal);

        if(key === 'include_date'){
            results[key] = _.isBoolean(setVal) ? setVal : defaultVal ;
        } else if(key === 'number_column'){
            results[key] = _.isBoolean(setVal) ? setVal : defaultVal ;
        } else if(key === 'file_name'){
            const isDateIncluded = results['include_date'] ? `_${DateTime.local().setZone(options.timezone).toFormat('yyyy_LL_dd_HH_mm')}` : '';
            const newFileName = `${setVal}${isDateIncluded}.pdf`;
            results[key] = newFileName;
        } else if(key === 'selected_pg'){
            if(_.isArray(setVal)){
                if(setVal.length === 1 && !setVal.some(isNaN)){
                    results[key] = [0, setVal[0]];
                } else if(setVal.length === 2 && setVal[0] < setVal[1] && !setVal.some(isNaN)){
                    results[key] = setVal;
                } else {
                    results[key] = defaultVal;
                }
            } else if(_.isNumber(setVal)){
                results[key] = [0, setVal];
            } else {
                results[key] = defaultVal;
            }
        }else {
            results[key] = setVal;
        }
    }) ;

    return results;
};

export {
    setPDFResponseHeader,
    getPDFOption,
    getDynamicData
};