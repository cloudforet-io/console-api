import path from 'path';
import _ from 'lodash';
import grpc from 'grpc';
import config from 'config';
import { loadSync } from '@grpc/proto-loader';
import protobuf from 'protobufjs';
import descriptor from 'protobufjs/ext/descriptor';
import { createPackageDefinition } from './proto-loader';

const REFLECTION_PROTO_PATH = path.join(__dirname, 'proto/reflection.proto');
const WELLKNOWN_PROTOS = [
  path.join(__dirname, 'proto/query.proto'),
  path.join(__dirname, 'proto/handler.proto'),
  path.join(__dirname, 'proto/empty.proto'),
  path.join(__dirname, 'proto/struct.proto'),
  path.join(__dirname, 'proto/timestamp.proto'),
];
const PACKAGE_OPTIONS = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: false,
  oneofs: false,
  struct: true,
};

class GRPCClient {
  constructor() {
    this.channel = {};
    this.loadDefaultDescriptors();
  }

  loadDefaultDescriptors() {
    this.defaultDescriptors = [];

    WELLKNOWN_PROTOS.map((protoPath) => {
      let root = protobuf.loadSync(protoPath).resolveAll();
      let descriptor = root.toDescriptor();
      this.defaultDescriptors.push(descriptor.file[0]);
    });
  }

  listServices(client) {
    return new Promise((resolve, reject) => {
      let call = client.ServerReflectionInfo();
      let services = [];
      call.on('data', (response) => {
        if (response.error_response) {
          reject(response.error_response);
        } else {
          response.list_services_response.service.map((service) => {
            services.push(service.name);
          });
        }
      });

      call.on('end', () => {
        resolve(services);
      });

      call.on('error', (err) => {
        reject(err);
      });

      call.write({list_services:''});
      call.end();
    });
  }

  listDescriptors(client, services) {
    return new Promise((resolve, reject) => {
      let call = client.ServerReflectionInfo();
      let descriptors = {};

      call.on('data', function(response) {
        if (response.error_response) {
          reject(response.error_response);
        } else {
          response.file_descriptor_response.file_descriptor_proto.map(buf => {
            let fileDescriptroProto = descriptor.FileDescriptorProto.decode(buf);

            descriptors[fileDescriptroProto.name] = {
              dependency: fileDescriptroProto.dependency,
              package: fileDescriptroProto.package.replace(/\./g, '/'),
              file: fileDescriptroProto,
            };
          });
        }
      });

      call.on('end', () => {
        resolve(descriptors);
      });

      call.on('error', (err) => {
        reject(err);
      });

      services.map((serviceName) => {
        call.write({ file_containing_symbol: serviceName });
      });

      call.end();
    });
  }

  getDependentDescriptor(descriptors, key, fileDescriptors) {
    descriptors[key].dependency.map((protoName) => {
      if (protoName.indexOf(descriptors[key].package) === 0) {
        if (!_.find(fileDescriptors, { name: protoName })) {
          fileDescriptors.push(descriptors[protoName].file);
          fileDescriptors = this.getDependentDescriptor(descriptors, protoName, fileDescriptors);
        }
      }
    });

    return fileDescriptors;
  }

  async getChannel(endpoint, descriptors) {
    let channel = {};
    Object.keys(descriptors).map((key) => {
      let fileDescriptors = this.defaultDescriptors.slice();
      let fileDescriptorProto = descriptors[key].file;
      fileDescriptors.unshift(fileDescriptorProto);
      fileDescriptors = this.getDependentDescriptor(descriptors, key, fileDescriptors);

      let root = protobuf.Root.fromDescriptor({file: fileDescriptors});
      root.resolveAll();

      let packageDefinition = createPackageDefinition(root, PACKAGE_OPTIONS);
      let apiClassName = fileDescriptorProto.service[0].name;
      let proto = _.get(grpc.loadPackageDefinition(packageDefinition), fileDescriptorProto.package);
      channel[apiClassName] = new proto[apiClassName](endpoint, grpc.credentials.createInsecure());
    });

    return channel;
  }

  async createChannel(endpoint) {
    let packageDefinition = loadSync(REFLECTION_PROTO_PATH, PACKAGE_OPTIONS);
    let reflectionProto = grpc.loadPackageDefinition(packageDefinition).grpc.reflection.v1alpha;
    let reflectionClient = new reflectionProto.ServerReflection(endpoint, grpc.credentials.createInsecure());

    let services = await this.listServices(reflectionClient);
    let descriptors = await this.listDescriptors(reflectionClient, services);
    let channel = await this.getChannel(endpoint, descriptors);
    return channel;
  }

  get(service, version) {
    let endpoint = config.get(`endpoints.${service}.${version}`);
    let channel_key = `${endpoint}/${version}`;

    if (!(channel_key in this.channel)) {
      this.channel[channel_key] = this.createChannel(endpoint);
    }

    return this.channel[channel_key];
  }
}

export default new GRPCClient();
