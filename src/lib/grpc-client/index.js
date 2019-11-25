import path from 'path';
import _ from 'lodash';
import grpc from 'grpc';
import config from 'config';
import httpContext from 'express-http-context';
import { loadSync } from '@grpc/proto-loader';
import protobuf from 'protobufjs';
import descriptor from 'protobufjs/ext/descriptor';
import { createPackageDefinition } from './proto-loader';
import grpcErrorHandler from './grpc-error';
import * as wellKnownType from './well-known-type';
import logger from '@lib/logger';

const MAX_RETRIES = 2;
const TIMEOUT = 5;

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

const DEADLINE = () => {
    return {
        deadline: new Date().setSeconds(new Date().getSeconds() + TIMEOUT)
    };
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

    listServices(client, endpoint) {
        return new Promise((resolve, reject) => {
            let call = client.ServerReflectionInfo(DEADLINE());
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
                if (err.code == 4) {
                    let error = new Error(`Server is unavailable. (channel = ${endpoint})`);
                    error.status = 503;
                    error.error_code = 'ERROR_GRPC_CONNECTION';
                    reject(error);
                } else {
                    reject(err);
                }
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

    listDescriptors(client, endpoint, services) {
        return new Promise((resolve, reject) => {
            let call = client.ServerReflectionInfo(DEADLINE());
            let descriptors = {};
            let self = this;

            call.on('data', function(response) {
                if (response.error_response) {
                    reject(response.error_response);
                } else {
                    response.file_descriptor_response.file_descriptor_proto.map(buf => {
                        let fileDescriptorProto = descriptor.FileDescriptorProto.decode(buf);

                        self.preloadMessageType(fileDescriptorProto);

                        descriptors[fileDescriptorProto.name] = {
                            dependency: fileDescriptorProto.dependency,
                            package: fileDescriptorProto.package.replace(/\./g, '/'),
                            file: fileDescriptorProto
                        };
                    });
                }
            });

            call.on('end', () => {
                Object.keys(descriptors).map((key) => {
                    self.preloadMethod(descriptors[key].file);
                });

                resolve(descriptors);
            });

            call.on('error', (err) => {
                if (err.code == 4) {
                    let error = new Error(`Server is unavailable. (channel = ${endpoint})`);
                    error.status = 503;
                    error.error_code = 'ERROR_GRPC_CONNECTION';
                    reject(error);
                } else {
                    reject(err);
                }
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

    getMetadata() {
        let grpcMeta = new grpc.Metadata();
        let token = httpContext.get('token');
        let transactionId = httpContext.get('transaction_id');

        if (token) {
            grpcMeta.add('token', token);
        }

        if (transactionId) {
            grpcMeta.add('transaction_id', transactionId);
        }

        return grpcMeta;
    }

    unaryUnaryMethod(client, func) {
        return (params) => {
            return new Promise((resolve, reject) => {
                try {
                    let metadata = this.getMetadata();
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
                    let metadata = this.getMetadata();
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
                    if (!(params.data && Array.isArray(params.data))) {
                        throw new Error('Parameter type is invalid. (data = Array)');
                    }

                    let metadata = this.getMetadata();
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

                    params.data.map((p) => {
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
                    if (!(params.data && Array.isArray(params.data))) {
                        throw new Error('Parameter type is invalid. (data = Array)');
                    }
                    let responses = [];
                    let metadata = this.getMetadata();
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

                    params.data.map((p) => {
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
        let domainId = httpContext.get('domainId');

        if (domainId) {
            params.domain_id = domainId;
        }

        logger.debug(`GRPC-REQUEST(${grpcPath}) => ${JSON.stringify(params)}`);
        wellKnownType.convertMessage(params, this.grpcMethods[grpcPath].input);
        //logger.debug(JSON.stringify(params));
    }

    responseInterceptor(grpcPath, response) {
        wellKnownType.convertMessage(response, this.grpcMethods[grpcPath].output);
        //logger.debug(`GRPC-RESPONSE => ${JSON.stringify(response)}`);
    }

    retryInterceptor(options, nextCall) {
        let savedMetadata, savedReceiveMessage, savedMessageNext, savedSendMessage;
        let requester = {
            start(metadata, listener, next) {
                savedMetadata = metadata;
                next(metadata, {
                    onReceiveMessage(message, next) {
                        savedReceiveMessage = message;
                        savedMessageNext = next;
                    },
                    onReceiveStatus: function (status, next) {
                        logger.debug(`Reconnect gRPC channel: ${ options.method_definition.path }`);
                        let retries = 0;
                        let retryCall = (message, metadata) => {
                            retries++;
                            let newCall = nextCall(options);
                            let retryListner = {
                                onReceiveMessage(message) {
                                    savedReceiveMessage = message;
                                },
                                onReceiveStatus(status) {
                                    if (status.code === grpc.status.UNAVAILABLE && retries <= MAX_RETRIES) {
                                        retryCall(message, metadata);
                                    } else {
                                        savedMessageNext(savedReceiveMessage);
                                        next(status);
                                    }
                                }
                            };

                            newCall.start(metadata, retryListner);
                            newCall.sendMessage(savedSendMessage);
                            newCall.halfClose();
                        };

                        if (status.code === grpc.status.UNAVAILABLE) {
                            retryCall(savedSendMessage, savedMetadata);
                        } else {
                            savedMessageNext(savedReceiveMessage);
                            next(status);
                        }
                    }
                });
            },
            sendMessage(message, next) {
                savedSendMessage = message;
                next(message);
            }
        };

        return new grpc.InterceptingCall(nextCall(options), requester);
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
            let options = {
                interceptors: [this.retryInterceptor]
            }

            channel[serviceName] = new proto[serviceName](endpoint, grpc.credentials.createInsecure(), options);
            this.promisify(channel[serviceName]);
        });

        return channel;
    }

    async createChannel(endpoint) {
        let packageDefinition = loadSync(REFLECTION_PROTO_PATH, PACKAGE_OPTIONS);
        let reflectionProto = grpc.loadPackageDefinition(packageDefinition).grpc.reflection.v1alpha;
        let reflectionClient = new reflectionProto.ServerReflection(endpoint, grpc.credentials.createInsecure());

        let services = await this.listServices(reflectionClient, endpoint);
        let descriptors = await this.listDescriptors(reflectionClient, endpoint, services);
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
