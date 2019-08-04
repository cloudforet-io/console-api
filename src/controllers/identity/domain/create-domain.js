import grpcClient from 'lib/grpc-client';
import errorHandler from 'lib/grpc-client/grpc-error';

const createDomain = async (params) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identityV1 = await grpcClient.get('identity', 'v1');
            identityV1.Domain.create(params, (err, response) => {
                if (err) {
                    reject(errorHandler(err));
                }

                resolve(response);
            });
        } catch (e) {
            reject(e);
        }
    });
};

export default createDomain;
