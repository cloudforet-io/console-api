import express from 'express';
import asyncHandler from 'express-async-handler';
import * as report from '@controllers/report/report';

const router = express.Router();

const controllers = [
    { url: '/create', func: report.createReport },
    { url: '/get-download-url', func: report.getDownloadUrl },
    { url: '/get', func: report.getReport },
    { url: '/list', func: report.listReports },
    { url: '/stat', func: report.statReports }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
