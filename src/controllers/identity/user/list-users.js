import grpcClient from 'lib/grpc-client';
import errorHandler from 'lib/grpc-client/grpc-error';

const listUsers = async (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const identityV1 = await grpcClient.get('identity', 'v1');
      identityV1.Domain.list({}, (err, response) => {
        if (err) {
          reject(errorHandler(err));
        }

        console.log(response);
        resolve(response);
      });
    } catch (e) {
      reject(e);
    }
  });
};

export default listUsers;
