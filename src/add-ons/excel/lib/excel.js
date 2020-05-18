import _ from 'lodash';
import { DateTime } from 'luxon';
import jmespath from 'jmespath';

const getDynamicData = async (serviceClient, params) => {
    let results = [];
    if(!_.isEmpty(params)){
        const selectedClient = await serviceClient.get(params.client, 'v1');
        const responseResults = await selectedClient.post(params.url, params.body);
        results = responseResults;
    }
    return results;
};

const getLocalDate = (ts, timeZone) => DateTime.fromSeconds(Number(ts)).setZone(timeZone).toFormat('yyyy-LL-dd HH:mm:ss');

const jsonExcelStandardize = (dataJson, options) => {
    const results = [];
    dataJson.map((data, index) => {
        const newObj = {};
        options.map((option)=>{
            const key =  option.key.replace(/\!/g, '.');
            newObj[option.key] =  key === 'head_number_row' ?  index+1 : _.get(data, key,'');
        });
        results.push(newObj);
    });
    return results;
};

const setExcelResponseHeader = (response, fileName) => {
    response.setHeader('Content-Type', 'application/vnd.ms-excel');
    response.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
};

const setColumns = (workSheet, parameterData) => {
    let concatData = [];
    const columns = [];
    const optionOverAll = [];
    const columnData = parameterData.data_source;
    const columnOptions = parameterData.options;
    const ext_no_column = _.get(columnOptions, 'number_column', null);

    const defaultOptions = {
        width: 20,
        style: {
            alignment: {
                vertical: 'top',
                horizontal:'left'
            }
        }
    };

    if(!_.isEmpty(columnData)){
        let numberColumn =[];

        if (ext_no_column){
            numberColumn.push({
                name: 'NO',
                key: 'head_number_row',
                type: '',
                options: {

                }
            });
            Array.prototype.push.apply(numberColumn, columnData);
        }

        concatData = ext_no_column ? numberColumn : columnData;
        concatData.map((column, index) => {
            const key = column.key.replace(/\./g, '!');

            const type = column.type;
            const options = column.options;

            const headerOptions ={};

            const headerColumn = {
                header: column.name,
                key,
                width: key === 'head_number_row' ? 5 : defaultOptions.width,
                style: key === 'head_number_row' ? {
                    alignment: {
                        vertical: 'top',
                        horizontal:'center'
                    }
                } : defaultOptions.style
            };

            const filterOption = ['datetime', 'list'];
            if(filterOption.indexOf(type) > -1){
                if('datetime' === type) {
                    options['timezone'] = columnOptions.timezone;
                }
                if(columnOptions.file_type === 'csv' && 'list' === type){
                    options['file_type'] = columnOptions.file_type;
                }
                headerOptions['optionIndex'] = index+1;
                headerOptions['type'] = type;
                headerOptions['options'] = options;
                optionOverAll.push(headerOptions);
            }
            columns.push(headerColumn);
        });

        workSheet.columns = columns;
    }
    return {columns, options: optionOverAll};
};

const setRows = (workSheet, excelData, options) => {
    if(!_.isEmpty(excelData)){
        const excelSheetData = jsonExcelStandardize(excelData, options.columns);
        for(let i = 1; i < excelSheetData.length+1; i++){
            const row = excelSheetData[i-1];
            const currentRowNum = i+1;
            workSheet.addRow(row);
            if(currentRowNum > 1) {
                const currentRow = workSheet.getRow(currentRowNum);
                options.options.map((extraOption) => {
                    setDataOption(currentRow, extraOption);
                });
            }
        }
    }
    return workSheet;
};

const setDataOption = (row, option) => {
    let refinedValue = null;
    const currentValue = row.getCell(option.optionIndex).value;
    if(option.type === 'datetime') {
        refinedValue = _.isPlainObject(currentValue) ? getLocalDate(currentValue.seconds, option.options.timezone) : currentValue? getLocalDate(currentValue, option.options.timezone): '';
        row.getCell(option.optionIndex).value = refinedValue;
    } else if(option.type === 'list') {
        const fileType = _.get(option, 'file_type', null);
        if(fileType === 'csv'){
            row.getCell(option.optionIndex).alignment = { wrapText: true };
        }

        refinedValue = getRichText(currentValue, option);
        row.getCell(option.optionIndex).value = refinedValue;
    } else {
       /*please, add if there's  any extra cases*/
    }
    row.commit();
};

const br2nl = (str, replaceMode) => {
    const replaceStr = (replaceMode) ? '\n': '';
    return str.replace(/<\s*\/?br\s*[\/]?>/gi, replaceStr);
};

