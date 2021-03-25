//@ts-nocheck
import * as schedule from './index';
import * as resourceGroup from '@controllers/inventory/resource-group';
import { listServers } from '@controllers/inventory/server';
import { listCloudServices } from '@controllers/inventory/cloud-service';
import { listCloudServiceTypes } from '@controllers/inventory/cloud-service-type';
import { SUPPORTED_RESOURCE_TYPES } from '@controllers/power-scheduler/schedule';
import queryString from 'query-string';
import { tagsToObject } from '@lib/utils';
import logger from '@lib/logger';

const DEFAULT_MAX_PRIORITY = 5;

const getResourceGroupPriority = (resourceGroups) => {
    let maxPriority = DEFAULT_MAX_PRIORITY;
    const resourceGroupData = {};
    resourceGroups.forEach((resourceGroup) => {
        if (resourceGroup.priority > maxPriority) {
            maxPriority = resourceGroup.priority;
        }

        if (!(resourceGroup.priority in resourceGroupData)) {
            resourceGroupData[resourceGroup.priority] = [];
        }

        resourceGroupData[resourceGroup.priority].push(resourceGroup.resource_group_id);
    });

    return [maxPriority, resourceGroupData];
};

const getCloudServiceCountByResourceGroupId = async (resourceGroupId) => {
    const response = await listCloudServices({
        resource_group_id: resourceGroupId,
        query: {
            count_only: true
        }
    });
    return response.total_count;
};

const getCloudServiceCountByProjectId = async (projectId, resourceType) => {
    const resourceTypeArr = resourceType.split('?');
    if (resourceTypeArr.length < 2) {
        return undefined;
    }

    const resourceTypeOptions = queryString.parse(resourceTypeArr[1]);
    const response = await listCloudServices({
        project_id: projectId,
        provider: resourceTypeOptions.provider,
        cloud_service_group: resourceTypeOptions.cloud_service_group,
        cloud_service_type: resourceTypeOptions.cloud_service_type,
        query: {
            count_only: true
        }
    });
    return response.total_count;
};

const getServerCountByResourceGroupId = async (resourceGroupId) => {
    const response = await listServers({
        resource_group_id: resourceGroupId,
        query: {
            count_only: true
        }
    });
    return response.total_count;
};

const getServerCountByProjectId = async (projectId, resourceType) => {
    const resourceTypeArr = resourceType.split('?');
    if (resourceTypeArr.length < 2) {
        return undefined;
    }

    const resourceTypeOptions = queryString.parse(resourceTypeArr[1]);
    const response = await listServers({
        project_id: projectId,
        provider: resourceTypeOptions.provider,
        cloud_service_group: resourceTypeOptions.cloud_service_group,
        cloud_service_type: resourceTypeOptions.cloud_service_type,
        query: {
            count_only: true
        }
    });
    return response.total_count;
};

const getIcon = async (resourceType) => {
    const resourceTypeArr = resourceType.split('?');
    if (resourceTypeArr.length < 2) {
        return undefined;
    }

    const resourceTypeOptions = queryString.parse(resourceTypeArr[1]);
    const response = await listCloudServiceTypes({
        provider: resourceTypeOptions.provider,
        group: resourceTypeOptions.cloud_service_group,
        name: resourceTypeOptions.cloud_service_type,
        query: {
            only: ['tags']
        }
    });

    if (response.results.length > 0) {
        const tags = tagsToObject(response.results[0].tags);
        return tags['spaceone:icon'];
    } else {
        return '';
    }
};

const getResourceInfo = async (resourceGroupId) => {
    const resourceGroupInfo = await resourceGroup.getResourceGroup({ resource_group_id: resourceGroupId });
    const resourceGroupData = {
        name: resourceGroupInfo.name,
        resource_group: {
            resources: resourceGroupInfo.resources,
            resource_group_id: resourceGroupInfo.resource_group_id,
            name: resourceGroupInfo.name,
            options: resourceGroupInfo.options,
            tags: resourceGroupInfo.tags
        },
        count: 0,
        icon: ''
    };

    if (resourceGroupInfo.resources.length > 0) {
        const resourceType = resourceGroupInfo.resources[0].resource_type;
        if (resourceType.startsWith('inventory.Server')) {
            resourceGroupData.count = await getServerCountByResourceGroupId(resourceGroupId);
        } else if (resourceType.startsWith('inventory.CloudService')) {
            resourceGroupData.count = await getCloudServiceCountByResourceGroupId(resourceGroupId);
        }
        resourceGroupData.icon = await getIcon(resourceType) || '';
    }

    return resourceGroupData;
};

const makeResponseData = async (schedule_id, resourceGroups) => {
    const [maxPriority, resourceGroupData] = getResourceGroupPriority(resourceGroups);
    const columns = await Promise.all(Array(maxPriority).fill().map(async (_, i) => {
        const priority = i + 1;
        const column = {
            title: priority.toString(),
            items: [],
            options: {
                priority: priority
            }
        };

        if (priority === 1) {
            column.options.badge = 'HIGH';
        } else if (priority === maxPriority) {
            column.options.badge = 'LOW';
        }

        if (priority in resourceGroupData) {
            const items = await Promise.all(resourceGroupData[priority].map(async (resourceGroupId) => {
                try {
                    return await getResourceInfo(resourceGroupId);
                } catch (e) {
                    logger.error(`RESOURCE GROUP LOAD ERROR: ${e}`);
                    await schedule.removeResourceGroup({
                        schedule_id: schedule_id,
                        resource_group_id: resourceGroupId
                    });
                    return null;
                }
            }));

            column.items = items.filter(item => item !== null);
        }

        return column;
    }));

    return columns;
};

