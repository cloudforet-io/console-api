import httpContext from 'express-http-context';
import grpcClient from '@lib/grpc-client';
import { ScheduleFactory } from '@factories/power-scheduler/schedule';
import logger from '@lib/logger';

const createSchedule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory(params);
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.Schedule.create(params);

    return response;
};

const updateSchedule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory(params);
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.Schedule.update(params);

    return response;
};

const enableSchedule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory({ state: 'ENABLED' });
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.Schedule.enable(params);

    return response;
};

const disableSchedule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory({ state: 'DISABLED' });
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.Schedule.disable(params);

    return response;
};

const deleteSchedule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {};
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.Schedule.delete(params);

    return response;
};

const appendResourceGroup = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory(params);
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.Schedule.append_resource_group(params);

    return response;
};

const updateResourceGroup = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory(params);
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.Schedule.update_resource_group(params);

    return response;
};

const removeResourceGroup = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory(params);
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.Schedule.remove_resource_group(params);

    return response;
};

const getSchedule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory(params);
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.Schedule.get(params);

    return response;
};

const listSchedules = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {
            results: ScheduleFactory.buildBatch(4),
            total_count: 4
        };
    }

    throw new Error('This API only supports Mock Mode. Set Mock-Mode = true in the request header.');

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.Schedule.list(params);

    return response;
};

const statSchedules = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    let response = await powerSchedulerV1.Schedule.stat(params);

    return response;
};

export {
    createSchedule,
    updateSchedule,
    enableSchedule,
    disableSchedule,
    deleteSchedule,
    appendResourceGroup,
    updateResourceGroup,
    removeResourceGroup,
    getSchedule,
    listSchedules,
    statSchedules
};
