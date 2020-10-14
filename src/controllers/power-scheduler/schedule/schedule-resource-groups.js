import { getSchedule } from './index';
import { getResourceGroup } from '@controllers/inventory/resource-group';
import { listServers } from '@controllers/inventory/server';
import { listCloudServices } from '@controllers/inventory/cloud-service';
import { listCloudServiceTypes } from '@controllers/inventory/cloud-service-type';
import queryString from 'query-string';
import logger from '@lib/logger';

const getResourceGroupPriority = (resourceGroups) => {
    let maxPriority = 1;
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

const getCloudServiceCount = async (resourceGroupId) => {
    const response = await listCloudServices({
        resource_group_id: resourceGroupId,
        query: {
            count_only: true
        }
    });
    return response.total_count;
};

const getServerCount = async (resourceGroupId) => {
    const response = await listServers({
        resource_group_id: resourceGroupId,
        query: {
            count_only: true
        }
    });
    return response.total_count;
};

const getCloudServiceIcon = async (resourceType) => {
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
        return response.results[0].tags['spaceone:icon'];
    } else {
        return undefined;
    }
};

const getResourceInfo = async (resourceGroupId) => {
    const resourceGroupInfo = await getResourceGroup({ resource_group_id: resourceGroupId });
    const resourceGroupData = {
        resource_group_id: resourceGroupInfo.resource_group_id,
        name: resourceGroupInfo.name,
        resource_group: resourceGroupInfo
    };

    if (resourceGroupInfo.resources.length > 0) {
        const resourceType = resourceGroupInfo.resources[0].resource_type;
        if (resourceType.startsWith('inventory.Server')) {
            resourceGroupData.count = await getServerCount(resourceGroupId);
            resourceGroupData.icon = 'server-icon.svg';
        } else if (resourceType.startsWith('inventory.CloudService')) {
            resourceGroupData.count = await getCloudServiceCount(resourceGroupId);
            resourceGroupData.icon = await getCloudServiceIcon(resourceType) || 'cloud-service-icon.svg';
        } else {
            resourceGroupData.count = 0;
            resourceGroupData.icon = null;
        }

    } else {
        resourceGroupData.count = 0;
        resourceGroupData.icon = null;
    }

    return resourceGroupData;
};

const makeResponseData = async (resourceGroups) => {
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
            column.items = await Promise.all(resourceGroupData[priority].map(async (resourceGroupId) => {
                return await getResourceInfo(resourceGroupId);
            }));
        }

        return column;
    }));

    return columns;
};

const getScheduleResourceGroups = async (params) => {
    const response = await getSchedule(params);
    return {
        columns: await makeResponseData(response.resource_groups)
    };
};

export {
    getScheduleResourceGroups
};
