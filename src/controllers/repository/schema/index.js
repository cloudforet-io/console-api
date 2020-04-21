import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createSchema = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Schema.create(params);

    return response;
};

const updateSchema = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Schema.update(params);

    return response;
};


const deleteSchema = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Schema.delete(params);

    return response;
};

const getSchema = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Schema.get(params);

    return response;
};

const listSchemas = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Schema.list(params);

    return response;
};

const statSchemas = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Schema.stat(params);

    return response;
};

export {
    createSchema,
    updateSchema,
    deleteSchema,
    getSchema,
    listSchemas,
    statSchemas
};

