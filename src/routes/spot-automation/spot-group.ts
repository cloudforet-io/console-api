import express from 'express';
import asyncHandler from 'express-async-handler';
import * as spotGroup from '@controllers/spot-automation/spot-group';
import getSpotGroupServers from '@controllers/spot-automation/spot-group/get-spot-group-servers';
import getSpotGroupResources from '@controllers/spot-automation/spot-group/get-spot-group-resources';
import getSpotGroupInstanceCount from '@controllers/spot-automation/spot-group/get-spot-group-instance-count-v1';
import getSpotGroupInstanceCountHistory from '@controllers/spot-automation/spot-group/get-spot-group-instance-count-history';
import getSpotGroupInstanceTypes from '@controllers/spot-automation/spot-group/get-spot-group-instance-types';
import getSpotGroupInstanceState from '@controllers/spot-automation/spot-group/get-spot-group-instance-state';
import getSpotGroupInstanceCPU from '@controllers/spot-automation/spot-group/get-spot-group-instance-cpu';
import getSpotGroupInstanceDisk from '@controllers/spot-automation/spot-group/get-spot-group-instance-disk';
import getSpotGroupLoadBalancerCount from '@controllers/spot-automation/spot-group/get-spot-group-loadbalancer-count';
import getCloudServiceInstanceCount from '@controllers/spot-automation/spot-group/get-cloud-service-instance-count';
import listSpotGroupMembers from '@controllers/spot-automation/spot-group/list-spot-group-members';
import getSpotGroupMetrics from '@controllers/spot-automation/spot-group/get-spot-group-metrics';
import getSpotGroupSchema from '@controllers/spot-automation/spot-group/get-spot-group-schema';
import getSpotGroupCloudServiceType from '@controllers/spot-automation/spot-group/get-spot-group-cloud-service-type';
import getSpotGroupInterrupt from '@controllers/spot-automation/spot-group/get-spot-group-interrupt';
import getSpotGroupInterruptHistory from '@controllers/spot-automation/spot-group/get-spot-group-interrupt-history';
import getSpotGroupInterruptSummary from '@controllers/spot-automation/spot-group/get-spot-group-interrupt-summary';
import getSpotGroupSavingCost from '@controllers/spot-automation/spot-group/get-spot-group-saving-cost';
import getSpotGroupSavingCostHistory from '@controllers/spot-automation/spot-group/get-spot-group-saving-cost-history';

const router = express.Router();

const controllers = [
    { url: '/create', func: spotGroup.createSpotGroup },
    { url: '/update', func: spotGroup.updateSpotGroup },
    { url: '/delete', func: spotGroup.deleteSpotGroup },
    { url: '/get', func: spotGroup.getSpotGroup },
    { url: '/list', func: spotGroup.listSpotGroups },
    { url: '/interrupt', func: spotGroup.interruptSpotGroups },
    { url: '/stat', func: spotGroup.statSpotGroups },
    { url: '/get-candidates', func: spotGroup.getCandidates },
    { url: '/get-supported-resource-types', func: spotGroup.getSupportedResourceTypes },
    { url: '/get-spot-group-servers', func: getSpotGroupServers },
    { url: '/get-spot-group-resources', func: getSpotGroupResources },
    { url: '/get-spot-group-metrics', func: getSpotGroupMetrics },
    { url: '/get-spot-group-schema', func: getSpotGroupSchema },
    { url: '/get-spot-group-instance-count', func: getSpotGroupInstanceCount },
    { url: '/get-spot-group-instance-count-history', func: getSpotGroupInstanceCountHistory },
    { url: '/get-spot-group-instance-types', func: getSpotGroupInstanceTypes },
    { url: '/get-spot-group-instance-state', func: getSpotGroupInstanceState },
    { url: '/get-spot-group-instance-cpu', func: getSpotGroupInstanceCPU },
    { url: '/get-spot-group-instance-disk', func: getSpotGroupInstanceDisk },
    { url: '/get-spot-group-loadbalancer-count', func: getSpotGroupLoadBalancerCount },
    { url: '/get-cloud-service-instance-count', func: getCloudServiceInstanceCount },
    { url: '/member/list', func: listSpotGroupMembers },
    { url: '/get-spot-group-cloud-service-type', func: getSpotGroupCloudServiceType },
    { url: '/get-spot-group-interrupt', func: getSpotGroupInterrupt },
    { url: '/get-spot-group-interrupt-history', func: getSpotGroupInterruptHistory },
    { url: '/get-spot-group-interrupt-summary', func: getSpotGroupInterruptSummary },
    { url: '/get-spot-group-saving-cost', func: getSpotGroupSavingCost },
    { url: '/get-spot-group-saving-cost-history', func: getSpotGroupSavingCostHistory }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
