import express from 'express';
import asyncHandler from 'express-async-handler';
import * as spotGroup from '@controllers/spot-automation/spot-group';
import getSpotGroupServers from '@controllers/spot-automation/spot-group/get-spot-group-servers';
import getSpotGroupInstanceCount from '@controllers/spot-automation/spot-group/get-spot-group-instance-count';
import getSpotGroupInstanceTypes from '@controllers/spot-automation/spot-group/get-spot-group-instance-types';
import getSpotGroupInstanceState from '@controllers/spot-automation/spot-group/get-spot-group-instance-state';
import getSpotGroupInstanceCPU from '@controllers/spot-automation/spot-group/get-spot-group-instance-cpu';
import getSpotGroupInstanceDisk from '@controllers/spot-automation/spot-group/get-spot-group-instance-disk';
import listSpotGroupMembers from '@controllers/spot-automation/spot-group/list-spot-group-members';

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
    { url: '/get-spot-group-instance-count', func: getSpotGroupInstanceCount },
    { url: '/get-spot-group-instance-types', func: getSpotGroupInstanceTypes },
    { url: '/get-spot-group-instance-state', func: getSpotGroupInstanceState },
    { url: '/get-spot-group-instance-cpu', func: getSpotGroupInstanceCPU },
    { url: '/get-spot-group-instance-disk', func: getSpotGroupInstanceDisk },
    { url: '/member/list', func: listSpotGroupMembers},
    { url: '/get-cloud-service-type', func: spotGroup.getCloudServiceType }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
