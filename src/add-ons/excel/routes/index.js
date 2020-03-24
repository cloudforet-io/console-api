import express from 'express';
import asyncHandler from 'express-async-handler';
import * as excel from '@/add-ons/excel/controllers';

const router = express.Router();
const controllers = [
    { url: '/export', func: excel.exportExcel }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req));
    }));
});
// eslint-disable-next-line no-undef
module.exports = router;
