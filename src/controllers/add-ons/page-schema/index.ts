import * as identityServiceAccountSchema from '@controllers/add-ons/page-schema/identityServiceAccount';
import * as inventoryServerSchema from '@controllers/add-ons/page-schema/inventoryServer';
import * as inventoryCloudService from '@controllers/add-ons/page-schema/inventoryCloudService';

const SCHEMA_TYPE = ['table', 'details', 'search'];
const SCHEMA_MAP = {
    'identity.ServiceAccount': identityServiceAccountSchema,
    'inventory.Server': inventoryServerSchema,
    'inventory.CloudService': inventoryCloudService
};

export interface GetSchemaParams {
    resource_type: string;
    schema: typeof SCHEMA_TYPE[number];
    options?: {
        include_id?: boolean;
        include_optional_fields?: boolean;
        provider?: string;
        cloud_service_group?: string;
        cloud_service_type?: string;
        cloud_service_id?: string;
        server_id?: string;
    };
}

export interface UpdateSchemaParams {
    resource_type: string;
    schema: string;
    options: {
        provider?: string;
        cloud_service_group?: string;
        cloud_service_type?: string;
    };
    data: any;
}

const checkParameter = (params: GetSchemaParams) => {
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

    return await SCHEMA_MAP[params.resource_type].getSchema(params);
};

const updatePageSchema = async (params) => {
    checkParameter(params);

    if (!params.data) {
        throw new Error('Required Parameter. (key = data)');
    }

    if (!params.options) {
        params.options = {};
    }

    return await SCHEMA_MAP[params.resource_type].updateSchema(params);
};

export {
    getPageSchema,
    updatePageSchema
};
