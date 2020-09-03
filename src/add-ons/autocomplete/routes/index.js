import express from 'express';
import asyncHandler from 'express-async-handler';
import { getAutocomplete } from '@/add-ons/autocomplete/controller';
import { getResources } from '@/add-ons/autocomplete/controllers/resource';
import { getDistinctValues } from '@/add-ons/autocomplete/controllers/distinct';

const router = express.Router();
router.post('/get', asyncHandler(async (req, res, next) => {
    res.json(await getAutocomplete(req.body));
}));

router.post('/resource', asyncHandler(async (req, res, next) => {
    res.json(await getResources(req.body));
}));

router.post('/distinct', asyncHandler(async (req, res, next) => {
    res.json(await getDistinctValues(req.body));
}));

module.exports = router;
