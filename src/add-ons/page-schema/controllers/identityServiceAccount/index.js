import ejs from 'ejs';
import _ from 'lodash';
import fs from 'fs';
import grpcClient from '@lib/grpc-client';

// eslint-disable-next-line no-undef
const SCHEMA_DIR = __dirname + '/default-schema/';

const getClient = async (service, version) => {
    return await grpcClient.get(service, version);
};

const checkOptions = (options) => {
    if (!options.provider) {
        throw new Error('Required Parameter. (key = options.provider)');
    }
};

const parseResourceType = (resourceType) => {
    const [service, resource] = resourceType.split('.');
    return [service, resource];
};

const getProviderFields = (serviceAccountInfo) => {
    let fields = [];
    const properties = _.get(serviceAccountInfo, 'template.service_account.schema.properties');
    if (properties) {
        fields = Object.keys(properties).map((key) => {
            return {
                key: key,
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
    const [service, resource] = parseResourceType('identity.Provider');
    const client = await getClient(service);
    const response = await client[resource].get({provider: options.provider});
    const fields = getProviderFields(response);
    const defaultSchema = loadDefaultSchema(schema);
    const schemaData = ejs.render(defaultSchema, {fields});
    return JSON.parse(schemaData);
};

export {
    getSchema
};