const getRichText = (originalValue, option) => {

    const referral = _.get(option, 'options.file_type', 'xlsx') === 'csv' ? '' : [];
    let getRichText = referral;
    let delimiter = _.get(option,'options.delimiter', null);
    const subKeyPath = _.get(option,'options.sub_key', null);
    let contents = _.isEmpty(subKeyPath) ? originalValue : jmespath.search(originalValue, `[*].${subKeyPath}`);

    if(Array.isArray(contents) && contents){
        contents = contents.filter(v=> !_.isEmpty(v));
    }

    const isArray = _.isArray(referral);

    if(_.isArray(contents) && !_.isEmpty(contents)){
        getRichText = contentsHelper(contents, delimiter, referral, isArray);
    }

    return getRichText.length === 0 ? '': isArray ? {richText: getRichText} : getRichText;
};

const contentsHelper = (contents, delimiter, referral, isArray) => {
    let nlDelimiter = '\n';
    contents.map((content, index) => {
        if(delimiter) nlDelimiter = br2nl(delimiter);
        if(isArray){
            const richTextSingle = (index === 0) ?  {text: `${content}`} : {text: `${nlDelimiter}${content}`};
            referral.push(richTextSingle);
        } else {
            const additionalStr = (index === 0) ?  `${content}` : `${nlDelimiter}${content}`;
            referral = referral + additionalStr;
        }
    });
    return referral;
};

const getHeaderRows = (columnData) => {
    let columnLength = 0;
    const results = [];
    if(!_.isEmpty(columnData)){
        columnLength = columnData.length;
    }

    if(columnLength > 0 ) {
        for(let i = 0; i < columnLength; i++) {
            results.push( `${indexToLetter(i)}1`);
        }
    }
    return results;
};

const indexToLetter  = (index)=> {
    let temp, letter = '';
    index++;
    while (index > 0)
    {
        temp = (index - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        index = (index - temp - 1) / 26;
    }
    return letter;
};

const excelStyler = (sheet, columnLetters) => {
    columnLetters.forEach(function (letter) {
        //FFBDC0BF
        const defaultSetting = {
            fill: {
                type: 'pattern',
                pattern:'solid',
                fgColor:{ argb:'ffbdc0bf'}
            },
            font: { bold: true },
            border: {
                top: {style:'thin'},
                left: {style:'thin'},
                bottom: {style:'thin'},
                right: {style:'thin'}
            }
        };
        sheet.getCell(letter).fill = defaultSetting.fill;
        sheet.getCell(letter).font = defaultSetting.font;
        sheet.getCell(letter).border = defaultSetting.border;
    });
};

const getExcelOption = (templates) => {
    const results = {};
    const options = _.get(templates,'options', null);

    /** Any Excel Option must be placed on here.
     * @ext_no_column: extra number column on left column( true/false ),
     * @file_name: download file's name
     * @sheet_name: excel's sheet name
     * @timezone: current user's timeZone
     */

    const defaultOption = {
        timezone: options.timezone,     //Optional: default => user's time zone
        file_type: 'xlsx',              //Optional: default =>  'xlsx'
        number_column: false,           //Optional: default =>  false
        file_name: 'export',            //Optional: default =>  'export_' ex) export.xlsx
        include_date: true,             //Optional: default =>  true
        sheet_name: 'sheet',            //Optional: default =>  'sheet'
        current_page: false             //Optional: default =>  false
    };
    /*order does't guarantee on each browser*/
    const excelOptionKey = ['timezone', 'file_type', 'include_date', 'number_column', 'file_name', 'sheet_name', 'current_page'];

    excelOptionKey.map((key) => {

        const defaultVal = defaultOption[key];
        const setVal = _.get(options, key, defaultVal);

        if(key === 'file_type'){
            results[key] = ['xlsx', 'csv'].indexOf(setVal) > -1 ? setVal : defaultVal;
        } else if(key === 'include_date'){
            results[key] = _.isBoolean(setVal) ? setVal : defaultVal ;
        } else if(key === 'number_column'){
            results[key] = _.isBoolean(setVal) ? setVal : defaultVal ;
        } else if(key === 'file_name'){
            const isDateIncluded = results['include_date'] ? `_${DateTime.local().setZone(options.timezone).toFormat('yyyy_LL_dd_HH_mm')}` : '';
            const newFileName = `${setVal}${isDateIncluded}.${results['file_type']}`;
            results[key] = newFileName;
        } else {
            results[key] = setVal;
        }
    }) ;

    return results;
};

export {
    jsonExcelStandardize,
    setExcelResponseHeader,
    getHeaderRows,
    setRows,
    setColumns,
    excelStyler,
    getExcelOption,
    getDynamicData
};