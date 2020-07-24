import express from 'express';
import asyncHandler from 'express-async-handler';
import { getPageUrl } from '@/add-ons/page-discovery/controller';

const router = express.Router();
router.post('/get', asyncHandler(async (req, res, next) => {
    res.json(await getPageUrl(req.body));
}));

module.exports = router;
