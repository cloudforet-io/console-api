import _ from 'lodash';

const jsonExcelStandardize = (dataJson, options) => {
    const results = [];
    dataJson.map((data) => {
        const newObj = {};
        options.map((data_source)=>{
            newObj[data_source.name] = _.get(data, data_source.key,'');
        });
        results.push(newObj);
    });
    console.log('results', results);
    return results;
};

const getExcelOption = (templates) => {
    const results = {};
    const options = _.get(templates,'options', null);
    const date_ob = new Date();
    const date = ("0" + date_ob.getDate()).slice(-2);
    const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
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


export {
    jsonExcelStandardize,
    getExcelOption
};