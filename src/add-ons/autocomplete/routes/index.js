import express from 'express';
import asyncHandler from 'express-async-handler';
import { getResources } from '@/add-ons/autocomplete/controllers/resource';
import { getDistinctValues } from '@/add-ons/autocomplete/controllers/distinct';

const router = express.Router();

router.post('/resource', asyncHandler(async (req, res, next) => {
    res.json(await getResources(req.body));
}));

router.post('/distinct', asyncHandler(async (req, res, next) => {
    res.json(await getDistinctValues(req.body));
}));

module.exports = router;
