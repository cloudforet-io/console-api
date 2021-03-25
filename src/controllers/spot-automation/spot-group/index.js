import grpcClient from '@lib/grpc-client';
import { SUPPORTED_RESOURCE_TYPES } from './config';


const createSpotGroup = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    let response = await spotAutomationV1.SpotGroup.create(params);

    return response;
};

const updateSpotGroup = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    let response = await spotAutomationV1.SpotGroup.update(params);

    return response;
};

const deleteSpotGroup = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    let response = await spotAutomationV1.SpotGroup.delete(params);

    return response;
};

const getSpotGroup = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    let response = await spotAutomationV1.SpotGroup.get(params);

    return response;
};

const listSpotGroups = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    let response = await spotAutomationV1.SpotGroup.list(params);

    return response;
};

const interruptSpotGroups = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    let response = await spotAutomationV1.SpotGroup.interrupt(params);

    return response;
};

const statSpotGroups = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    let response = await spotAutomationV1.SpotGroup.stat(params);

    return response;
};

const getCandidates = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    let response = await spotAutomationV1.SpotGroup.get_candidates(params);

    return response;
};


const getSupportedResourceTypes = () => {
    return SUPPORTED_RESOURCE_TYPES;
};


export {
    createSpotGroup,
    updateSpotGroup,
    deleteSpotGroup,
    getSpotGroup,
    listSpotGroups,
    interruptSpotGroups,
    statSpotGroups,
    getCandidates,
    getSupportedResourceTypes
};
