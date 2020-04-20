import express from 'express';
import asyncHandler from 'express-async-handler';
import * as pdf from '@/add-ons/pdf/controllers';

const router = express.Router();
const controllers = [
    { url: '/export', func: pdf.exportPDF }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req));
    }));
});
// eslint-disable-next-line no-undef
module.exports = router;
