import grpcClient from '@lib/grpc-client';

const registerDataSource = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSource.register(params);

    return response;
};

const updateDataSource = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSource.update(params);

    return response;
};

const updateDataSourcePlugin = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSource.update_plugin(params);

    return response;
};

const verifyDataSourcePlugin = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSource.verify_plugin(params);

    return response;
};

const enableDataSource = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSource.enable(params);

    return response;
};

const disableDataSource = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSource.disable(params);

    return response;
};

const deregisterDataSource = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSource.deregister(params);

    return response;
};

const syncDataSource = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSource.sync(params);

    return response;
};

const getDataSource = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSource.get(params);

    return response;
};

const listDataSources = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSource.list(params);

    return response;
};

const statDataSources = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSource.stat(params);

    return response;
};

export {
    registerDataSource,
    updateDataSource,
    updateDataSourcePlugin,
    verifyDataSourcePlugin,
    enableDataSource,
    disableDataSource,
    deregisterDataSource,
    syncDataSource,
    getDataSource,
    listDataSources,
    statDataSources
};
