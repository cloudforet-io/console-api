import detailsSchema from './default-schema/details';
import tableSchema from './default-schema/table';
import searchSchema from './default-schema/search';

// eslint-disable-next-line no-unused-vars
const getSchema = async (resourceType, schema, options) => {
    if (schema === 'details') {
        return detailsSchema;
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
