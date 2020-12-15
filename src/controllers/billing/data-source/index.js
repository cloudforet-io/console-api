import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const registerDataSource = async (params) => {
    let billingV1 = await grpcClient.get('billing', 'v1');
    let response = await billingV1.DataSource.register(params);

    return response;
};

const updateDataSource = async (params) => {
    let billingV1 = await grpcClient.get('billing', 'v1');
    let response = await billingV1.DataSource.update(params);

    return response;
};


const enableDataSource = async (params) => {
    let billingV1 = await grpcClient.get('billing', 'v1');
    let response = await billingV1.DataSource.enable(params);

    return response;
};

const disableDataSource = async (params) => {

    let billingV1 = await grpcClient.get('billing', 'v1');
    let response = await billingV1.DataSource.disable(params);

    return response;
};


const deregisterDataSource = async (params) => {
    let billingV1 = await grpcClient.get('billing', 'v1');
    let response = await billingV1.DataSource.deregister(params);

    return response;
};

const updatePluginDataSource = async (params) => {
    let billingV1 = await grpcClient.get('billing', 'v1');
    let response = await billingV1.DataSource.update_plugin(params);

    return response;
};

const verifyPluginDataSource = async (params) => {
    let billingV1 = await grpcClient.get('billing', 'v1');
    let response = await billingV1.DataSource.verify_plugin(params);

    return response;
};

const getDataSource = async (params) => {
    let billingV1 = await grpcClient.get('billing', 'v1');
    let response = await billingV1.DataSource.get(params);

    return response;
};

const listDataSources = async (params) => {
    let billingV1 = await grpcClient.get('billing', 'v1');
    let response = await billingV1.DataSource.list(params);

    return response;
};

const statDataSources = async (params) => {
    let billingV1 = await grpcClient.get('billing', 'v1');
    let response = await billingV1.DataSource.stat(params);

    return response;
};


export {
    registerDataSource,
    updateDataSource,
    enableDataSource,
    disableDataSource,
    deregisterDataSource,
    updatePluginDataSource,
    verifyPluginDataSource,
    getDataSource,
    listDataSources,
    statDataSources
};
