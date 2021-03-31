//@ts-nocheck
import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import httpContext from 'express-http-context';
import { PowerSchedulerSchedulesFactory } from '@factories/statistics/topic/power-scheduler-schedules';
import moment from 'moment-timezone';

const WEEK_OF_DAY_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];


const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'power_scheduler.Schedule',
                    'query': {
                        'aggregate': [{
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
                                    },
                                    {
                                        'name': 'created_at',
                                        'key': 'created_at'
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
                                        'name': 'rule',
                                        'key': 'rule',
                                        'operator': 'first'
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
                'sort': {
                    'key': 'created_at'
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();
    requestParams['aggregate'][0]['query']['query']['filter'].push({
        k: 'project_id',
        v: params.projects,
        o: 'in'
    });

    const dt = moment().tz('UTC');
    const curDay = WEEK_OF_DAY_MAP[dt.day()];
    const curDate = dt.format('YYYY-MM-DD');
    const curHour = Number(dt.format('H'));

    requestParams['aggregate'][2]['join']['query']['filter'].push({
        k: 'rule',
        v: {
            day: curDay,
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

    requestParams['aggregate'][4]['join']['query']['filter'].push({
        k: 'rule',
        v: {
            date: curDate,
            times: curHour
        },
        o: 'match'
    });

    return requestParams;
};

const makeResponse = (projects, results) => {
    const response = {};

    results.forEach((item) => {
        if (!(item.project_id in response)) {
            response[item.project_id] = [];
        }

        const scheduleItem = {
            schedule_id: item.schedule_id,
            name: item.name,
            desired_state: ((item.routine_rule_count > 0 && item.ticket_off_rule_count === 0) ||
                (item.routine_rule_count === 0 && item.ticket_on_rule_count > 0)) ? 'ON': 'OFF'
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

    projects.forEach((projectId) => {
        if (!(projectId in response)) {
            response[projectId] = [];
        }
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
        projects: makeResponse(params.projects, response.results || [])
    };
};

export default powerSchedulerSchedules;
