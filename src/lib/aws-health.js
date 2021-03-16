const getStartAndYesterday =(subtracotr) => {
    let defaultSubtractor = 7;
    if(subtracotr){
        let newSubtractor = parseInt(subtracotr.toString());
        if (Number.isInteger(newSubtractor)) {
            defaultSubtractor =  newSubtractor;
        }
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - defaultSubtractor);
    const startDate = Math.floor( yesterday / 1000);

    return {
        start: startDate,
        end :  Math.floor((new Date()).getTime() / 1000)
    };
};

const getParameters = (data_source_ids, resource_ids, domain_id, date_sub) => {
    const returnArray = [];
    const timeStamp = getStartAndYesterday(date_sub);

    data_source_ids.forEach(data_source_id => {
        resource_ids.forEach(service_acount_id => {
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

const getRequiredParam = (domain_id, filter) => {
    const param = {
        domain_id: domain_id,
        ... !filter && {logs: []},
        ... filter && {query: {
            filter: [
                {
                    key: 'tags.spaceone:plugin_name',
                    value: 'aws-health',
                    operator: 'eq'
                }
            ]
        }}
    };
    return param;
};

export {
    getParameters,
    getRequiredParam
};