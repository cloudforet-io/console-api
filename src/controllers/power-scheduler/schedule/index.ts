//@ts-nocheck
import httpContext from 'express-http-context';
import grpcClient from '@lib/grpc-client';
import { deleteResourceGroup } from '@controllers/inventory/resource-group';
import { ScheduleFactory } from '@factories/power-scheduler/schedule';
import moment from 'moment-timezone';
import logger from '@lib/logger';

const WEEK_OF_DAY_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export const SUPPORTED_RESOURCE_TYPES = {
    'inventory.Server?provider=aws&cloud_service_group=EC2&cloud_service_type=Instance': {
        'name': '[AWS] EC2',
        'recommended_title': 'EC2'
    },
    'inventory.CloudService?provider=aws&cloud_service_group=RDS&cloud_service_type=Database': {
        'name': '[AWS] RDS',
        'recommended_title': 'RDS'
    },
    'inventory.CloudService?provider=aws&cloud_service_group=EC2&cloud_service_type=AutoScalingGroup': {
        'name': '[AWS] Auto Scaling Group',
        'recommended_title': 'Auto Scaling Group'
    },
    'inventory.Server?provider=google_cloud&cloud_service_group=ComputeEngine&cloud_service_type=Instance': {
        'name': '[Google] Compute Engine',
        'recommended_title': 'Compute Engine'
    },
    'inventory.CloudService?provider=google_cloud&cloud_service_group=ComputeEngine&cloud_service_type=InstanceGroup': {
        'name': '[Google] Instance Group',
        'recommended_title': 'Instance Group'
    },
    'inventory.CloudService?provider=google_cloud&cloud_service_group=CloudSQL&cloud_service_type=Instance': {
        'name': '[Google] Cloud SQL',
        'recommended_title': 'Cloud SQL'
    }
};

const createSchedule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory(params);
    }

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Schedule.create(params);

    return response;
};

const updateSchedule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory(params);
    }

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Schedule.update(params);

    return response;
};

const enableSchedule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory({state: 'ENABLED'});
    }

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Schedule.enable(params);

    return response;
};

const disableSchedule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory({ state: 'DISABLED' });
    }

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Schedule.disable(params);

    return response;
};

const deleteSchedule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {};
    }

    const scheduleInfo = await getSchedule(params);
    const promises = scheduleInfo.resource_groups.map(async (resourceGroup) => {
        await deleteResourceGroup({
            resource_group_id: resourceGroup.resource_group_id
        });
    });

    await Promise.all(promises);

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Schedule.delete(params);

    return response;
};

const appendResourceGroup = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory(params);
    }

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Schedule.append_resource_group(params);

    return response;
};

const updateResourceGroup = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory(params);
    }

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Schedule.update_resource_group(params);

    return response;
};

const removeResourceGroup = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory(params);
    }

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Schedule.remove_resource_group(params);

    return response;
};

const getSchedule = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ScheduleFactory(params);
    }

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Schedule.get(params);

    return response;
};

