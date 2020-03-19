import _ from 'lodash';
import jmespath from 'jmespath';
import { DateTime } from 'luxon';

const jsonExcelStandardize = (dataJson, options) => {
    const results = [];
    dataJson.map((data) => {
        const newObj = {};
        console.log('data: ', data);
        options.map((option)=>{
            const key =  option.key.replace(/\!/g, '.');
            console.log('option: ', option);
            newObj[option.key] = _.get(data, key,'');
        });
        results.push(newObj);
    });
    console.log('results', results);
    return results;
};

const setExcelResponseHeader = (response, fileName) => {
    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
};

const setColumns = (workSheet, columnData) => {
    const columns = [];
    const defaultOptions = {
        width: 20
    };

    if(!_.isEmpty(columnData)){
        columnData.map((column)=>{
            const key = column.key.replace(/\./g, '!');
            const singleColumn = {
                header: column.name,
                key,
                width: defaultOptions.width,
                style: defaultOptions.style,
                view_type: column.view_type,
                view_option: column.view_type,
            };
            columns.push(singleColumn);
        });
        workSheet.columns = columns;
    }
    return columns;
};

const setRows = (workSheet, excelData, options) => {
    if(!_.isEmpty(excelData)){
        const excelsheetData = jsonExcelStandardize(excelData, options);
        excelsheetData.map((row)=>{
            workSheet.addRow(row);
        });
    }
    return workSheet;
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
}

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
        }
        sheet.getCell(letter).fill = defaultSetting.fill;
        sheet.getCell(letter).font = defaultSetting.font;
        sheet.getCell(letter).border = defaultSetting.border;
    });
};

const getExcelOption = (templates) => {
    const results = {};
    const options = _.get(templates,'options', null);
    const date_ob = new Date();
    const date = ('0' + date_ob.getDate()).slice(-2);
    const month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
    const defaultName = `exel_${date_ob.getFullYear()}_${month}_${date}_${date_ob.getHours()}_${date_ob.getMinutes()}_${date_ob.getSeconds()}`;
     /** Any Excel Option must be placed on here.
      * name: file-download-name
      *
      *
      */
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

const getLocalDatetimeFromTimeStamp = ts => DateTime.fromSeconds(Number(ts)).setZone(getTimezone()).toFormat('yyyy-LL-dd HH:mm:ss ZZZZ');

export {
    jsonExcelStandardize,
    setExcelResponseHeader,
    getHeaderRows,
    excelStyler,
    getExcelOption,
    setRows,
    setColumns,
    getLocalDatetimeFromTimeStamp

};