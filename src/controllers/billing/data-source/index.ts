import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const registerDataSource = async (params) => {
    const billingV1 = await grpcClient.get('billing', 'v1');
    const response = await billingV1.DataSource.register(params);

    return response;
};

const updateDataSource = async (params) => {
    const billingV1 = await grpcClient.get('billing', 'v1');
    const response = await billingV1.DataSource.update(params);

    return response;
};


const enableDataSource = async (params) => {
    const billingV1 = await grpcClient.get('billing', 'v1');
    const response = await billingV1.DataSource.enable(params);

    return response;
};

const disableDataSource = async (params) => {

    const billingV1 = await grpcClient.get('billing', 'v1');
    const response = await billingV1.DataSource.disable(params);

    return response;
};


const deregisterDataSource = async (params) => {
    const billingV1 = await grpcClient.get('billing', 'v1');
    const response = await billingV1.DataSource.deregister(params);

    return response;
};

const updatePluginDataSource = async (params) => {
    const billingV1 = await grpcClient.get('billing', 'v1');
    const response = await billingV1.DataSource.update_plugin(params);

    return response;
};

const verifyPluginDataSource = async (params) => {
    const billingV1 = await grpcClient.get('billing', 'v1');
    const response = await billingV1.DataSource.verify_plugin(params);

    return response;
};

const getDataSource = async (params) => {
    const billingV1 = await grpcClient.get('billing', 'v1');
    const response = await billingV1.DataSource.get(params);

    return response;
};

const listDataSources = async (params) => {
    const billingV1 = await grpcClient.get('billing', 'v1');
    const response = await billingV1.DataSource.list(params);

    return response;
};

const statDataSources = async (params) => {
    const billingV1 = await grpcClient.get('billing', 'v1');
    const response = await billingV1.DataSource.stat(params);

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
