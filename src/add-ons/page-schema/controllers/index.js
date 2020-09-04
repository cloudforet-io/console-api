import * as identityServiceAccountSchema from '@/add-ons/page-schema/controllers/identityServiceAccount';
import * as inventoryServerSchema from '@/add-ons/page-schema/controllers/inventoryServer';

const SCHEMA_TYPE = ['table', 'details', 'search'];
const SCHEMA_MAP = {
    'identity.ServiceAccount': identityServiceAccountSchema,
    'inventory.Server': inventoryServerSchema
};

const checkParameter = (params) => {
    const resourceType = params.resource_type;
    const schema = params.schema;
    if (!resourceType) {
        throw new Error('Required Parameter. (key = resource_type)');
    }

    if (Object.keys(SCHEMA_MAP).indexOf(resourceType) < 0) {
        throw new Error(`Resource type not supported. (support = ${Object.keys(SCHEMA_MAP).join(' | ')})`);
    }

    if (!schema) {
        throw new Error('Required Parameter. (key = schema)');
    }

    if (SCHEMA_TYPE.indexOf(schema) < 0) {
        throw new Error(`Schema not supported. (support = ${SCHEMA_TYPE.join(' | ')})`);
    }
};

const getPageSchema = async (params) => {
    checkParameter(params);

    if (!params.options) {
        params.options = {};
    }

    return await SCHEMA_MAP[params.resource_type].getSchema(params.resource_type, params.schema, params.options);
};

export {
    getPageSchema
};
