import express from 'express';
import asyncHandler from 'express-async-handler';

import billingSummary from '@controllers/statistics/topic/billing-summary';
import cloudServiceByRegion from '@controllers/statistics/topic/cloud-service-by-region';
import cloudServiceResources from '@controllers/statistics/topic/cloud-service-resources';
import cloudServiceSummary from '@controllers/statistics/topic/cloud-service-summary';
import dailyCloudServiceSummary from '@controllers/statistics/topic/daily-cloud-service-summary';
import dailyJobSummary from '@controllers/statistics/topic/daily-job-summary';
import dailyUpdateCloudService from '@controllers/statistics/topic/daily-update-cloud-service';
import phdCountByType from '@controllers/statistics/topic/phd-count-by-type';
import phdEvents from '@controllers/statistics/topic/phd-events';
import phdSummary from '@controllers/statistics/topic/phd-summary';
import powerSchedulerResources from '@controllers/statistics/topic/power-scheduler-resources';
import powerSchedulerSchedules from '@controllers/statistics/topic/power-scheduler-schedules';
import projectPage from '@controllers/statistics/topic/project-page';
import resourceByRegion from '@controllers/statistics/topic/resource-by-region';
import secretCount from '@controllers/statistics/topic/secret-count';
import serviceAccountByProvider from '@controllers/statistics/topic/service-account-by-provider';
import serviceAccountSummary from '@controllers/statistics/topic/service-account-summary';
import topProject from '@controllers/statistics/topic/top-project';
import trustedAdvisorByProject from '@controllers/statistics/topic/trusted-advisor-by-project';
import trustedAdvisorSummary from '@controllers/statistics/topic/trusted-advisor-summary';

const router = express.Router();

const controllers = [
    { url: '/cloud-service-resources', func: cloudServiceResources },
    { url: '/cloud-service-summary', func: cloudServiceSummary },
    { url: '/daily-cloud-service-summary', func: dailyCloudServiceSummary },
    { url: '/project-page', func: projectPage },
    { url: '/top-project', func: topProject },
    { url: '/daily-job-summary', func: dailyJobSummary },
    { url: '/service-account-by-provider', func: serviceAccountByProvider },
    { url: '/daily-update-cloud-service', func: dailyUpdateCloudService },
    { url: '/service-account-summary', func: serviceAccountSummary },
    { url: '/resource-by-region', func: resourceByRegion },
    { url: '/cloud-service-by-region', func: cloudServiceByRegion },
    { url: '/power-scheduler-resources', func: powerSchedulerResources },
    { url: '/power-scheduler-schedules', func: powerSchedulerSchedules },
    { url: '/secret-count', func: secretCount },
    { url: '/trusted-advisor-summary', func: trustedAdvisorSummary },
    { url: '/trusted-advisor-by-project', func: trustedAdvisorByProject },
    { url: '/phd-summary', func: phdSummary },
    { url: '/phd-events', func: phdEvents },
    { url: '/phd-count-by-type', func: phdCountByType },
    { url: '/billing-summary', func: billingSummary }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
