import grpcClient from '@lib/grpc-client';
import { pageItems, filterItems, changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';

const createCredentialGroup = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.CredentialGroup.create(params);

    return response;
};

const updateCredentialGroup = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.CredentialGroup.update(params);

    return response;
};


const deleteCredentialGroup = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.CredentialGroup.delete(params);

    return response;
};

const getCredentialGroup = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.CredentialGroup.get(params);

    return response;
};

const listCredentialGroups = async (params) => {
    changeQueryKeyword(params.query, ['credential_group_id', 'name']);
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.CredentialGroup.list(params);

    return response;
};

const listCredentials = async (params) => {
    let query = params.query || {};
    let credentialGroupInfo = await getCredentialGroup(params);

    let response = {
        results: credentialGroupInfo.credentials || []
    };

    if (query.keyword) {
        response.results = filterItems(response.results, query.keyword, ['credential_id', 'name']);
    }

    if (query.page) {
        response.results = pageItems(response.results, query.page);
    }

    response.total_count = response.results.length;

    return response;
};

export {
    createCredentialGroup,
    updateCredentialGroup,
    deleteCredentialGroup,
    getCredentialGroup,
    listCredentialGroups,
    listCredentials
};
