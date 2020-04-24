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

const getStartAndYesterday =() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    Math.floor( yesterday / 1000);

    return {
        start: yesterday,
        end :  Math.floor((new Date()).getTime() / 1000)
    };
};

const getParamArr = (data_source_arr, resource_arr, domain_id) => {
    const returnArray = [];
    const timeStamp = getStartAndYesterday();

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
    emptyReturnable
};