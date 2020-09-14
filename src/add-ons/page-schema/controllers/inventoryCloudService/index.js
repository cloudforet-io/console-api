import ejs from 'ejs';
import _ from 'lodash';
import fs from 'fs';
import detailsSchema from './default-schema/details';
import redisClient from '@lib/redis';
import grpcClient from '@lib/grpc-client';

// eslint-disable-next-line no-undef
const SCHEMA_DIR = __dirname + '/default-schema/';
const CACHE_KEY_PREFIX = 'add-ons:page-schema:inventoryCloudService';

const getClient = async (service, version) => {
    return await grpcClient.get(service, version);
};

const checkOptions = (options) => {
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

const getCloudServiceTypeInfo = async (options) => {
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

const getCloudServiceTypeMetadata = async (options) => {
    let metadata;

    const redis = await redisClient.connect();
    const metadataCache = await redis.get(`${CACHE_KEY_PREFIX}:${options.provider}:${options.cloud_service_group}:${options.cloud_service_type}`);
    if (metadataCache) {
        metadata = JSON.parse(metadataCache);
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

const getSchema = async (resourceType, schema, options) => {
    checkOptions(options);

    if (schema === 'details') {
        return detailsSchema;
    } else {
        const metadata = await getCloudServiceTypeMetadata(options);
        if (schema === 'table') {
            const tableFields = _.get(metadata, 'view.table.layout.options.fields') || [];

            const defaultSchema = loadDefaultSchema(schema);
            const schemaJSON = ejs.render(defaultSchema, {fields: tableFields});
            const schemaData = JSON.parse(schemaJSON);

            const searchFields = _.get(metadata, 'view.search') || [];
            const searchDefaultSchema = loadDefaultSchema('search');
            const searchSchemaJSON = ejs.render(searchDefaultSchema, {fields: searchFields});
            const searchSchemaData = JSON.parse(searchSchemaJSON);

            schemaData['options']['search'] = searchSchemaData['search'];
            return schemaData;
        } else {
            const searchFields = _.get(metadata, 'view.search') || [];
            const searchDefaultSchema = loadDefaultSchema('search');
            let searchSchemaJSON = ejs.render(searchDefaultSchema, {fields: searchFields});
            return JSON.parse(searchSchemaJSON);
        }
    }
};

export {
    getSchema
};
