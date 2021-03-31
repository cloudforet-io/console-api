import detailsSchema from './default-schema/details.json';
import tableSchema from './default-schema/table.json';
import searchSchema from './default-schema/search.json';
import grpcClient from '@lib/grpc-client';
import _ from 'lodash';


const getClient = async (service, version='v1') => {
    return await grpcClient.get(service, version);
};

const getServerInfo = async (options) => {
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

// eslint-disable-next-line no-unused-vars
const getSchema = async (resourceType, schema, options) => {
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
        const schemaData = _.cloneDeep(tableSchema);
        if (options.include_id === true) {
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

export {
    getSchema
};
