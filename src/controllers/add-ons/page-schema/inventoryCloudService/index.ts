import fs from 'fs';

import ejs from 'ejs';
import httpContext from 'express-http-context';
import _, { isArray } from 'lodash';

import { GetSchemaParams, UpdateSchemaParams } from '@controllers/add-ons/page-schema';
import grpcClient from '@lib/grpc-client';
import redisClient from '@lib/redis';

import adminDetailsSchema from './admin-schema/details.json';
import adminDetailsMultipleSchema from './admin-schema/details_multiple.json';
import detailsSchema from './default-schema/details.json';
import detailsMultipleSchema from './default-schema/details_multiple.json';

// import defaultWidgetSchema from './default-schema/widget.json';


type Options = Required<GetSchemaParams>['options']

// eslint-disable-next-line no-undef
const SCHEMA_DIR = __dirname + '/default-schema/';
const ADMIN_SCHEMA_DIR = __dirname + '/admin-schema/';
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

const loadDefaultSchema = (schema, includeWorkspaceInfo) => {
    const schemaDir = (includeWorkspaceInfo)? ADMIN_SCHEMA_DIR: SCHEMA_DIR;
    const buffer = fs.readFileSync(schemaDir + `${schema}.json.tmpl`);
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
        if (isMultiple) {
            metadataSchema = _.get(metadata, key) || [];
        } else {
            metadataSchema = _.get(metadata, key) || {};
        }

    } else {
        Object.keys(metadata).forEach((provider) => {
            const providerMetadataSchema = _.get(metadata[provider], key) || [];
            if (providerMetadataSchema) {
                if (isMultiple) {
                    if (isArray(providerMetadataSchema)) {
                        metadataSchema = [...metadataSchema, ...providerMetadataSchema];
                    } else {
                        metadataSchema.push(providerMetadataSchema);
                    }

                } else {
                    metadataSchema = providerMetadataSchema;
                }

            }
        });
    }
    return metadataSchema;
};

const getCustomSchemaKey = (schema: string, resourceType: string,  { provider, cloud_service_group, cloud_service_type }: Options) => {
    const userType = httpContext.get('user_type');
    const userId = httpContext.get('user_id');
    return `console:${userType}:${userId}:page-schema:${resourceType}?provider=${provider}&cloud_service_group=${cloud_service_group}&cloud_service_type=${cloud_service_type}:${schema}`;
};

const getCustomSchema = async (schema: string, resourceType: string, options: Options) => {
    const client = await getClient('config');
    const { results } =  await client['UserConfig'].list({
        // eslint-disable-next-line max-len
        name: getCustomSchemaKey(schema, resourceType, options)
    });
    return results[0]?.data;
};

const getTableSchema = (schema: any, isMultiple: boolean) => {
    const fields = schema.options.fields;
    const rootPath = schema.options.root_path;
    const schemaType = (schema.type === 'table') ? 'query-search-table' : schema.type;

    const tableSchema: any = {
        name: schema.name,
        type: schemaType,
        options: {
            fields: [],
            search: [
                {
                    title: 'Properties',
                    items: schema.options.search || []
                }
            ],
            unwind: schema.options.unwind || {},
            default_sort: schema.options.default_sort || {},
            default_filter: schema.options.default_filter || []
        }
    };

    if (rootPath) {
        tableSchema.options.unwind = {
            path: rootPath
        };
    }

    if (isMultiple) {
        tableSchema.options.fields.push({
            key: 'reference.resource_id',
            name: 'Resource ID'
        });
        tableSchema.options.fields.push({
            key: 'name',
            name: 'Resource Name'
        });

        tableSchema.options.default_sort = {
            key: 'reference.resource_id'
        };
    }

    for(const field of fields) {
        const key = (rootPath) ? `${rootPath}.${field.key}` : field.key;
        tableSchema.options.fields.push({
            key: key,
            name: field.name,
            type: field.type,
            reference: field.reference,
            options: field.options
        });

        if (schema.type === 'table') {
            tableSchema.options.search[0].items.push({
                key: key,
                name: field.name,
                options: {}
            });
        }
    }

    return tableSchema;
};

const convertMultipleSchema = (schemas: Array<any>) => {
    const convertedSchema = [] as any;
    for(const schema of schemas) {
        if (['query-search-table', 'simple-table', 'table'].indexOf(schema.type) > -1) {
            convertedSchema.push(getTableSchema(schema, true));
        }
    }
    return convertedSchema;
};

const convertTableSchema = (schemas: any) => {
    const convertedSchema = [] as any;
    for(const schema of schemas) {
        if (['query-search-table', 'simple-table', 'table'].indexOf(schema.type) > -1) {
            convertedSchema.push(getTableSchema(schema, false));
        } else {
            convertedSchema.push(schema);
        }
    }
    return convertedSchema;
};

