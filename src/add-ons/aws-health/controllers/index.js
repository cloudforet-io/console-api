import grpcClient from '@lib/grpc-client';
import redisClient from '@lib/redis';
import { getRequiredParam, getParameters} from '@/add-ons/aws-health/lib/aws-health';
import _ from 'lodash';

const getLogs = async (monitoringV1, params) => {
    const redis = await redisClient.connect();
    let logCache = await redis.get(`aws-health:${params.domain_id}:${params.data_source_id}:${params.resource_id}`);
    if (logCache) {
        logCache = JSON.parse(logCache);
        return logCache;
    } else {
        const logResponse = await monitoringV1.Log.list(params);
        redis.set(`aws-health:${params.domain_id}:${params.data_source_id}:${params.resource_id}`, JSON.stringify(logResponse), 60*60*6);
        return logResponse;
    }
};

const listAWSHealth = async (params) => {

    if (params.date_subtractor && Number.isInteger(parseInt(params.date_subtractor.toString()))) {
        if(params.date_subtractor > 14) throw new Error('maximum searchable date range is last 14 days (key = date_subtractor)');
    }

    const identityV1 = await grpcClient.get('identity', 'v1');
    _.set(params,'query', { only: ['service_account_id']});

    const serviceAccountGroup = await identityV1.ServiceAccount.list(params);
    const serviceAccounts = serviceAccountGroup.results.length > 0 ? _.map(serviceAccountGroup.results, 'service_account_id') : [];
    let logs = [];

    if(serviceAccounts.length == 0){
        return getRequiredParam(params.domain_id);
    } else {
        const monitoringV1 = await grpcClient.get('monitoring', 'v1');
        const dataSource = await monitoringV1.DataSource.list(getRequiredParam(params.domain_id, true));
        const dataSources = _.compact(_.map(dataSource.results, 'data_source_id'));

        if(!dataSources){
            return getRequiredParam(params.domain_id);
        }

        console.log(`        
        number of dataSource_ids: ${dataSources.length}, 
        number of serviceAccounts_ids:  ${serviceAccounts.length}, 
        dataSource_ids: ${dataSources}, serviceAccounts_ids: ${serviceAccounts}`);

        const getLogParam =  getParameters(dataSources, serviceAccounts, params.domain_id, params.date_subtractor);

        const loggerData = [];
        let successCount = 0;
        let failCount = 0;
        let failItems = {};

        let promises = getLogParam.map(async (singleParam) => {
            try {
                // const singleResponse = await _.invoke(monitoringV1, 'Log.list', singleParam);
                const singleResponse = await getLogs(monitoringV1, singleParam);
                const singleItemsLog = singleResponse.logs;

                if(singleItemsLog.length > 0){
                    const logItems = singleItemsLog.map((logItem) => {
                        if (logItem.eventTypeCategory === 'accountNotification')
                        {
                            logItem.eventTypeCategory = 'notification';
                        }

                        return logItem;
                    });

                    Array.prototype.push.apply(loggerData, logItems);
                }
                successCount = successCount + 1;
            }
            catch (e) {
                const key = `${singleParam.data_source_id}_${singleParam.resource_id}`;
                failItems[key] = e.details || e.message;
                failCount = failCount + 1;
            }
        });

        await Promise.all(promises);

        if (successCount == 0) {
            let error = new Error(`Failed get aws-health. (success: ${successCount}, failure: ${failCount})`);
            error.fail_items = failItems;
            //throw error;
        } else {
            const calculatedLogs = [];
            const obj = {};
            loggerData.forEach((singleLog)=> {
                const unique = singleLog.reference.resource_id;
                if(obj.hasOwnProperty(unique)) {
                    const newCount = singleLog.count + obj[unique].count;
                    obj[unique].count = newCount;
                } else {
                    calculatedLogs.push(unique);
                    obj[unique] = singleLog;
                }
            });
            logs = Object.values(obj);
        }
        return {
            logs: logs,
            domain_id: params.domain_id
        };
    }
};

export {
    listAWSHealth
};
