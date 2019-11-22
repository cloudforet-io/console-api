import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getSummary = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let reqParams = {
        domain_id: params.domain_id,
        query: {
            count_only: true
        }
    };

    let projectResponse = await identityV1.Project.list(reqParams);
    let networkResponse = await inventoryV1.Network.list(reqParams);
    let cloudServiceResponse = await inventoryV1.CloudService.list(reqParams);

    reqParams.query.filter = [{
        k: 'state',
        v: 'DELETED',
        o: 'not'
    }];

    let serverResponse = await inventoryV1.Server.list(reqParams);

    return {
        project: projectResponse.total_count,
        server: serverResponse.total_count,
        cloud_service: cloudServiceResponse.total_count,
        network: networkResponse.total_count
    };
};

export default getSummary;
