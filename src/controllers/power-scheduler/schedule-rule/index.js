import httpContext from 'express-http-context';
import grpcClient from '@lib/grpc-client';
import { ScheduleRuleFactory } from '@factories/power-scheduler/schedule-rule';
import logger from '@lib/logger';

const createScheduleRule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleRuleFactory(params);
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.ScheduleRule.create(params);

    return response;
};

const updateScheduleRule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleRuleFactory(params);
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.ScheduleRule.update(params);

    return response;
};

const deleteScheduleRule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {};
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.ScheduleRule.delete(params);

    return response;
};

const getScheduleRule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleRuleFactory(params);
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.ScheduleRule.get(params);

    return response;
};

const listScheduleRules = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {
            results: [
                new ScheduleRuleFactory({rule_type: 'ROUTINE', state: 'RUNNING'}),
                new ScheduleRuleFactory({rule_type: 'TICKET', state: 'RUNNING'}),
                new ScheduleRuleFactory({rule_type: 'TICKET', state: 'STOPPED'})
            ],
            total_count: 3
        };
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.ScheduleRule.list(params);

    return response;
};

const statScheduleRules = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.ScheduleRule.stat(params);

    return response;
};

export {
    createScheduleRule,
    updateScheduleRule,
    deleteScheduleRule,
    getScheduleRule,
    listScheduleRules,
    statScheduleRules
};
