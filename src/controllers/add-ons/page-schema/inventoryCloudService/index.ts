import ejs from 'ejs';
import _ from 'lodash';
import fs from 'fs';
import detailsSchema from './default-schema/details.json';
import redisClient from '@lib/redis';
import grpcClient from '@lib/grpc-client';
import {GetSchemaParams, UpdateSchemaParams} from '@controllersadd-ons/page-schema';
import httpContext from 'express-http-context';

type Options = Required<GetSchemaParams>['options']

// eslint-disable-next-line no-undef
const SCHEMA_DIR = __dirname + '/default-schema/';
const CACHE_KEY_PREFIX = 'add-ons:page-schema:inventoryCloudService';

const getClient = async (service, version='v1') => {
    return await grpcClient.get(service, version);
};

const checkOptions = (options: Options) => {
    if (!options.provider) {
        throw new Error('Required Parameter. (key = options.provider)');
    }

    if (!options.cloud_service_group) {
        throw new Error('Required Parameter. (key = options.cloud_service_group)');
    }

    if (!options.cloud_service_type) {
        throw new Error('Required Parameter. (key = options.cloud_Service_type)');
    }
};

const getCloudServiceTypeInfo = async (options: Options) => {
    const service = 'inventory';
    const resource = 'CloudServiceType';
    const client = await getClient(service);
    const response = await client[resource].list({
        provider: options.provider,
        group: options.cloud_service_group,
        name: options.cloud_service_type,
        query: {
            only: ['metadata']
        }

    });

    if (response.total_count === 0) {
        throw new Error(`Cloud service type not exists. (provider = ${options.provider}, cloud_service_group = ${options.cloud_service_group}, cloud_service_type = ${options.cloud_service_type})`);
    }

    return response.results[0];
};

const getCloudServiceTypeMetadata = async (options: Options) => {
    let metadata;

    const redis = await redisClient.connect();
    const metadataCache = await redis.get(`${CACHE_KEY_PREFIX}:${options.provider}:${options.cloud_service_group}:${options.cloud_service_type}`);
    if (metadataCache) {
        if (typeof metadataCache === 'string') {
            metadata = JSON.parse(metadataCache);
        }
    } else {
        const cloudServiceTypeInfo = await getCloudServiceTypeInfo(options);
        metadata = cloudServiceTypeInfo.metadata;
        redis.set(`${CACHE_KEY_PREFIX}:${options.provider}:${options.cloud_service_group}:${options.cloud_service_type}`, JSON.stringify(metadata), 300);
    }

    return metadata;
};

const loadDefaultSchema = (schema) => {
    const buffer = fs.readFileSync(SCHEMA_DIR + `${schema}.json.tmpl`);
    return buffer.toString();
};

const getCloudServiceInfo = async (options: Options) => {
    if (!options.cloud_service_id) {
        throw new Error('Required Parameter. (key = options.cloud_service_id)');
    }

    const service = 'inventory';
    const resource = 'CloudService';
    const client = await getClient(service);
    return await client[resource].get({
        cloud_service_id: options.cloud_service_id,
        only: ['metadata']
    });
};

const getMetadataSchema = (metadata, key, isMultiple) => {
    let metadataSchema = [] as any;

    if ('view' in metadata) {
        metadataSchema = _.get(metadata, key) || [];
    } else {
        Object.keys(metadata).forEach((pluginId) => {
            const pluginMetadataSchema = _.get(metadata[pluginId], key) || [];
            if (pluginMetadataSchema) {
                if (isMultiple) {
                    metadataSchema = [...metadataSchema, ...pluginMetadataSchema];
                } else {
                    metadataSchema = pluginMetadataSchema;
                }

            }
        });
    }
    return metadataSchema;
};

const getCustomSchemaKey = (schema: string, resourceType: string,  {provider, cloud_service_group, cloud_service_type}: Options) => {
    const userType = httpContext.get('user_type');
    const userId = httpContext.get('user_id');
    return `console:${userType}:${userId}:page-schema:${resourceType}?provider=${provider}&cloud_service_group=${cloud_service_group}&cloud_service_type=${cloud_service_type}:${schema}`;
};

const getCustomSchema = async (schema: string, resourceType: string, options: Options) => {
    const client = await getClient('config');
    const {results} =  await client['UserConfig'].list({
        // eslint-disable-next-line max-len
        name: getCustomSchemaKey(schema, resourceType, options)
    });
    return results[0]?.data;
};

const getSchema = async ({schema, resource_type, options = {}}: GetSchemaParams) => {
    if (schema === 'details') {
        const cloudServiceInfo = await getCloudServiceInfo(options);
        const subDataLayouts = getMetadataSchema(cloudServiceInfo.metadata, 'view.sub_data.layouts', true);

        return {
            'details': [
                detailsSchema,
                ...subDataLayouts,
                {
                    name: 'Raw Data',
                    type: 'raw',
                    options: {
                        translation_id: 'PAGE_SCHEMA.RAW_DATA'
                    }
                }
            ]
        };
    } else {
        checkOptions(options);
        const metadata = await getCloudServiceTypeMetadata(options);
        if (schema === 'table') {
            const tableFields = getMetadataSchema(metadata, 'view.table.layout.options.fields', false);

            const defaultSchema = loadDefaultSchema(schema);
            const schemaJSON = ejs.render(defaultSchema, {fields: tableFields});
            let schemaData = JSON.parse(schemaJSON);

            if (!options?.include_optional_fields) {
                const customSchemaData = await getCustomSchema(schema, resource_type, options);
                if (customSchemaData) schemaData = customSchemaData;
                else {
                    schemaData.options.fields = schemaData.options.fields.filter(d => !d.options?.is_optional);
                }
            }

            if (options.include_id === true) {
                schemaData.options.fields.unshift({
                    key: 'cloud_service_id',
                    name: 'ID'
                });
            }

            const searchFields = getMetadataSchema(metadata, 'view.search', false);
            const searchDefaultSchema = loadDefaultSchema('search');
            const searchSchemaJSON = ejs.render(searchDefaultSchema, {fields: searchFields});
            const searchSchemaData = JSON.parse(searchSchemaJSON);

            schemaData['options']['search'] = searchSchemaData['search'];
            return schemaData;
        } else {
            const searchFields = getMetadataSchema(metadata, 'view.search', false);
            const searchDefaultSchema = loadDefaultSchema('search');
            const searchSchemaJSON = ejs.render(searchDefaultSchema, {fields: searchFields});
            return JSON.parse(searchSchemaJSON);
        }
    }
};

const updateSchema = async ({schema, resource_type, data, options}: UpdateSchemaParams) => {
    if (schema === 'table') {
        const client = await getClient('config');
        const customSchemaData = await getCustomSchema(schema, resource_type, options);
        if (customSchemaData) {
            return await client['UserConfig'].update({
                name: getCustomSchemaKey(schema, resource_type, options),
                data
            });
        } else {
            return await client['UserConfig'].create({
                name: getCustomSchemaKey(schema, resource_type, options),
                data
            });
        }
    } else {
        throw new Error('Schema type not supported. (support = table)');
    }
};

export {
    getSchema,
    updateSchema
};
