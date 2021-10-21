import grpcClient from '@lib/grpc-client';

const getBillingData = async (params) => {
    const billingV1 = await grpcClient.get('billing', 'v1');
    const response = await billingV1.Billing.getData(params);

    return response;
};

export {
    getBillingData
};
