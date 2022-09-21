import grpcClient from '@lib/grpc-client';

const createTrustedSecret = async (params) => {
    if (['CREDENTIALS','CONFIG'].indexOf(params.secret_type) === -1) {
        throw new Error('Wrong enum value. (secret_type = CREDENTIALS | CONFIG');
    }
    const secretV1 = await grpcClient.get('secret', 'v1');
    const response = await secretV1.TrustedSecret.create(params);

    return response;
};

const updateTrustedSecret = async (params) => {
    const secretV1 = await grpcClient.get('secret', 'v1');
    const response = await secretV1.TrustedSecret.update(params);

    return response;
};

const deleteTrustedSecret = async (params) => {
    const secretV1 = await grpcClient.get('secret', 'v1');
    const response = await secretV1.TrustedSecret.delete(params);

    return response;
};

const updateTrustedSecretData = async (params) => {
    const secretV1 = await grpcClient.get('secret', 'v1');
    const response = await secretV1.TrustedSecret.update_data(params);

    return response;
};

const getTrustedSecret = async (params) => {
    const secretV1 = await grpcClient.get('secret', 'v1');
    const response = await secretV1.TrustedSecret.get(params);

    return response;
};

const listTrustedSecrets = async (params) => {
    const secretV1 = await grpcClient.get('secret', 'v1');
    const response = await secretV1.TrustedSecret.list(params);

    return response;
};


const statTrustedSecrets = async (params) => {
    const secretV1 = await grpcClient.get('secret', 'v1');
    const response = await secretV1.TrustedSecret.stat(params);

    return response;
};


export {
    createTrustedSecret,
    updateTrustedSecret,
    deleteTrustedSecret,
    updateTrustedSecretData,
    getTrustedSecret,
    listTrustedSecrets,
    statTrustedSecrets
};
