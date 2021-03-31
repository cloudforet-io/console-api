import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import httpContext from 'express-http-context';
import { PowerSchedulerSavingCostFactory } from '@factories/statistics/topic/power-scheduler-saving-cost';

// eslint-disable-next-line no-unused-vars
const makeResponse = (results) => {
    const response = {};

    results.forEach((item) => {
        response[item.project_id] = {
            saving_cost: item.saving_cost
        };
    });

    return response;
};

const powerSchedulerSavingCost = async (params) => {
    if (!params.projects) {
        throw new Error('Required Parameter. (key = projects)');
    }

    if (httpContext.get('mock_mode')) {
        return new PowerSchedulerSavingCostFactory(params.projects);
    }

    return new PowerSchedulerSavingCostFactory(params.projects);
};

export default powerSchedulerSavingCost;
