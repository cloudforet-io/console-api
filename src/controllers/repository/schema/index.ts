import grpcClient from '@lib/grpc-client';

const createSchema = async (params) => {
    const repositoryV1 = await grpcClient.get('repository', 'v1');
    const response = await repositoryV1.Schema.create(params);

    return response;
};

const updateSchema = async (params) => {
    const repositoryV1 = await grpcClient.get('repository', 'v1');
    const response = await repositoryV1.Schema.update(params);

    return response;
};


const deleteSchema = async (params) => {
    const repositoryV1 = await grpcClient.get('repository', 'v1');
    const response = await repositoryV1.Schema.delete(params);

    return response;
};

const getSchema = async (params) => {
    const repositoryV1 = await grpcClient.get('repository', 'v1');
    const response = await repositoryV1.Schema.get(params);

    return response;
};

const listSchemas = async (params) => {
    const repositoryV1 = await grpcClient.get('repository', 'v1');
    const response = await repositoryV1.Schema.list(params);

    return response;
};

const statSchemas = async (params) => {
    const repositoryV1 = await grpcClient.get('repository', 'v1');
    const response = await repositoryV1.Schema.stat(params);

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

