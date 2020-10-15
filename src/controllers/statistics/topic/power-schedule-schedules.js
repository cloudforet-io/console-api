import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import httpContext from 'express-http-context';
import { PowerSchedulerSchedulesFactory } from '@factories/statistics/topic/power-scheduler-schedules';

const getDefaultQuery = () => {
    return {
        'resource_type': 'power_scheduler.Schedule',
        'query': {
            'aggregate': {
                'group': {
                    'keys': [
                        {
                            'name': 'project_id',
                            'key': 'project_id'
                        },
                        {
                            'name': 'schedule_id',
                            'key': 'schedule_id'
                        },
                        {
                            'name': 'name',
                            'key': 'name'
                        }
                    ]
                }
            },
            'filter': []
        },
        'join': [
            {
                'query': {
                    'aggregate': {
                        'group': {
                            'keys': [
                                {
                                    'name': 'schedule_id',
                                    'key': 'schedule_id'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'rule',
                                    'key': 'rule',
                                    'operator': 'first'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'key': 'rule_type',
                            'value': 'ROUTINE',
                            'operator': 'eq'
                        }
                    ]
                },
                'resource_type': 'power_scheduler.ScheduleRule',
                'keys': [
                    'schedule_id'
                ]
            }
        ]
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();
    requestParams['query']['filter'].push({
        k: 'project_id',
        v: params.projects,
        o: 'in'
    });

    return requestParams;
};

const makeResponse = (results) => {
    const response = {};

    results.forEach((item) => {
        if (!(item.project_id in response)) {
            response[item.project_id] = [];
        }

        const scheduleItem = {
            schedule_id: item.schedule_id,
            name: item.name
        };

        const rule = item.rule || [];

        scheduleItem.rule = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
            const dayRule = {
                day: day,
                times: []
            };

            rule.forEach((r) => {
                if (r.day === day) {
                    dayRule.times = r.times;
                }
            });

            return dayRule;
        });

        response[item.project_id].push(scheduleItem);
    });

    return response;
};

const powerSchedulerSchedules = async (params) => {
    if (!params.projects) {
        throw new Error('Required Parameter. (key = projects)');
    }

    if (httpContext.get('mock_mode')) {
        return new PowerSchedulerSchedulesFactory(params.projects);
    }

    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return {
        projects: makeResponse(response.results || [])
    };
};

export default powerSchedulerSchedules;