const getSchema = async ({ schema, resource_type, options = {} }: GetSchemaParams) => {
    const includeWorkspaceInfo = options.include_workspace_info || false;

    if (schema === 'details') {
        const cloudServiceInfo = await getCloudServiceInfo(options);

        let cloudServiceTypeSubDataLayouts = [] as any;
        const subDataReferences = getMetadataSchema(cloudServiceInfo.metadata, 'view.sub_data.reference', true);
        for(const subDataReference of subDataReferences) {
            const options = subDataReference.options || {};

            if (options.provider && options.cloud_service_group && options.cloud_service_type) {
                const cloudServiceTypeInfo = await getCloudServiceTypeInfo(options);
                const subDataLayout = getMetadataSchema(cloudServiceTypeInfo.metadata, 'view.sub_data.layouts', false);
                cloudServiceTypeSubDataLayouts = [...cloudServiceTypeSubDataLayouts, ...subDataLayout];
            }
        }

        const subDataLayouts = getMetadataSchema(cloudServiceInfo.metadata, 'view.sub_data.layouts', true);

        if (options.is_multiple) {
            return {
                details: [
                    (includeWorkspaceInfo)? adminDetailsMultipleSchema: detailsMultipleSchema,
                    ...convertMultipleSchema([
                        ...cloudServiceTypeSubDataLayouts,
                        ...subDataLayouts
                    ])
                ]
            };

        } else {
            return {
                details: [
                    (includeWorkspaceInfo)? adminDetailsSchema: detailsSchema,
                    ...convertTableSchema([
                        ...cloudServiceTypeSubDataLayouts,
                        ...subDataLayouts
                    ]),
                    {
                        name: 'Raw Data',
                        type: 'raw',
                        options: {
                            translation_id: 'PAGE_SCHEMA.RAW_DATA'
                        }
                    }
                ]
            };
        }

    } else {
        checkOptions(options);
        const metadata = await getCloudServiceTypeMetadata(options);
        if (schema === 'widget') {
            const customWidgets = getMetadataSchema(metadata, 'view.widget', true);
            // const defaultWidget: any = _.cloneDeep(defaultWidgetSchema);
            // defaultWidget.query.filter = [
            //     { key: 'provider', value: options.provider, operator: 'eq' },
            //     { key: 'cloud_service_group', value: options.cloud_service_group, operator: 'eq' },
            //     { key: 'cloud_service_type', value: options.cloud_service_type, operator: 'eq' }
            // ];
            const schemaData = {
                widget: [
                    // defaultWidget,
                    ...customWidgets
                ]
            };

            for(const widget of schemaData.widget) {
                if (widget.type === 'summary') {
                    _.set(widget, 'options.value_options.key', 'value');
                    _.set(widget, 'options.value_options.options.default', 0);
                }
            }

            if (options.widget_type) {
                schemaData.widget = schemaData.widget.filter(widget => widget.type === options.widget_type);
            }

            if (options.limit) {
                schemaData.widget = schemaData.widget.slice(0, options.limit);
            }

            return schemaData;

        } else if (schema === 'table') {
            const defaultSort = getMetadataSchema(metadata, 'view.table.layout.options.default_sort', false);
            const defaultFilter = getMetadataSchema(metadata, 'view.table.layout.options.default_filter', false);
            const tableFields = getMetadataSchema(metadata, 'view.table.layout.options.fields', false);

            const defaultSchema = loadDefaultSchema(schema, includeWorkspaceInfo);
            const schemaJSON = ejs.render(defaultSchema, { fields: tableFields });
            const schemaData = JSON.parse(schemaJSON);

            schemaData['options']['default_sort'] = defaultSort;
            schemaData['options']['default_filter'] = defaultFilter;

            if (!options?.include_optional_fields) {
                const customSchemaData = await getCustomSchema(schema, resource_type, options);
                if (customSchemaData) {
                    schemaData.options.fields = customSchemaData.options.fields;
                }
                else {
                    schemaData.options.fields = schemaData.options.fields.filter(d => !d.options?.is_optional);
                }
            }

            const searchFields = getMetadataSchema(metadata, 'view.search', false);
            const searchDefaultSchema = loadDefaultSchema('search', includeWorkspaceInfo);
            const searchSchemaJSON = ejs.render(searchDefaultSchema, { fields: searchFields });
            const searchSchemaData = JSON.parse(searchSchemaJSON);

            schemaData['options']['search'] = searchSchemaData['search'];
            return schemaData;
        } else {
            const searchFields = getMetadataSchema(metadata, 'view.search', false);
            const searchDefaultSchema = loadDefaultSchema('search', includeWorkspaceInfo);
            const searchSchemaJSON = ejs.render(searchDefaultSchema, { fields: searchFields });
            return JSON.parse(searchSchemaJSON);
        }
    }
};

const updateSchema = async ({ schema, resource_type, data, options }: UpdateSchemaParams) => {
    if (schema === 'table') {
        const client = await getClient('config');
        return await client['UserConfig'].set({
            name: getCustomSchemaKey(schema, resource_type, options),
            data
        });
    } else {
        throw new Error('Schema type not supported. (support = table)');
    }
};

export {
    getSchema,
    updateSchema
};
