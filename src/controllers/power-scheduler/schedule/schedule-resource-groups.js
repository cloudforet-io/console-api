import { getSchedule } from './index';
import { getResourceGroup } from '@controllers/inventory/resource-group';
import faker from 'faker';
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

const getResourceInfo = async (resourceGroupId) => {
    const response = await getResourceGroup({ resource_group_id: resourceGroupId });
    return {
        resource_group_id: response.resource_group_id,
        name: response.name,
        count: faker.random.number(3),
        icon: faker.random.arrayElement([
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/AWS-Lambda.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-Elastic-Block-Store-EBS.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-RDS.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/AWS-Secrets-Manager.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-DocumentDB.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-EC2-Container-Registry.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Elastic-Load-Balancing.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-API-Gateway.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-EC2_Elastic-IP-Address_light-bg.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-S3.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-Elastic-Kubernetes-Service.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-SNS.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-Elastic-File-System_EFS.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-DynamoDB.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-EC2-Auto-Scaling.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/AWS-Key-Management-Service.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-SQS.svg',
            'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-VPC_VPN-Gateway_dark-bg.svg'
        ])
    };
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
            column.options.badge = 'LOW';
        } else if (priority === maxPriority) {
            column.options.badge = 'HIGH';
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
