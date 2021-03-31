//@ts-nocheck
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
    path.join(__dirname, 'proto/tag.proto'),
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

        WELLKNOWN_PROTOS.forEach((protoPath) => {
            const root = new protobuf.Root();
            const loadedRoot = root.loadSync(protoPath, PACKAGE_OPTIONS);
            loadedRoot.resolveAll();
            const descriptor = root.toDescriptor();
            this.defaultDescriptors.push(descriptor.file[0]);

            if (!descriptor.file[0].package.startsWith('google')) {
                this.preloadMessageType(descriptor.file[0]);
            }
        });
    }

    listServices(client, endpoint) {
        return new Promise((resolve, reject) => {
            const call = client.ServerReflectionInfo(DEADLINE());
            const services = [];
            call.on('data', (response) => {
                if (response.error_response) {
                    reject(response.error_response);
                } else {
                    response.list_services_response.service.forEach((service) => {
                        services.push(service.name);
                    });
                }
            });

            call.on('end', () => {
                resolve(services);
            });

            call.on('error', (err) => {
                if (err.code == 4) {
                    const error = new Error(`Server is unavailable. (channel = ${endpoint})`);
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
            const fields = this.messageTypes[messageType];
            if (fields)
            {
                const changeFunc = {};
                Object.keys(fields).forEach((key) => {
                    // TODO: fix a query field bug
                    if (parentKey !== key || (parentKey === 'query' && key === 'query')) {
                        const func = this.resolveWellknownType(action, fields[key], key);

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
        const packageName = fileDescriptorProto.package;
        fileDescriptorProto.service.forEach((service) => {
            const serviceName = service.name;
            service.method.forEach((method) => {
                const grpcMethod = `/${packageName}.${serviceName}/${method.name}`;
                this.grpcMethods[grpcMethod] = {
                    input: this.resolveWellknownType('encode', method.inputType),
                    output: this.resolveWellknownType('decode', method.outputType)
                };
            });
        });
    }

    preloadMessageType(fileDescriptorProto) {
        const packageName = fileDescriptorProto.package;
        fileDescriptorProto.messageType.forEach((messageType) => {
            const messageTypeName = `.${packageName}.${messageType.name}`;
            this.messageTypes[messageTypeName] = {};
            messageType.field.forEach((field) => {
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
            const call = client.ServerReflectionInfo(DEADLINE());
            const descriptors = {};
            const self = this;

            call.on('data', function(response) {
                if (response.error_response) {
                    reject(response.error_response);
                } else {
                    response.file_descriptor_response.file_descriptor_proto.forEach(buf => {
                        const fileDescriptorProto = descriptor.FileDescriptorProto.decode(buf);

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
                Object.keys(descriptors).forEach((key) => {
                    self.preloadMethod(descriptors[key].file);
                });

                resolve(descriptors);
            });

            call.on('error', (err) => {
                if (err.code == 4) {
                    const error = new Error(`Server is unavailable. (channel = ${endpoint})`);
                    error.status = 503;
                    error.error_code = 'ERROR_GRPC_CONNECTION';
                    reject(error);
                } else {
                    reject(err);
                }
            });

            services.forEach((serviceName) => {
                call.write({ file_containing_symbol: serviceName });
            });

            call.end();
        });
    }

    getDependentDescriptor(descriptors, key, fileDescriptors) {
        descriptors[key].dependency.forEach((protoName) => {
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
        const grpcMeta = new grpc.Metadata();
        const token = httpContext.get('token');
        const transactionId = httpContext.get('transaction_id');

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
                    const metadata = this.getMetadata();
                    this.requestInterceptor(func.path, params);
                    func.call(client, params, metadata, (err, response) => {
                        if (err) {
                            reject(grpcErrorHandler(err));
                        } else {
                            resolve(this.responseInterceptor(func.path, response));
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
                    const responses = [];
                    const metadata = this.getMetadata();
                    this.requestInterceptor(func.path, params);
                    const call = func.call(client, params, metadata);
                    call.on('data', (response) => {
                        responses.push(this.responseInterceptor(func.path, response));
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

                    const metadata = this.getMetadata();
                    const call = func.call(client, metadata, (err, response) => {
                        if (err) {
                            reject(grpcErrorHandler(err));
                        } else {
                            resolve(this.responseInterceptor(func.path, response));
                        }
                    });

                    call.on('error', (err) => {
                        reject(grpcErrorHandler(err));
                    });

                    params.data.forEach((p) => {
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
                    const responses = [];
                    const metadata = this.getMetadata();
                    const call = func.call(client, metadata);
                    call.on('data', (response) => {
                        responses.push(this.responseInterceptor(func.path, response));
                    });

                    call.on('error', (err) => {
                        reject(grpcErrorHandler(err));
                    });


                    call.on('end', () => {
                        resolve(responses);
                    });

                    params.data.forEach((p) => {
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
        Object.keys(Object.getPrototypeOf(client)).forEach((funcName) => {
            if (funcName.indexOf('$') != 0) {
                const func = client[funcName];
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
        const domainId = httpContext.get('domain_id');

        if (domainId) {
            params.domain_id = domainId;
        }

        // logger.debug(`GRPC-REQUEST(${grpcPath}) => ${JSON.stringify(params)}`);
        const changeRequest = wellKnownType.convertMessage(params, this.grpcMethods[grpcPath].input);
        // logger.debug(`GRPC-CHANGE-REQUEST(${grpcPath}) => ${JSON.stringify(params)}`);
        return changeRequest;
    }

    responseInterceptor(grpcPath, response) {
        const changeResponse = wellKnownType.convertMessage(response, this.grpcMethods[grpcPath].output);
        // logger.debug(`GRPC-RESPONSE => ${JSON.stringify(changeResponse)}`);
        return changeResponse;
    }

    retryInterceptor(options, nextCall) {
        let savedMetadata, savedReceiveMessage, savedMessageNext, savedSendMessage;
        const requester = {
            start(metadata, listener, next) {
                savedMetadata = metadata;
                next(metadata, {
                    onReceiveMessage(message, next) {
                        savedReceiveMessage = message;
                        savedMessageNext = next;
                    },
                    onReceiveStatus: function (status, next) {
                        let retries = 0;
                        const retryCall = (message, metadata) => {
                            retries++;
                            const newCall = nextCall(options);
                            const retryListner = {
                                onReceiveMessage(message) {
                                    savedReceiveMessage = message;
                                },
                                onReceiveStatus(status) {
                                    if (status.code === grpc.status.UNAVAILABLE && retries <= MAX_RETRIES) {
                                        logger.warn(`Reconnect gRPC channel: ${ options.method_definition.path }`);
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
        const channel = {};
        Object.keys(descriptors).forEach((key) => {
            let fileDescriptors = this.defaultDescriptors.slice();
            const fileDescriptorProto = descriptors[key].file;
            fileDescriptors.unshift(fileDescriptorProto);
            fileDescriptors = this.getDependentDescriptor(descriptors, key, fileDescriptors);

            const root = protobuf.Root.fromDescriptor({file: fileDescriptors});
            root.resolveAll();

            const packageDefinition = createPackageDefinition(root, PACKAGE_OPTIONS);
            const serviceName = fileDescriptorProto.service[0].name;
            const proto = _.get(grpc.loadPackageDefinition(packageDefinition), fileDescriptorProto.package);

            const gRPCMaxMessageLength = config.get('grpc.max_message_length') || 1024*1024*256;

            const options = {
                interceptors: [this.retryInterceptor],
                'grpc.max_receive_message_length': gRPCMaxMessageLength,
                'grpc.max_send_message_length': gRPCMaxMessageLength
            };

            channel[serviceName] = new proto[serviceName](endpoint, grpc.credentials.createInsecure(), options);
            this.promisify(channel[serviceName]);
        });

        return channel;
    }

    async createChannel(endpoint) {
        const packageDefinition = loadSync(REFLECTION_PROTO_PATH, PACKAGE_OPTIONS);
        const reflectionProto = grpc.loadPackageDefinition(packageDefinition).grpc.reflection.v1alpha;
        const reflectionClient = new reflectionProto.ServerReflection(endpoint, grpc.credentials.createInsecure());

        const services = await this.listServices(reflectionClient, endpoint);
        const descriptors = await this.listDescriptors(reflectionClient, endpoint, services);
        const channel = await this.getChannel(endpoint, descriptors);
        return channel;
    }

    get(service, version='v1') {
        const endpoint = config.get(`endpoints.${service}.${version}`);
        const channelKey = `${endpoint}/${version}`;

        if (!(channelKey in this.channel)) {
            logger.debug(`Create gRPC Connection: ${channelKey}`);
            this.channel[channelKey] = this.createChannel(endpoint);
        }

        return this.channel[channelKey];
    }
}

export default new GRPCClient();