const getScheduleResourceGroups = async (params) => {
    const response = await schedule.getSchedule(params);
    return {
        columns: await makeResponseData(params.schedule_id, response.resource_groups)
    };
};

const makeCreateResponseData = async (projectId, includeResourceGroup) => {
    const columns = await Promise.all(Array(DEFAULT_MAX_PRIORITY).fill().map(async (_, i) => {
        const priority = i + 1;
        const column = {
            title: priority.toString(),
            items: [],
            options: {
                priority: priority
            }
        };

        if (priority === 1) {
            column.options.badge = 'HIGH';

            if (includeResourceGroup) {
                const items = await Promise.all(Object.keys(SUPPORTED_RESOURCE_TYPES).map(async (resourceType) => {
                    const resourceGroupData = {
                        'name': SUPPORTED_RESOURCE_TYPES[resourceType]['recommended_title'],
                        'resource_group': {
                            'name': SUPPORTED_RESOURCE_TYPES[resourceType]['recommended_title'],
                            'resources': [{
                                'resource_type': resourceType,
                                'filter': []
                            }],
                            'options': {},
                            'tags': []
                        },
                        'recommended': true
                    };

                    if (resourceType.startsWith('inventory.Server')) {
                        resourceGroupData.count = await getServerCountByProjectId(projectId, resourceType);
                    } else if (resourceType.startsWith('inventory.CloudService')) {
                        resourceGroupData.count = await getCloudServiceCountByProjectId(projectId, resourceType);
                    }
                    resourceGroupData.icon = await getIcon(resourceType) || '';

                    return resourceGroupData;
                }));

                column.items = items.filter(item => item.count > 0);
            }

        } else if (priority === DEFAULT_MAX_PRIORITY) {
            column.options.badge = 'LOW';
        }

        return column;
    }));

    return columns;
};

const getCreateScheduleResourceGroups = async (params) => {
    if (!params.project_id) {
        throw new Error('Required Parameter. (key = project_id)');
    }

    const response = await schedule.listSchedules({
        project_id: params.project_id,
        query: {
            count_only: true
        }
    });

    if (response.total_count === 0) {
        return {
            columns: await makeCreateResponseData(params.project_id, true)
        };
    } else {
        return {
            columns: await makeCreateResponseData(params.project_id, false)
        };
    }
};

const setResourceGroup = async (items, scheduleId, projectId, priority) => {
    let resourceGroupIds = await Promise.all(items.map(async (item) => {
        if (item.recommended) {
            return null;
        } else {
            if(item.resource_group.resource_group_id) {
                const response = await resourceGroup.updateResourceGroup({
                    resource_group_id: item.resource_group.resource_group_id,
                    name: item.resource_group.name,
                    resources: item.resource_group.resources,
                    options: item.resource_group.options,
                    tags: item.resource_group.tags || [],
                    project_id: projectId
                });

                await schedule.updateResourceGroup({
                    schedule_id: scheduleId,
                    resource_group_id: response.resource_group_id,
                    priority: priority
                });

                return response.resource_group_id;

            } else {
                const response = await resourceGroup.createResourceGroup({
                    name: item.resource_group.name,
                    resources: item.resource_group.resources,
                    options: item.resource_group.options,
                    tags: item.resource_group.tags || [],
                    project_id: projectId
                });

                await schedule.appendResourceGroup({
                    schedule_id: scheduleId,
                    resource_group_id: response.resource_group_id,
                    priority: priority
                });

                return response.resource_group_id;
            }
        }
    }));

    resourceGroupIds = resourceGroupIds.filter(resourceGroupId => resourceGroupId !== null);

    return resourceGroupIds;
};

const getProjectIdAndResourceGroupIds = async (scheduleId) => {
    const response = await schedule.getSchedule({
        schedule_id: scheduleId,
        only: ['project_id', 'resource_groups']
    });

    const resourceGroupIds = response.resource_groups.map((resourceGroupInfo) => {
        return resourceGroupInfo.resource_group_id;
    });

    return [response.project_id, resourceGroupIds];
};

const deleteResourceGroups = async (scheduleId, oldResourceGroups, newResourceGroups) => {
    const resourceGroupIds = oldResourceGroups.filter(x => !newResourceGroups.includes(x));
    const promises = resourceGroupIds.map(async (resourceGroupId) => {
        await schedule.removeResourceGroup({
            schedule_id: scheduleId,
            resource_group_id: resourceGroupId
        });

        await resourceGroup.deleteResourceGroup({
            resource_group_id: resourceGroupId
        });
    });

    await Promise.all(promises);
};

const setScheduleResourceGroups = async (params) => {
    if (!params.schedule_id) {
        throw new Error('Required Parameter. (key = schedule_id)');
    }

    const scheduleId = params.schedule_id;
    const [projectId, resourceGroupIds] = await getProjectIdAndResourceGroupIds(scheduleId);

    const columns = params.columns || [];
    const changedResourceGroups = await Promise.all(columns.map(async (column) => {
        if (!column.options || !column.options.priority) {
            throw new Error('Required Parameter. (key = columns.options.priority)');
        }

        const priority = column.options.priority;
        const items = column.items || [];
        return await setResourceGroup(items, scheduleId, projectId, priority);

    }));

    await deleteResourceGroups(scheduleId, resourceGroupIds, changedResourceGroups.flat());

    return {};
};

export {
    getScheduleResourceGroups,
    getCreateScheduleResourceGroups,
    setScheduleResourceGroups
};
