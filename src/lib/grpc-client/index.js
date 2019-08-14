import path from 'path';
import _ from 'lodash';
import grpc from 'grpc';
import config from 'config';
import { loadSync } from '@grpc/proto-loader';
import protobuf from 'protobufjs';
import descriptor from 'protobufjs/ext/descriptor';
import { createPackageDefinition } from './proto-loader';
import grpcErrorHandler from './grpc-error';
import * as wellKnownType from './well-known-type';

const REFLECTION_PROTO_PATH = path.join(__dirname, 'proto/reflection.proto');
const WELLKNOWN_PROTOS = [
    path.join(__dirname, 'proto/query.proto'),
    path.join(__dirname, 'proto/handler.proto'),
    path.join(__dirname, 'proto/empty.proto'),
    path.join(__dirname, 'proto/struct.proto'),
    path.join(__dirname, 'proto/timestamp.proto')
];

const WELLKNOWN_MESSAGE_TYPES = {
    '.google.protobuf.Struct': wellKnownType.struct,
    '.google.protobuf.ListValue': wellKnownType.listValue,
    '.google.protobuf.Value': wellKnownType.value
};

const PACKAGE_OPTIONS = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

class GRPCClient {
    constructor() {
        this.channel = {};
        this.grpcMethods = {};
        this.messageTypes = {};
        this.loadDefaultDescriptors();
    }

