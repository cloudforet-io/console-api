import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';

const schemaJson = [
    {
        schema_id: 'schema-185a0badd7',
        name: 'AWS Access Key',
        scheme_type: 'secret.Secret.data',
        fields: [ {
            type: 'str',
            is_required: true,
            key: 'aws_access_key_id',
            name: 'Access key ID'
        }, {
            type: 'str',
            is_required: true,
            key: 'aws_secret_access_key',
            name: 'Secret access key'
        },{
            is_required: true,
            key: 'region',
            name: 'AWS Region name',
            type: 'str'
        }]
    }
];

const listSchema = async (params) => {
    const response = {
        results: null,
        total_count: null
    };

    if(params.schema_id){
        const result = [];
        schemaJson.map((schema) => {
            if(schema.schema_id === 'schema-185a0badd7'){
                result.push(schema);
            }
        });
        response['results'] = result;
        response['total_count'] = result.length;
    } else {
        response['results'] = schemaJson;
        response['total_count'] = schemaJson.length;

    }
    return response;

};

export {
    listSchema
};
