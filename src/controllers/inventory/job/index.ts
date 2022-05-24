import { statJobTasks } from '@controllers/inventory/job-task';
import grpcClient from '@lib/grpc-client';

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

    const jobResponse = await listJobs({ job_id: params.job_id });

    if (jobResponse.total_count === 0) {
        throw new Error(`Job could not be bound. (job_id = ${params.job_id})`);
    }

    const jobStatus = jobResponse.results[0].status;

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
        job_status: jobStatus,
        job_task_status: {
            total: 0,
            succeeded: 0,
            failed: 0
        }
    };

    statResponse.results.forEach((data) => {
        if (data.status === 'SUCCESS') {
            response.job_task_status.succeeded += data.count;
        } else if (data.status === 'FAILURE') {
            response.job_task_status.failed += data.count;
        }

        response.job_task_status.total += data.count;
    });


    return response;
};


export {
    listJobs,
    statJobs,
    getJobProgress
};
