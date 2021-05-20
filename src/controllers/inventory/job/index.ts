import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import { statJobTasks } from '@controllers/inventory/job-task';

const listJobs = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Job.list(params);

    return response;
};

const statJobs = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Job.stat(params);

    return response;
};

const getJobProgress = async (params) => {
    if (!params.job_id) {
        throw new Error('Required Parameter. (key = job_id)');
    }

    const requestParams = {
        query: {
            aggregate: [
                {
                    group: {
                        keys: [
                            {
                                key: 'status',
                                name: 'status'
                            }
                        ],
                        fields: [
                            {
                                name: 'count',
                                operator: 'count'
                            }
                        ]
                    }
                }
            ],
            filter: [
                {
                    k: 'job_id',
                    v: params.job_id,
                    o: 'eq'
                }
            ]
        }
    };

    const statResponse = await statJobTasks(requestParams);

    const response = {
        total: 0,
        succeeded: 0,
        failed: 0
    };

    statResponse.results.forEach((data) => {
        if (data.status === 'SUCCESS') {
            response.succeeded += data.count;
        } else if (data.status === 'FAILURE') {
            response.failed += data.count;
        }

        response.total += data.count;
    });


    return response;
};


export {
    listJobs,
    statJobs,
    getJobProgress
};
