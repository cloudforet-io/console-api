import express from 'express';
import asyncHandler from 'express-async-handler';
import cloudServiceResources from '@controllers/statistics/topic/cloud-service-resources';
import cloudServiceSummary from '@controllers/statistics/topic/cloud-service-summary';
import dailyCloudServiceSummary from '@controllers/statistics/topic/daily-cloud-service-summary';
import cloudServiceTypePage from '@controllers/statistics/topic/cloud-service-type-page';
import projectPage from '@controllers/statistics/topic/project-page';
import serverCount from '@controllers/statistics/topic/server-count';
import serverByProvider from '@controllers/statistics/topic/server-by-provider';
import dailyServerCount from '@controllers/statistics/topic/daily-server-count';
import projectCount from '@controllers/statistics/topic/project-count';
import dailyProjectCount from '@controllers/statistics/topic/daily-project-count';
import cloudServiceCount from '@controllers/statistics/topic/cloud-service-count';
import dailyStorageCount from '@controllers/statistics/topic/daily-storage-count';
import dailyDatabaseCount from '@controllers/statistics/topic/daily-database-count';
import dailyCloudServiceCount from '@controllers/statistics/topic/daily-cloud-service-count';
import topProject from '@controllers/statistics/topic/top-project';
import dailyJobSummary from '@controllers/statistics/topic/daily-job-summary';
import serviceAccountByProvider from '@controllers/statistics/topic/service-account-by-provider';
import dailyUpdateServer from '@controllers/statistics/topic/daily-update-server';
import dailyUpdateCloudService from '@controllers/statistics/topic/daily-update-cloud-service';
import serviceAccountSummary from '@controllers/statistics/topic/service-account-summary';
import serverByRegion from '@controllers/statistics/topic/server-by-region';
import cloudServiceByRegion from '@controllers/statistics/topic/cloud-service-by-region';
import powerSchedulerResources from '@controllers/statistics/topic/power-schedule-resources';
import powerSchedulerSchedules from '@controllers/statistics/topic/power-schedule-schedules';
import powerSchedulerSavingCost from '@controllers/statistics/topic/power-schedule-saving-cost';
import secretCount from '@controllers/statistics/topic/secret-count';

const router = express.Router();

const controllers = [
    { url: '/cloud-service-resources', func: cloudServiceResources },
    { url: '/cloud-service-summary', func: cloudServiceSummary },
    { url: '/daily-cloud-service-summary', func: dailyCloudServiceSummary },
    { url: '/cloud-service-type-page', func: cloudServiceTypePage },
    { url: '/project-page', func: projectPage },
    { url: '/server-count', func: serverCount },
    { url: '/server-by-provider', func: serverByProvider },
    { url: '/daily-server-count', func: dailyServerCount },
    { url: '/project-count', func: projectCount },
    { url: '/daily-project-count', func: dailyProjectCount },
    { url: '/cloud-service-count', func: cloudServiceCount },
    { url: '/daily-storage-count', func: dailyStorageCount },
    { url: '/daily-database-count', func: dailyDatabaseCount },
    { url: '/daily-cloud-service-count', func: dailyCloudServiceCount },
    { url: '/top-project', func: topProject },
    { url: '/daily-job-summary', func: dailyJobSummary },
    { url: '/service-account-by-provider', func: serviceAccountByProvider },
    { url: '/daily-update-server', func: dailyUpdateServer },
    { url: '/daily-update-cloud-service', func: dailyUpdateCloudService },
    { url: '/service-account-summary', func: serviceAccountSummary },
    { url: '/server-by-region', func: serverByRegion },
    { url: '/cloud-service-by-region', func: cloudServiceByRegion },
    { url: '/power-scheduler-resources', func: powerSchedulerResources },
    { url: '/power-scheduler-schedules', func: powerSchedulerSchedules },
    { url: '/power-scheduler-saving-cost', func: powerSchedulerSavingCost },
    { url: '/secret-count', func: secretCount }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