    loadDefaultDescriptors() {
        this.defaultDescriptors = [];

        WELLKNOWN_PROTOS.map((protoPath) => {
            var root = new protobuf.Root();
            var loadedRoot = root.loadSync(protoPath, PACKAGE_OPTIONS);
            loadedRoot.resolveAll();
            let descriptor = root.toDescriptor();
            this.defaultDescriptors.push(descriptor.file[0]);

            if (!descriptor.file[0].package.startsWith('google')) {
                this.preloadMessageType(descriptor.file[0]);
            }
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

    resolveWellknownType(action, messageType, parentKey) {
        if (messageType in WELLKNOWN_MESSAGE_TYPES) {
            return WELLKNOWN_MESSAGE_TYPES[messageType][action];
        } else {
            let fields = this.messageTypes[messageType];

            if (fields)
            {
                let changeFunc = {};
                Object.keys(fields).map((key) => {
                    if (parentKey != key) {
                        let func = this.resolveWellknownType(action, fields[key], key);

                        if (func) {
                            changeFunc[key] = func;
                        }
                    }
                });

                if (Object.keys(changeFunc).length === 0) {
                    return;
                } else {
                    return changeFunc;
                }

            } else {
                return;
            }


        }
    }

    preloadMethod(fileDescriptorProto) {
        let packageName = fileDescriptorProto.package;
        fileDescriptorProto.service.map((service) => {
            let serviceName = service.name;
            service.method.map((method) => {
                let grpcMethod = `/${packageName}.${serviceName}/${method.name}`;
                this.grpcMethods[grpcMethod] = {
                    input: this.resolveWellknownType('encode', method.inputType),
                    output: this.resolveWellknownType('decode', method.outputType)
                };
            });
        });
    }

    preloadMessageType(fileDescriptorProto) {
        let packageName = fileDescriptorProto.package;
        fileDescriptorProto.messageType.map((messageType) => {
            let messageTypeName = `.${packageName}.${messageType.name}`;
            this.messageTypes[messageTypeName] = {};
            messageType.field.map((field) => {
                if (field.typeName)
                {
                    let typeName = field.typeName;

                    if (!typeName.startsWith('.')) {
                        if(typeName.split('.').length === 1)
                        {
                            typeName = `.${packageName}.${typeName}`;
                        } else {
                            typeName = `.${typeName}`;
                        }
                    }

                    this.messageTypes[messageTypeName][field.name] = typeName;
                }
            });
        });
    }

    listDescriptors(client, services) {
        return new Promise((resolve, reject) => {
            let call = client.ServerReflectionInfo();
            let descriptors = {};
            let self = this;

            call.on('data', function(response) {
                if (response.error_response) {
                    reject(response.error_response);
                } else {
                    response.file_descriptor_response.file_descriptor_proto.map(buf => {
                        let fileDescriptorProto = descriptor.FileDescriptorProto.decode(buf);

                        self.preloadMessageType(fileDescriptorProto);
                        self.preloadMethod(fileDescriptorProto);

                        descriptors[fileDescriptorProto.name] = {
                            dependency: fileDescriptorProto.dependency,
                            package: fileDescriptorProto.package.replace(/\./g, '/'),
                            file: fileDescriptorProto
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

    getMetadata(params) {
        let metadata = params._meta || {};
        let grpcMeta = new grpc.Metadata();

        Object.keys(metadata).map((key) => {
            grpcMeta.add(key, metadata[key]);
        });

        return grpcMeta;
    }

    unaryUnaryMethod(client, func) {
        return (params) => {
            return new Promise((resolve, reject) => {
                try {
                    let metadata = this.getMetadata(params);
                    this.requestInterceptor(func.path, params);
                    func.call(client, params, metadata, (err, response) => {
                        if (err) {
                            reject(grpcErrorHandler(err));
                        } else {
                            this.responseInterceptor(func.path, response);
                            resolve(response);
                        }
                    });
                } catch (e) {
                    reject(grpcErrorHandler(e));
                }
            });
        };
    }

    unaryStreamMethod(client, func) {
        return (params) => {
            return new Promise((resolve, reject) => {
                try {
                    let responses = [];
                    let metadata = this.getMetadata(params);
                    this.requestInterceptor(func.path, params);
                    let call = func.call(client, params, metadata);
                    call.on('data', (response) => {
                        this.responseInterceptor(func.path, response);
                        responses.push(response);
                    });

                    call.on('error', (err) => {
                        reject(grpcErrorHandler(err));
                    });

                    call.on('end', () => {
                        resolve(responses);
                    });

                } catch (e) {
                    reject(grpcErrorHandler(e));
                }
            });
        };
    }

    streamUnaryMethod(client, func) {
        return (params) => {
            return new Promise((resolve, reject) => {
                try {
                    let metadata = this.getMetadata(params);
                    let call = func.call(client, metadata, (err, response) => {
                        if (err) {
                            reject(grpcErrorHandler(err));
                        } else {
                            this.responseInterceptor(func.path, response);
                            resolve(response);
                        }
                    });

                    call.on('error', (err) => {
                        reject(grpcErrorHandler(err));
                    });

                    params.map((p) => {
                        this.requestInterceptor(func.path, p);
                        call.write(p);
                    });

                    call.end();

                } catch (e) {
                    reject(grpcErrorHandler(e));
                }
            });
        };
    }

    streamStreamMethod(client, func) {
        return (params) => {
            return new Promise((resolve, reject) => {
                try {
                    let responses = [];
                    let metadata = this.getMetadata(params);
                    let call = func.call(client, metadata);
                    call.on('data', (response) => {
                        this.responseInterceptor(func.path, response);
                        responses.push(response);
                    });

                    call.on('error', (err) => {
                        reject(grpcErrorHandler(err));
                    });


                    call.on('end', () => {
                        resolve(responses);
                    });

                    params.map((p) => {
                        this.requestInterceptor(func.path, p);
                        call.write(p);
                    });

                    call.end();

                } catch (e) {
                    reject(grpcErrorHandler(e));
                }
            });
        };
    }

    promisify(client) {
        Object.keys(Object.getPrototypeOf(client)).map((funcName) => {
            if (funcName.indexOf('$') != 0) {
                let func = client[funcName];
                if (func.requestStream === false && func.responseStream === false) {
                    client[funcName] = this.unaryUnaryMethod(client, func);
                } else if (func.requestStream === false && func.responseStream === true) {
                    client[funcName] = this.unaryStreamMethod(client, func);
                } else if (func.requestStream === true && func.responseStream === false) {
                    client[funcName] = this.streamUnaryMethod(client, func);
                } else {
                    client[funcName] = this.streamStreamMethod(client, func);
                }
            }
        });
    }

    requestInterceptor(grpcPath, params) {
        let requestParams = _.clone(params);
        delete requestParams._meta;
        console.log('[GRPC-REQUEST]', grpcPath, requestParams);
        wellKnownType.convertMessage(requestParams, this.grpcMethods[grpcPath].input);
    }

    responseInterceptor(grpcPath, response) {
        wellKnownType.convertMessage(response, this.grpcMethods[grpcPath].output);
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
            let serviceName = fileDescriptorProto.service[0].name;
            let proto = _.get(grpc.loadPackageDefinition(packageDefinition), fileDescriptorProto.package);
            channel[serviceName] = new proto[serviceName](endpoint, grpc.credentials.createInsecure());
            this.promisify(channel[serviceName]);
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
        let channelKey = `${endpoint}/${version}`;

        if (!(channelKey in this.channel)) {
            this.channel[channelKey] = this.createChannel(endpoint);
        }

        return this.channel[channelKey];
    }
}

export default new GRPCClient();
