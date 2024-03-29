import grpcClient from '@lib/grpc-client';

const getDefaultQuery = () => {
    return {
        aggregate: [
            {
                query: {
                    resource_type: 'monitoring.ProjectAlertConfig',
                    query: {
                        aggregate: [
                            {
                                group: {
                                    keys: [
                                        {
                                            key: 'project_id',
                                            name: 'project_id'
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            },
            {
                join: {
                    resource_type: 'monitoring.Alert',
                    keys: [
                        'project_id'
                    ],
                    query: {
                        aggregate: [
                            {
                                group: {
                                    keys: [
                                        {
                                            key: 'project_id',
                                            name: 'project_id'
                                        }
                                    ]
                                }
                            }
                        ],
                        filter: [
                            {
                                key: 'state',
                                value: [
                                    'TRIGGERED',
                                    'ACKNOWLEDGED'
                                ],
                                operator: 'in'
                            }
                        ]
                    },
                    extend_data: {
                        is_issued: true
                    }
                }
            },
            {
                fill_na: {
                    data: {
                        is_issued: false
                    }
                }
            }
        ]
    };
};

const currentProjectStatus = async () => {
    const statistics = await grpcClient.get('statistics');
    const requestParams = getDefaultQuery();
    return await statistics.Resource.stat(requestParams);
};

export default currentProjectStatus;