const getDesiredState = async (scheduleIds) => {
    const requestParams = {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'power_scheduler.Schedule',
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'name': 'schedule_id',
                                        'key': 'schedule_id'
                                    }
                                ]
                            }
                        }],
                        'filter': []
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'power_scheduler.ScheduleRule',
                    'keys': [
                        'schedule_id'
                    ],
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'name': 'schedule_id',
                                        'key': 'schedule_id'
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'routine_rule_count',
                                        'operator': 'count'
                                    }
                                ]
                            }
                        }],
                        'filter': [
                            {
                                'key': 'rule_type',
                                'value': 'ROUTINE',
                                'operator': 'eq'
                            }
                        ]
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'power_scheduler.ScheduleRule',
                    'keys': [
                        'schedule_id'
                    ],
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'name': 'schedule_id',
                                        'key': 'schedule_id'
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'ticket_on_rule_count',
                                        'operator': 'count'
                                    }
                                ]
                            }
                        }],
                        'filter': [
                            {
                                'key': 'rule_type',
                                'value': 'TICKET',
                                'operator': 'eq'
                            },
                            {
                                'key': 'state',
                                'value': 'RUNNING',
                                'operator': 'eq'
                            }
                        ]
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'power_scheduler.ScheduleRule',
                    'keys': [
                        'schedule_id'
                    ],
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'name': 'schedule_id',
                                        'key': 'schedule_id'
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'ticket_off_rule_count',
                                        'operator': 'count'
                                    }
                                ]
                            }
                        }],
                        'filter': [
                            {
                                'key': 'rule_type',
                                'value': 'TICKET',
                                'operator': 'eq'
                            },
                            {
                                'key': 'state',
                                'value': 'STOPPED',
                                'operator': 'eq'
                            }
                        ]
                    }
                }
            },
            {
                'fill_na': {
                    'data': {
                        'routine_rule_count': 0,
                        'ticket_on_rule_count': 0,
                        'ticket_off_rule_count': 0
                    }
                }
            }
        ]
    };

    requestParams['aggregate'][0]['query']['query']['filter'].push({
        k: 'schedule_id',
        v: scheduleIds,
        o: 'in'
    });
    requestParams['aggregate'][1]['join']['query']['filter'].push({
        k: 'schedule_id',
        v: scheduleIds,
        o: 'in'
    });
    requestParams['aggregate'][2]['join']['query']['filter'].push({
        k: 'schedule_id',
        v: scheduleIds,
        o: 'in'
    });
    requestParams['aggregate'][3]['join']['query']['filter'].push({
        k: 'schedule_id',
        v: scheduleIds,
        o: 'in'
    });

    const dt = moment().tz('UTC');
    const curDay = WEEK_OF_DAY_MAP[dt.day()];
    const curDate = dt.format('YYYY-MM-DD');
    const curHour = Number(dt.format('H'));

    requestParams['aggregate'][1]['join']['query']['filter'].push({
        k: 'rule',
        v: {
            day: curDay,
            times: curHour
        },
        o: 'match'
    });
    requestParams['aggregate'][2]['join']['query']['filter'].push({
        k: 'rule',
        v: {
            date: curDate,
            times: curHour
        },
        o: 'match'
    });
    requestParams['aggregate'][3]['join']['query']['filter'].push({
        k: 'rule',
        v: {
            date: curDate,
            times: curHour
        },
        o: 'match'
    });

    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const response = await statisticsV1.Resource.stat(requestParams);

    const desiredStateInfo = {};
    for (const item of response.results) {
        desiredStateInfo[item.schedule_id] =
            ((item.routine_rule_count > 0 && item.ticket_off_rule_count === 0) ||
            (item.routine_rule_count === 0 && item.ticket_on_rule_count > 0)) ? 'ON': 'OFF';
    }
    return desiredStateInfo;
};

const listSchedules = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {
            results: ScheduleFactory.buildBatch(4),
            total_count: 4
        };
    }

    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Schedule.list(params);

    if (params.include_desired_state) {
        const scheduleIds = response.results.map((scheduleInfo) => {
            return scheduleInfo.schedule_id;
        });

        const desiredStateInfo = await getDesiredState(scheduleIds);
        response.results = response.results.map((scheduleInfo) => {
            scheduleInfo.desired_state = desiredStateInfo[scheduleInfo.schedule_id];
            return scheduleInfo;
        });
    }

    return response;
};

const statSchedules = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Schedule.stat(params);

    return response;
};

const getJobStatus = async (scheduleId) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Job.list({
        job_type: 'APPLY',
        schedule_id: scheduleId,
        status: 'IN_PROGRESS'
    });

    if (response.total_count > 0) {
        if (response.results[0].control_action === 'RUNNING') {
            return 'STARTING';
        } else{
            return 'STOPPING';
        }
    } else {
        return 'NONE';
    }
};

const getScheduleState = async (params) => {
    // Deprecated
    if (!params.schedule_id) {
        throw new Error('Required Parameter. (key = schedule_id)');
    }
    const desiredStateInfo = await getDesiredState([params.schedule_id]);

    return {
        desired_state: desiredStateInfo[params.schedule_id] || 'UNKNOWN',
        job_status: await getJobStatus(params.schedule_id)
    };
};

const getScheduleStatus = async (params) => {
    if (!params.schedule_id) {
        throw new Error('Required Parameter. (key = schedule_id)');
    }
    const desiredStateInfo = await getDesiredState([params.schedule_id]);
    let status =  desiredStateInfo[params.schedule_id] || 'UNKNOWN';

    if (status !== 'UNKNOWN') {
        const jobStatus = await getJobStatus(params.schedule_id) ;
        if (jobStatus !== 'NONE') {
            status = jobStatus;
        }
    }

    return {
        status: status
    };
};

const getSupportedResourceTypes = async (params) => {
    return SUPPORTED_RESOURCE_TYPES;
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
    statSchedules,
    getScheduleState,
    getScheduleStatus,
    getSupportedResourceTypes
};
