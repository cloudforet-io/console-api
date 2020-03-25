import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';
import {schemas} from './static-schema';

const listSchema = async (params) => {
    const response = {
        results: null,
        total_count: null
    };

    if(params.schema_id){
        const result = [];
        schemas.map((schema) => {
            console.log(schema.schema_id);
            if(params.schema_id === schema.schema_id){
                result.push(schema);
            }
        });
        response['results'] = result;
        response['total_count'] = result.length;
    } else {
        response['results'] = schemas;
        response['total_count'] = schemas.length;

    }
    return response;

};

export {
    listSchema
};
