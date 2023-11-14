import httpContext from 'express-http-context';
import _ from 'lodash';

import { GetSchemaParams, UpdateSchemaParams } from '@controllers/add-ons/page-schema';
import grpcClient from '@lib/grpc-client';

import detailsSchema from './default-schema/details.json';
import searchSchema from './default-schema/search.json';
import defaultTableSchema from './default-schema/table.json';
import defaultWidgetSchema from './default-schema/widget.json';


type Options = Required<GetSchemaParams>['options']

const getClient = async (service, version='v1') => {
    return await grpcClient.get(service, version);
};

const getServerInfo = async (options: Options) => {
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

const getCustomSchemaKey = (schema: string, resourceType: string  ) => {
    const userType = httpContext.get('user_type');
    const userId = httpContext.get('user_id');
    return `console:${userType}:${userId}:page-schema:${resourceType}:${schema}`;
};

const getCustomSchema = async (schema: string, resourceType: string) => {
    const client = await getClient('config');
    const { results } =  await client['UserConfig'].list({
        // eslint-disable-next-line max-len
        name: getCustomSchemaKey(schema, resourceType)
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
            search: schema.options.search || []
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
    }

    for(const field of fields) {
        tableSchema.options.fields.push({
            key: `${rootPath}.${field.key}`,
            name: field.name,
            type: field.type,
            options: field.options
        });

        if (schema.type === 'table') {
            tableSchema.options.search.push({
                key: `${rootPath}.${field.key}`,
                name: field.name,
                options: {}
            });
        }
    }

    return tableSchema;
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
    if (schema === 'details') {
        const serverInfo = await getServerInfo(options);
        const subDataLayouts = getMetadataSchema(serverInfo.metadata, 'view.sub_data.layouts', true);

        return {
            details: [
                detailsSchema,
                ...convertTableSchema(subDataLayouts),
                {
                    name: 'Raw Data',
                    type: 'raw',
                    options: {
                        translation_id: 'PAGE_SCHEMA.RAW_DATA'
                    }
                }
            ]
        };
    } else if (schema === 'widget') {
        const schemaData: any = _.cloneDeep(defaultWidgetSchema);

        for (const widget of schemaData.widget) {
            widget.query.filter = [
                { key: 'provider', value: options.provider, operator: 'eq' },
                { key: 'cloud_service_group', value: options.cloud_service_group, operator: 'eq' },
                { key: 'cloud_service_type', value: options.cloud_service_type, operator: 'eq' }
            ];
        }

        if (options.widget_type) {
            schemaData.widget = schemaData.widget.filter(widget => widget.type === options.widget_type);
        }

        if (options.limit) {
            schemaData.widget = schemaData.widget.slice(0, options.limit);
        }

        return schemaData;

    } else if (schema === 'table') {
        let schemaData = _.cloneDeep(defaultTableSchema);
        if (!options.include_optional_fields) {
            const customSchemaData = await getCustomSchema(schema, resource_type);
            if (customSchemaData) schemaData = customSchemaData;
            else {
                schemaData.options.fields = schemaData.options.fields.filter(d => !d.options?.is_optional);
            }
        }

        _.set(schemaData, 'options.search', searchSchema['search']);
        return schemaData;
    } else {
        return searchSchema;
    }
};


const updateSchema = async ({ schema, resource_type, data }: UpdateSchemaParams) => {
    if (schema === 'table') {
        const client = await getClient('config');
        return await client['UserConfig'].set({
            name: getCustomSchemaKey(schema, resource_type),
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
