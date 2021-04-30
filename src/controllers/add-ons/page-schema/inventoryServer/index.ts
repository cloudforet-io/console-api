import detailsSchema from './default-schema/details.json';
import defaultTableSchema from './default-schema/table.json';
import searchSchema from './default-schema/search.json';
import grpcClient from '@lib/grpc-client';
import _ from 'lodash';
import httpContext from 'express-http-context';
import {GetSchemaParams, UpdateSchemaParams} from '@controllersadd-ons/page-schema';

type Options = Required<GetSchemaParams>['options']

const getClient = async (service, version='v1') => {
    return await grpcClient.get(service, version);
};

const getServerInfo = async (options: Options) => {
    if (!options.server_id) {
        throw new Error('Required Parameter. (key = options.server_id)');
    }

    const service = 'inventory';
    const resource = 'Server';
    const client = await getClient(service);
    return await client[resource].get({
        server_id: options.server_id,
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
    const {results} =  await client['UserConfig'].list({
        // eslint-disable-next-line max-len
        name: getCustomSchemaKey(schema, resourceType)
    });
    return results[0]?.data;
};

const getSchema = async ({schema, resource_type, options = {}}: GetSchemaParams) => {
    if (schema === 'details') {
        const serverInfo = await getServerInfo(options);
        const subDataLayouts = getMetadataSchema(serverInfo.metadata, 'view.sub_data.layouts', true);

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
    } else if (schema === 'table') {
        let schemaData = _.cloneDeep(defaultTableSchema);
        if (!options.include_optional_fields) {
            const customSchemaData = await getCustomSchema(schema, resource_type);
            if (customSchemaData) schemaData = customSchemaData;
            else {
                schemaData.options.fields = schemaData.options.fields.filter(d => !d.options?.is_optional);
            }
        }

        if (options?.include_id === true) {
            schemaData.options.fields.unshift({
                key: 'server_id',
                name: 'ID'
            });
        }

        if (options?.include_optional_fields === true) {
            schemaData.options.fields.unshift({
                key: 'server_id',
                name: 'ID'
            });
        }

        schemaData['options']['search'] = searchSchema['search'];
        return schemaData;
    } else {
        return searchSchema;
    }
};


const updateSchema = async ({schema, resource_type, data}: UpdateSchemaParams) => {
    if (schema === 'table') {
        const client = await getClient('config');
        const customSchemaData = await getCustomSchema(schema, resource_type);
        if (customSchemaData) {
            return await client['UserConfig'].update({
                name: getCustomSchemaKey(schema, resource_type),
                data
            });
        } else {
            return await client['UserConfig'].create({
                name: getCustomSchemaKey(schema, resource_type),
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
