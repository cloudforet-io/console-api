import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getBillingData = async (params) => {
    let billingV1 = await grpcClient.get('billing', 'v1');
    let response = await billingV1.Billing.getData(params);

    return response;
};

export {
    getBillingData
};
