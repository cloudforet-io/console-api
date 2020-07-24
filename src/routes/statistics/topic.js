import express from 'express';
import asyncHandler from 'express-async-handler';
import cloudServiceTypePage from '@controllers/statistics/topic/cloud-service-type-page';
import projectPage from '@controllers/statistics/topic/project-page';
import serverCount from '@controllers/statistics/topic/server-count';
import dailyServerCount from '@controllers/statistics/topic/daily-server-count';
import projectCount from '@controllers/statistics/topic/project-count';
import dailyProjectCount from '@controllers/statistics/topic/daily-project-count';
import cloudServiceCount from '@controllers/statistics/topic/cloud-service-count';
import dailyCloudServiceCount from '@controllers/statistics/topic/daily-cloud-service-count';
import topProject from '@controllers/statistics/topic/top-project';
import dailyJobSummary from '@controllers/statistics/topic/daily-job-summary';
import serviceAccountByProvider from '@controllers/statistics/topic/service-account-by-provider';
import dailyUpdateServer from '@controllers/statistics/topic/daily-update-server';
import dailyUpdateCloudService from '@controllers/statistics/topic/daily-update-cloud-service';
import serviceAccountSummary from '@controllers/statistics/topic/service-account-summary';
import serverByRegion from '@controllers/statistics/topic/server-by-region';
import cloudServiceByRegion from '@controllers/statistics/topic/cloud-service-by-region';

const router = express.Router();

const controllers = [
    { url: '/cloud-service-type-page', func: cloudServiceTypePage },
    { url: '/project-page', func: projectPage },
    { url: '/server-count', func: serverCount },
    { url: '/daily-server-count', func: dailyServerCount },
    { url: '/project-count', func: projectCount },
    { url: '/daily-project-count', func: dailyProjectCount },
    { url: '/cloud-service-count', func: cloudServiceCount },
    { url: '/daily-cloud-service-count', func: dailyCloudServiceCount },
    { url: '/top-project', func: topProject },
    { url: '/daily-job-summary', func: dailyJobSummary },
    { url: '/service-account-by-provider', func: serviceAccountByProvider },
    { url: '/daily-update-server', func: dailyUpdateServer },
    { url: '/daily-update-cloud-service', func: dailyUpdateCloudService },
    { url: '/service-account-summary', func: serviceAccountSummary },
    { url: '/server-by-region', func: serverByRegion },
    { url: '/cloud-service-by-region', func: cloudServiceByRegion }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
