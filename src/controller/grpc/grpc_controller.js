import path from 'path';
import { loadSync } from '@grpc/proto-loader';
import grpc from 'grpc';

const protoFiles = require.resolve('protobufjs');

const PROTO_PATH = path.join(__dirname, '/../../proto/cloudone/api/identity/v1/domain.proto');
const PROTO_CORE = [
    './proto',
    path.dirname(protoFiles)
];

const packageDefinition = loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: PROTO_CORE
    }
);

const domainProto = grpc.loadPackageDefinition(packageDefinition).cloudone.api.identity.v1;

function test() {
  // const client = new domainProto.Domain('54.180.176.16:50052', grpc.credentials.createInsecure());

  // client.create({ name: 'wanjin03', plugin_id: '2' }, (err, response) => {
  //   if (err) {
  //     console.error('err', err);
  //     return;
  //   }
  //   console.log('domain:', response);
  // });
}

export default {
    test
};
