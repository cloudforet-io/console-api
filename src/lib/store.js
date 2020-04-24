import store from 'store';
import _ from 'lodash';
import grpcClient from '@lib/grpc-client';
import config from 'config';

const setStores = async ()  => {
    const svcObject = await getSVCs();
    if(!_.isEmpty(svcObject)){
        store.set('gRpc', svcObject);
    }
};

const getStores = (key)  => {
    const grpc = store.get('gRpc');
    return _.get(grpc, key, null);
};

const getSVCs = async ()  => {
    const serializeSVC = getSCV();
    const service = {};
    let failItems = {};
    let failCount = 0;
    if(!_.isEmpty(serializeSVC)){
        console.log('attempting to establish gRpc connection ');
        console.log('*******************************************************');
        for (let i = 0; i < serializeSVC.length; i++) {
            try {
                console.log(`key: ${serializeSVC[i].key}, version: ${serializeSVC[i].version}`);
                const gRPCService = await grpcClient.get(serializeSVC[i].key, serializeSVC[i].version);
                service[serializeSVC[i].key] =gRPCService;
            }
            catch (e) {
                failItems[serializeSVC[i].key] = e.details || e.message;
                failCount = failCount + 1;
            }
        }
        console.log('*******************************************************');
        console.log('gRpc connection has established');

    }
    if (failCount > 0) {
        let error = new Error(`Failed to get connection with gRPC. (total count: ${serializeSVC.length}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return service;
    }
};

const getSCV = () => {
    const serviceConfigs = config.get('endpoints');
    const services = [];
    Object.keys(serviceConfigs).forEach(function(key) {
        const versionInfo = serviceConfigs[key];
        const servieceSingle = {
            key,
            version: getLatestVersion(versionInfo)
        };
        services.push(servieceSingle);
    });
    return services;
};

const getLatestVersion = (versionInfo) => {
    const version = [];
    Object.keys(versionInfo).forEach(function(currrentVersion) {
        version.push(currrentVersion);
    });
    version.sort();
    return version[version.length -1];
};


export {
    getLatestVersion,
    setStores,
    getStores
};
