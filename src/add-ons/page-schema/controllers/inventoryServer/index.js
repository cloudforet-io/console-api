import detailsSchema from './default-schema/details';
import tableSchema from './default-schema/table';
import searchSchema from './default-schema/search';
import grpcClient from '@lib/grpc-client';
import _ from 'lodash';


const getClient = async (service, version) => {
    return await grpcClient.get(service, version);
};

const getServerInfo = async (options) => {
    if (!options.server_id) {
        throw new Error('Required Parameter. (key = options.server_id)');
    }

    const service = 'inventory';
    const resource = 'Server';
    const client = await getClient(service);
    const response = await client[resource].list({
        server_id: options.server_id,
        query: {
            only: ['metadata']
        }

    });

    if (response.total_count === 0) {
        throw new Error(`Server not exists. (server_id = ${options.server_id})`);
    }

    return response.results[0];
};

const getMetadataSchema = (metadata, key, isMultiple) => {
    let metadataSchema = [];

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
            'details': [detailsSchema, ...subDataLayouts, {name: 'Raw Data', type: 'raw'}]
        };
    } else if (schema === 'table') {
        const schema = tableSchema;
        schema['options']['search'] = searchSchema['search'];
        return schema;
    } else {
        return searchSchema;
    }
};

export {
    getSchema
};
