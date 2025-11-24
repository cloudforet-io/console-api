import path from 'path';
import url from 'url';

import * as grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import config from 'config';
import httpContext from 'express-http-context';
import { find, get } from 'lodash';
import protobuf from 'protobufjs';
import descriptor from 'protobufjs/ext/descriptor';

import { ErrorModel } from '@lib/error';
import logger from '@lib/logger';

import grpcErrorHandler from './grpc-error';
import { createPackageDefinition } from './proto-loader';
import * as wellKnownType from './well-known-type';


const MAX_RETRIES = 2;
const TIMEOUT = 5;
const GRPC_CHANNEL = {};

const REFLECTION_PROTO_PATH = path.join(__dirname, 'proto/reflection.proto');
const WELLKNOWN_PROTOS = [
    path.join(__dirname, 'proto/query_v1.proto'),
    path.join(__dirname, 'proto/query_v2.proto'),
    path.join(__dirname, 'proto/handler.proto'),
    path.join(__dirname, 'proto/plugin.proto'),
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
    private grpcMethods: {};
    private messageTypes: {};
    private defaultDescriptors?: any[];

    constructor() {
        this.grpcMethods = {};
        this.messageTypes = {};
        this.loadDefaultDescriptors();
    }

    loadDefaultDescriptors() {
        this.defaultDescriptors = [];

        WELLKNOWN_PROTOS.forEach((protoPath) => {
            const root: any = new protobuf.Root();
            const loadedRoot = root.loadSync(protoPath, PACKAGE_OPTIONS);
            loadedRoot.resolveAll();
            const descriptor = root.toDescriptor();
            this.defaultDescriptors?.push(descriptor.file[0]);

            if (!descriptor.file[0].package.startsWith('google')) {
                this.preloadMessageType(descriptor.file[0]);
            }
        });
    }

    listServices(client, endpoint) {
        return new Promise((resolve, reject) => {
            const call = client.ServerReflectionInfo(DEADLINE());
            const services: any = [];
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
                    const error: ErrorModel = new Error(`Server is unavailable. (channel = ${endpoint})`);
                    error.status = 503;
                    error.error_code = 'ERROR_GRPC_CONNECTION';
                    reject(error);
                } else {
                    reject(err);
                }
            });

            call.write({ list_services: '' });
            call.end();
        });
    }

    resolveWellknownType(action, messageType, parentKey?: string) {
        if (messageType in WELLKNOWN_MESSAGE_TYPES) {
            return WELLKNOWN_MESSAGE_TYPES[messageType][action];
        } else {
            const fields = this.messageTypes[messageType];
            if (fields) {
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
                if (field.typeName) {
                    let typeName = field.typeName;

                    if (!typeName.startsWith('.')) {
                        if (typeName.split('.').length === 1) {
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

            call.on('data', function (response) {
                if (response.error_response) {
                    reject(response.error_response);
                } else {
                    response.file_descriptor_response.file_descriptor_proto.forEach(buf => {
                        const fileDescriptorProto: any = descriptor.FileDescriptorProto.decode(buf);

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
                    const error: ErrorModel = new Error(`Server is unavailable. (channel = ${endpoint})`);
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
                if (!find(fileDescriptors, { name: protoName })) {
                    fileDescriptors.push(descriptors[protoName].file);
                    fileDescriptors = this.getDependentDescriptor(descriptors, protoName, fileDescriptors);
                }
            }
        });

        return fileDescriptors;
    }

    getMetadata(grpcEndpoint) {
        const grpcMeta = new grpc.Metadata();
        grpcMeta.add('grpc_endpoint', grpcEndpoint);
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

    unaryUnaryMethod(client, func, grpcEndpoint) {
        return (params) => {
            return new Promise((resolve, reject) => {
                try {
                    const metadata = this.getMetadata(grpcEndpoint);
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

    unaryStreamMethod(client, func, grpcEndpoint) {
        return (params) => {
            return new Promise((resolve, reject) => {
                try {
                    const responses: any = [];
                    const metadata = this.getMetadata(grpcEndpoint);
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

    streamUnaryMethod(client, func, grpcEndpoint) {
        return (params) => {
            return new Promise((resolve, reject) => {
                try {
                    if (!(params.data && Array.isArray(params.data))) {
                        throw new Error('Parameter type is invalid. (data = Array)');
                    }

                    const metadata = this.getMetadata(grpcEndpoint);
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

    streamStreamMethod(client, func, grpcEndpoint) {
        return (params) => {
            return new Promise((resolve, reject) => {
                try {
                    if (!(params.data && Array.isArray(params.data))) {
                        throw new Error('Parameter type is invalid. (data = Array)');
                    }
                    const responses: any = [];
                    const metadata = this.getMetadata(grpcEndpoint);
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

    promisify(client, grpcEndpoint) {
        Object.keys(Object.getPrototypeOf(client)).forEach((funcName) => {
            if (funcName.indexOf('$') != 0) {
                const func = client[funcName];
                if (func.requestStream === false && func.responseStream === false) {
                    client[funcName] = this.unaryUnaryMethod(client, func, grpcEndpoint);
                } else if (func.requestStream === false && func.responseStream === true) {
                    client[funcName] = this.unaryStreamMethod(client, func, grpcEndpoint);
                } else if (func.requestStream === true && func.responseStream === false) {
                    client[funcName] = this.streamUnaryMethod(client, func, grpcEndpoint);
                } else {
                    client[funcName] = this.streamStreamMethod(client, func, grpcEndpoint);
                }
            }
        });
    }

    requestInterceptor(grpcPath, params) {
        const userDomainId = httpContext.get('domain_id');

        if (!('domain_id' in params) && userDomainId) {
            params.domain_id = userDomainId;
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
                            const retryListener = {
                                onReceiveMessage(message) {
                                    savedReceiveMessage = message;
                                },
                                onReceiveStatus(status) {
                                    if (status.code === grpc.status.UNAVAILABLE) {
                                        const grpcEndpoint = metadata.get('grpc_endpoint')[0];
                                        if (retries > MAX_RETRIES) {
                                            if (grpcEndpoint in GRPC_CHANNEL) {
                                                logger.error(`Disconnect gRPC channel: ${grpcEndpoint}`);
                                                delete GRPC_CHANNEL[grpcEndpoint];
                                            }
                                            savedMessageNext(savedReceiveMessage);
                                            next(status);
                                        } else {
                                            logger.warn(`Reconnect gRPC channel: ${grpcEndpoint}`);
                                            retryCall(message, metadata);
                                        }
                                    } else {
                                        savedMessageNext(savedReceiveMessage);
                                        next(status);
                                    }
                                }
                            };

                            newCall.start(metadata, retryListener);
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

    async getChannel(grpcEndpoint, descriptors, credentials) {
        const channel = {};
        Object.keys(descriptors).forEach((key) => {
            let fileDescriptors: any = this.defaultDescriptors?.slice();
            const fileDescriptorProto = descriptors[key].file;
            fileDescriptors.unshift(fileDescriptorProto);
            fileDescriptors = this.getDependentDescriptor(descriptors, key, fileDescriptors);

            const root = (protobuf.Root as any).fromDescriptor({ file: fileDescriptors });
            root.resolveAll();

            const packageDefinition = createPackageDefinition(root, PACKAGE_OPTIONS);
            const serviceName = fileDescriptorProto.service[0].name;
            const proto = get(grpc.loadPackageDefinition(packageDefinition), fileDescriptorProto.package);

            const gRPCMaxMessageLength = config.get('grpc.max_message_length') || 1024 * 1024 * 256;

            const options = {
                interceptors: [this.retryInterceptor],
                'grpc.max_receive_message_length': gRPCMaxMessageLength,
                'grpc.max_send_message_length': gRPCMaxMessageLength
            };

            channel[serviceName] = new proto[serviceName](grpcEndpoint, credentials, options);
            this.promisify(channel[serviceName], grpcEndpoint);
        });

        return channel;
    }

    parseEndpoint(endpoint: string, version: string) {
        const urlInfo: any = url.parse(endpoint);
        let sslEnabled = false;

        if (urlInfo.protocol === 'grpc:') {
            sslEnabled = false;
        } else if (urlInfo.protocol === 'grpc+ssl:') {
            sslEnabled = true;
        } else {
            throw new Error(`Unsupported protocol. (supported_protocol=grpc|grpc+ssl, endpoint=${endpoint})`);
        }

        if (urlInfo.pathname !== null && urlInfo.pathname?.length > 1) {
            version = urlInfo.pathname.substring(1);
        }

        return {
            host: urlInfo.hostname,
            port: urlInfo.port,
            sslEnabled,
            version,
            url: urlInfo.href
        };
    }

    async createCredentials(endpointInfo) {
        if (endpointInfo.sslEnabled) {
      // Use default SSL credentials with system's root certificates
      // This will work with valid SSL certificates from trusted CAs
            return grpc.credentials.createSsl();
        } else {
            return grpc.credentials.createInsecure();
        }
    }

    async createChannel(endpointInfo) {
        const grpcEndpoint = `${endpointInfo.host}:${endpointInfo.port}`;
        const credentials = await this.createCredentials(endpointInfo);

        const packageDefinition = loadSync(REFLECTION_PROTO_PATH, PACKAGE_OPTIONS);
        const reflectionProto = (grpc.loadPackageDefinition(packageDefinition).grpc as any).reflection.v1alpha;
        const reflectionClient = new reflectionProto.ServerReflection(grpcEndpoint, credentials);

        const services = await this.listServices(reflectionClient, grpcEndpoint);
        const descriptors = await this.listDescriptors(reflectionClient, grpcEndpoint, services);
        const channel = await this.getChannel(grpcEndpoint, descriptors, credentials);
        return channel;
    }

    async get(service, version = 'v1') {
        const endpoint = config.get(`endpoints.${service}`);
        const endpointInfo = this.parseEndpoint(endpoint, version);
        const grpcEndpoint = `${endpointInfo.host}:${endpointInfo.port}`;

        if (!(grpcEndpoint in GRPC_CHANNEL)) {
            logger.debug(`Create gRPC Connection: ${endpoint}`);
            GRPC_CHANNEL[grpcEndpoint] = await this.createChannel(endpointInfo);
        }

        return GRPC_CHANNEL[grpcEndpoint];
    }
}

export default new GRPCClient();
