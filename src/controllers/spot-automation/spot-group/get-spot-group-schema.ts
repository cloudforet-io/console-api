import { getPageSchema } from '@controllers/add-ons/page-schema';
import { getSpotGroupResource } from './utils';

const getLayout = async (cloudServiceId, schemaType) => {
    const schema = await getPageSchema({
        resource_type: 'inventory.CloudService',
        schema: 'details',
        options: {
            cloud_service_id: cloudServiceId
        }
    });

    if (schemaType == 'INSTANCE') {
        const layouts = schema.details.filter(layout => layout.name == 'Instances');
        if (layouts.length > 0) {
            return layouts[0];
        }
    } else if (schemaType == 'LOAD_BALANCER') {
        const layouts = schema.details.filter(layout => layout.name == 'ELB');
        if (layouts.length > 0) {
            return layouts[0];
        }
    }

    return {};
};

const getSpotGroupSchema = async (params) => {
    if (!params.spot_group_id) {
        throw new Error('Required Parameter. (key = spot_group_id)');
    }

    if (!params.schema_type) {
        throw new Error('Required Parameter. (key = schema_type)');
    }  else if (['INSTANCE', 'LOAD_BALANCER'].indexOf(params.schema_type) < 0) {
        throw new Error('Invalid Parameter. (schema_type = INSTANCE | LOAD_BALANCER)');
    }

    const spotGroupResourceInfo = await getSpotGroupResource(params.spot_group_id);
    const schema = await getLayout(spotGroupResourceInfo.cloud_service_id, params.schema_type);

    return {
        cloud_service_id: spotGroupResourceInfo.cloud_service_id,
        schema
    };
};

export default getSpotGroupSchema;
