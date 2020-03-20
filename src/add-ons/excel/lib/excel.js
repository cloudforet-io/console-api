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

const jsonExcelStandardize = (dataJson, options) => {
    const results = [];
    dataJson.map((data) => {
        const newObj = {};
        options.map((option)=>{
            const key =  option.key.replace(/\!/g, '.');
            newObj[option.key] = _.get(data, key,'');
        });
        results.push(newObj);
    });
    return results;
};

const setExcelResponseHeader = (response, fileName) => {
    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
};

const setColumns = (workSheet, parameterData) => {
    const columns = [];
    const options = [];
    const columnData = parameterData.data_source;
    const columnOptions = parameterData.options;
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
        columnData.map((column, index) =>{
            const key = column.key.replace(/\./g, '!');
            const view_type = column.view_type;
            const view_option = column.view_option;
            const headerOptions ={};

            const headerColumn = {
                header: column.name,
                key,
                width: defaultOptions.width,
                style: defaultOptions.style
            };

            const filterOption = ['datetime', 'list'];
            if(filterOption.indexOf(view_type) > -1){
                if('datetime' === view_type) {
                    view_option['timezone'] = columnOptions.timezone;
                }
                headerOptions['optionIndex'] = index+1;
                headerOptions['view_type'] = view_type;
                headerOptions['view_option'] = view_option;
                options.push(headerOptions);
            }
            columns.push(headerColumn);
        });

        workSheet.columns = columns;
    }
    return {columns, options};
};

const setRows = (workSheet, excelData, options) => {
    if(!_.isEmpty(excelData)){
        const excelSheetData = jsonExcelStandardize(excelData, options.columns);
        //const isExtraActionRequired = !_.isEmpty(options.options) ? options.options: false;
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
    if(option.view_type === 'datetime') {
        refinedValue = _.isPlainObject(currentValue) ? getLocalDate(currentValue.seconds, option.view_option.timezone) : getLocalDate(currentValue, option.view_option.timezone);
        row.getCell(option.optionIndex).value = refinedValue;
    } else if(option.view_type === 'list') {
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
    let richText = [];
    let delimiter = _.get(option,'view_option.delimiter', null);
    if(_.get(option,'view_option.sub_key')){
        const subKeyPath = _.get(option,'view_option.sub_key');
        const contents = jmespath.search(originalValue, subKeyPath);
        if(_.isArray(contents) && !_.isEmpty(contents)){
            contents.map((content, index) => {
                let nlDelimiter = '\n';
                if(delimiter) nlDelimiter = br2nl(delimiter);
                const richTextSingle = (index === 0) ?  {text: `${content}`} : {text: `${nlDelimiter}${content}`};
                richText.push(richTextSingle);
            });
        }
    } else {
        originalValue.map((single, index) =>{
            let nlDelimiter = '\n';
            if(delimiter) nlDelimiter = br2nl(delimiter);
            const richTextSingle = (index === 0) ?  {text: `${single}`} : {text: `${nlDelimiter}${single}`};
            richText.push(richTextSingle);
        });
    }
    return richText.length===0 ? '': {richText};
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
        const defaultSetting = {
            fill: {
                type: 'pattern',
                pattern:'solid',
                fgColor:{ argb:'eeeeee'}
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
    const date_ob = new Date();

    /** Any Excel Option must be placed on here.
     * @ext_no_column: extra number column on left column( true/false ),
     * @file_name: download file's name
     * @sheet_name: excel's sheet name
     * @timezone: current user's timeZone
     */

    const date = ('0' + date_ob.getDate()).slice(-2);
    const month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
    const defaultName = `exel_${date_ob.getFullYear()}_${month}_${date}_${date_ob.getHours()}_${date_ob.getMinutes()}_${date_ob.getSeconds()}`;
    if(options) {
        let name = _.get(options,'name', null);
        if(_.isEmpty(name)) {
            name = defaultName;
        }
        results['name'] = `${name}.xlsx`;
    } else {
        results['name'] = `${defaultName}.xlsx`;
    }
    return results;
};

const getLocalDate = (ts, timeZone) => DateTime.fromSeconds(Number(ts)).setZone(timeZone).toFormat('yyyy-LL-dd HH:mm:ss ZZZZ');

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