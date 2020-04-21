import express from 'express';
import asyncHandler from 'express-async-handler';
import * as cloudService from '@controllers/inventory/cloud-service';
import getData from '@controllers/inventory/cloud-service/get-data';
import listCloudServiceMembers from '@controllers/inventory/cloud-service/list-cloud-service-members';
import { parameterBuilder, setTagRouter } from '@lib/tag/tag-route';

const router = express.Router();
setTagRouter(parameterBuilder(cloudService.listCloudServices,cloudService.updateCloudService,'cloud_service_id',router));
const controllers = [
    { url: '/create', func: cloudService.createCloudService },
    { url: '/update', func: cloudService.updateCloudService },
    { url: '/delete', func: cloudService.deleteCloudServices },
    { url: '/get', func: cloudService.getCloudService },
    { url: '/list', func: cloudService.listCloudServices },
    { url: '/stat', func: cloudService.statCloudServices },
    { url: '/change-region', func: cloudService.changeCloudServiceRegion },
    { url: '/change-project', func: cloudService.changeCloudServiceProject },
    { url: '/member/list', func: listCloudServiceMembers },
    { url: '/get-data', func: getData }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
