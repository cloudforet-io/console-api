import _ from 'lodash';

const getKeyArrays = (response, key) => {
    const returnArray = [];
    response.results.map((singleItem)=> {
        const selectedItem = _.get(singleItem, key, null);
        if(!_.isEmpty(selectedItem)){
            returnArray.push(selectedItem);
        }
    });
    return returnArray;
};

const getStartAndYesterday =(subtracotr) => {
    let defaultSubtractor = 7;
    if(subtracotr){
        let newSubtractor = parseInt(subtracotr.toString());
        if (Number.isInteger(newSubtractor)) {
            defaultSubtractor =  newSubtractor;
        }
    }

    const yesterday = new Date();
    console.log('defaultSubtractor: ', defaultSubtractor);
    yesterday.setDate(yesterday.getDate() - defaultSubtractor);
    const startDate = Math.floor( yesterday / 1000);

    console.log('Start Date: ', startDate);
    console.log('End Date: ', Math.floor((new Date()).getTime() / 1000));

    return {
        start: startDate,
        end :  Math.floor((new Date()).getTime() / 1000)
    };
};

const getParamArr = (data_source_arr, resource_arr, domain_id, date_sub) => {
    const returnArray = [];
    const timeStamp = getStartAndYesterday(date_sub);

    data_source_arr.map((data_source_id)=> {
        resource_arr.map((service_acount_id)=> {
            const logParams = {
                domain_id: domain_id,
                data_source_id: data_source_id,
                resource_type: 'identity.ServiceAccount',
                resource_id: service_acount_id,
                end: {
                    seconds: timeStamp.end
                },
                start:{
                    seconds: timeStamp.start
                }
            };
            returnArray.push(logParams);
        });
    });

    return returnArray;
};

const emptyReturnable = (domain_id) => {
    return {
        logs: [],
        domain_id: domain_id
    };
};


const getDataSourceParam = (domain_id) => {
    return {
        domain_id: domain_id,
        query: {
            filter: [
                {
                    key: 'tags.spaceone:plugin_name',
                    value: 'aws-health',
                    operator: 'eq'
                }
            ]
        }
    };
};

export {
    getKeyArrays,
    getParamArr,
    emptyReturnable,
    getDataSourceParam
};