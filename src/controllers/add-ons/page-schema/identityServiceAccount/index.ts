import ejs from 'ejs';
import _ from 'lodash';
import fs from 'fs';
import redisClient from '@lib/redis';
import grpcClient from '@lib/grpc-client';
import httpContext from 'express-http-context';
import {GetSchemaParams, UpdateSchemaParams} from '@controllersadd-ons/page-schema';

// eslint-disable-next-line no-undef
const SCHEMA_DIR = __dirname + '/default-schema/';
const CACHE_KEY_PREFIX = 'add-ons:page-schema:identityServiceAccount';

const getClient = async (service, version='v1') => {
    return await grpcClient.get(service, version);
};

type Options = Required<GetSchemaParams>['options']

const checkOptions = (options: Options) => {
    if (!options.provider) {
        throw new Error('Required Parameter. (key = options.provider)');
    }
};

const getProviderInfo = async (options: Options) => {
    const service = 'identity';
    const resource = 'Provider';
    const client = await getClient(service);
    return await client[resource].get({provider: options.provider, only: ['template']});
};

const getProviderFields = async (options: Options) => {
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

const getCustomSchemaKey = (schema: string, resourceType: string, {provider}: Options) => {
    const userType = httpContext.get('user_type');
    const userId = httpContext.get('user_id');
    return `console:${userType}:${userId}:page-schema:${resourceType}?provider=${provider}:${schema}`;
};

const getCustomSchema = async (schema: string, resourceType: string, options: Options) => {
    const client = await getClient('config');
    const {results} =  await client['UserConfig'].list({
        name: getCustomSchemaKey(schema, resourceType, options)
    });
    return results[0]?.data;
};

const getSchema = async ({schema, resource_type, options = {}}: GetSchemaParams) => {
    checkOptions(options);

    const fields = await getProviderFields(options);
    const defaultSchema = loadDefaultSchema(schema);
    const schemaJSON = ejs.render(defaultSchema, {fields});
    let schemaData = JSON.parse(schemaJSON);

    if (schema === 'table') {
        if (!options.include_optional_fields) {
            const customSchemaData = await getCustomSchema(schema, resource_type, options);
            if (customSchemaData) schemaData = customSchemaData;
            else {
                schemaData.options.fields = schemaData.options.fields.filter(d => !d.options?.is_optional);
            }
        }

        const searchDefaultSchema = loadDefaultSchema('search');
        const searchSchemaJSON = ejs.render(searchDefaultSchema, {fields});
        const searchSchemaData = JSON.parse(searchSchemaJSON);
        schemaData['options']['search'] = searchSchemaData['search'];
    }

    if (options.include_id === true) {
        schemaData.options.fields.unshift({
            key: 'service_account_id',
            name: 'ID'
        });
    }

    return schemaData;
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
