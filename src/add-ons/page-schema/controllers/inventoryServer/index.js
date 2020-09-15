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


// eslint-disable-next-line no-unused-vars
const getSchema = async (resourceType, schema, options) => {
    if (schema === 'details') {
        const serverInfo = await getServerInfo(options);
        const subDataLayouts = _.get(serverInfo.metadata, 'view.sub_data.layouts') || [];

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
