import ejs from 'ejs';
import _ from 'lodash';
import fs from 'fs';
import redisClient from '@lib/redis';
import grpcClient from '@lib/grpc-client';

// eslint-disable-next-line no-undef
const SCHEMA_DIR = __dirname + '/default-schema/';
const CACHE_KEY_PREFIX = 'add-ons:page-schema:identityServiceAccount';

const getClient = async (service, version='v1') => {
    return await grpcClient.get(service, version);
};

const checkOptions = (options) => {
    if (!options.provider) {
        throw new Error('Required Parameter. (key = options.provider)');
    }
};

const getProviderInfo = async (options) => {
    const service = 'identity';
    const resource = 'Provider';
    const client = await getClient(service);
    return await client[resource].get({provider: options.provider, only: ['template']});
};

const getProviderFields = async (options) => {
    let providerTemplate;

    const redis = await redisClient.connect();
    const providerTemplateCache = await redis.get(`${CACHE_KEY_PREFIX}:${options.provider}`);
    if (providerTemplateCache) {
        if (typeof providerTemplateCache === 'string') {
            providerTemplate = JSON.parse(providerTemplateCache);
        }
    } else {
        const providerInfo = await getProviderInfo(options);
        providerTemplate = providerInfo.template;
        redis.set(`${CACHE_KEY_PREFIX}:${options.provider}`, JSON.stringify(providerTemplate), 300);
    }

    let fields = [] as any;
    const properties = _.get(providerTemplate, 'service_account.schema.properties');
    if (properties) {
        fields = Object.keys(properties).map((key) => {
            return {
                key:`data.${key}`,
                name: properties[key].title || key
            };
        });
    }
    return fields;
};

const loadDefaultSchema = (schema) => {
    const buffer = fs.readFileSync(SCHEMA_DIR + `${schema}.json.tmpl`);
    return buffer.toString();
};

const getSchema = async (resourceType, schema, options) => {
    checkOptions(options);

    const fields = await getProviderFields(options);
    const defaultSchema = loadDefaultSchema(schema);
    const schemaJSON = ejs.render(defaultSchema, {fields});
    const schemaData = JSON.parse(schemaJSON);

    if (options.include_id === true) {
        schemaData.options.fields.unshift({
            key: 'service_account_id',
            name: 'ID'
        });
    }

    if (schema === 'table') {
        const searchDefaultSchema = loadDefaultSchema('search');
        const searchSchemaJSON = ejs.render(searchDefaultSchema, {fields});
        const searchSchemaData = JSON.parse(searchSchemaJSON);
        schemaData['options']['search'] = searchSchemaData['search'];
    }

    return schemaData;
};

export {
    getSchema
};
